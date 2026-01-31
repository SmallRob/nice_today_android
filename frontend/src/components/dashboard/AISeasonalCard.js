import React, { useMemo, useState, useEffect } from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext';
import BiorhythmCalculator from '../../utils/biorhythmCalculator';
import LunarCalendar from '../../utils/lunarCalendar';
import { aiService } from '../../services/aiService';
import './AISeasonalCard.css';

/**
 * AI 时令卡片
 * 结合用户当日生物节律状态 + 时令节气
 * 调用 AI 生成每日生活建议 (支持缓存)
 */
const AISeasonalCard = () => {
  const { currentConfig, globalSettings } = useUserConfig();
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const birthDateStr = currentConfig?.birthDate;
  const nickname = currentConfig?.nickname;
  const gender = currentConfig?.gender;
  const zodiacSign = currentConfig?.zodiac;
  const mbti = currentConfig?.mbti;

  // 0. 检查功能开关
  // 如果全局配置中关闭了首页时令卡片，则直接不渲染
  // 注意：userConfigManager 中的 globalSettings 可能未及时更新，这里优先使用 hook 返回的 globalSettings
  const isFeatureEnabled = globalSettings?.homeTimeAwareEnabled ?? true;

  // 1. 获取今日日期信息
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const dateInfo = useMemo(() => {
    if (!isFeatureEnabled) return null; // 如果功能关闭，不计算

    // 获取农历信息
    const lunar = LunarCalendar.solarToLunar(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    
    const month = today.getMonth() + 1;
    let season = '春';
    if (month >= 3 && month <= 5) season = '春';
    else if (month >= 6 && month <= 8) season = '夏';
    else if (month >= 9 && month <= 11) season = '秋';
    else season = '冬';

    return {
      lunarDate: `${lunar.lunarMonthStr}${lunar.lunarDayStr}`,
      season,
      month
    };
  }, [todayStr, isFeatureEnabled]);

  // 2. 计算生物节律状态
  const rhythmStatus = useMemo(() => {
    if (!birthDateStr) return null;
    
    const birthDate = /^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)
      ? new Date(`${birthDateStr}T00:00:00`)
      : new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null;

    const rhythm = BiorhythmCalculator.calculateBiorhythm(birthDate, today);
    const physicalStatus = BiorhythmCalculator.getRhythmStatus(rhythm.physical);
    const emotionalStatus = BiorhythmCalculator.getRhythmStatus(rhythm.emotional);
    const intellectualStatus = BiorhythmCalculator.getRhythmStatus(rhythm.intellectual);

    const avgScore = (rhythm.physical + rhythm.emotional + rhythm.intellectual) / 3;
    const overallScore = Math.round(((avgScore + 1) / 2) * 100);

    return {
      ...rhythm,
      physicalStatus,
      emotionalStatus,
      intellectualStatus,
      overallScore
    };
  }, [birthDateStr, todayStr]);

  // 3. 加载 AI 建议 (带缓存)
  useEffect(() => {
    if (!isFeatureEnabled) return;

    const fetchAISuggestion = async () => {
      // 检查缓存
      const cacheKey = `ai_seasonal_suggestion_${todayStr}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setAiSuggestion(parsed);
          return;
        } catch (e) {
          console.error("Failed to parse cached AI suggestion", e);
          localStorage.removeItem(cacheKey);
        }
      }

      // 如果没有缓存且有必要的用户信息
      if (rhythmStatus) {
        // 检查全局 AI 开关
        const useAI = globalSettings?.useAIInterpretation ?? true;

        if (!useAI) {
          // 如果 AI 功能关闭，回退到规则引擎生成
          setAiSuggestion({
            content: `正值${dateInfo.season}季，建议顺应时节，${
              dateInfo.season === '春' ? '早睡早起，多去户外踏青' :
              dateInfo.season === '夏' ? '晚睡早起，注意防暑降温' :
              dateInfo.season === '秋' ? '早睡早起，保持平和心态' :
              '早睡晚起，注意防寒保暖'
            }。`,
            tags: ["🌿 养生", "🍵 饮茶"]
          });
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          // 获取更多身体数据 (从 currentConfig 中)
          const healthStatus = {
            height: currentConfig?.height || '未知',
            weight: currentConfig?.weight || '未知',
            menstrualCycle: currentConfig?.menstrualCycle || { status: 'unknown' },
            sleepRhythm: currentConfig?.sleepRhythm || { sleepTime: '未知' },
            exerciseLoad: currentConfig?.exerciseLoad || { steps: 0 }
          };

          const userContext = {
            nickname: nickname || '用户',
            gender: gender,
            age: currentConfig?.age || '未知',
            zodiac: zodiacSign,
            mbti: mbti,
            date: todayStr,
            lunarDate: dateInfo.lunarDate,
            season: dateInfo.season,
            biorhythm: {
              physical: rhythmStatus.physical,
              emotional: rhythmStatus.emotional,
              intellectual: rhythmStatus.intellectual,
              score: rhythmStatus.overallScore
            },
            healthStatus
          };

          const prompt = `
            请作为一位精通中医养生、现代心理学和时令节气的AI助手，根据用户的当日生物节律、时令信息以及身体状态，生成一段简短、温馨且个性化的生活建议。
            
            用户信息：
            - 性别/年龄：${gender}, ${userContext.age}岁
            - 生理周期：${JSON.stringify(healthStatus.menstrualCycle)}
            - 睡眠/运动：${JSON.stringify(healthStatus.sleepRhythm)}, 昨日步数${healthStatus.exerciseLoad.steps}
            
            要求：
            1. **不要使用任何标题**（如"今日建议"等），直接输出正文内容。
            2. 内容要包含对用户状态的精准解读（结合体、情、智三方面）和具体的行动建议。
            3. 如果用户处于特殊生理期（如经期），请给予特别关怀。
            4. 语气要亲切自然，像一位老朋友的叮嘱。
            5. 字数控制在80字以内。
            6. 输出格式为JSON：{"content": "建议内容...", "tags": ["标签1", "标签2"]}，标签不超过3个，最好带emoji。
          `;

          const responseText = await aiService.generateCompletion(prompt, userContext);
          
          // 解析 JSON 响应
          // AI 可能会返回 Markdown 代码块，需要清理
          const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const suggestionData = JSON.parse(jsonStr);

          // 保存到状态和缓存
          setAiSuggestion(suggestionData);
          localStorage.setItem(cacheKey, JSON.stringify(suggestionData));

        } catch (err) {
          console.error("AI Service Error:", err);
          setError("AI 正在休息，暂时无法提供建议");
          // 降级文案
          setAiSuggestion({
            content: `今日${dateInfo.season}意正浓，建议顺应天时，注意身心调节。`,
            tags: ["🌿 养生", "🍵 饮茶"]
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAISuggestion();
  }, [todayStr, rhythmStatus, nickname, dateInfo, isFeatureEnabled, globalSettings, currentConfig]);

  // 如果功能关闭，不渲染任何内容
  if (!isFeatureEnabled) return null;

  // 渲染逻辑
  if (!currentConfig) {
    return (
      <div className="ai-seasonal-card">
        <div className="ai-card-content">
          <div className="loading-placeholder">
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rhythmStatus) {
    return (
      <div className="ai-seasonal-card">
        <div className="ai-card-content">
          <p className="suggestion-text">完善生日信息后，即可解锁 AI 个性化时令建议。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-seasonal-card">
      <div className="ai-card-header">
        <div className="ai-badge">
          <span className="material-symbols-outlined icon">auto_awesome</span>
          AI 时令提醒
        </div>
        <span className="lunar-date">{dateInfo.lunarDate} · {dateInfo.season}季</span>
      </div>
      
      <div className="ai-card-content">
        {isLoading ? (
          <div className="loading-placeholder">
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        ) : (
          <>
            <p className="suggestion-text">{aiSuggestion?.content}</p>
            {aiSuggestion?.tags && aiSuggestion.tags.length > 0 && (
              <div className="suggestion-tags">
                {aiSuggestion.tags.map((tag, index) => (
                  <span key={index} className="suggestion-tag">{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="rhythm-mini-bar">
        <div className="rhythm-item">
          <span className="label">体</span>
          <div className="progress-bg">
            <div 
              className={`progress-fill ${rhythmStatus.physicalStatus.color}`}
              style={{ width: `${((rhythmStatus.physical + 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="rhythm-item">
          <span className="label">情</span>
          <div className="progress-bg">
            <div 
              className={`progress-fill ${rhythmStatus.emotionalStatus.color}`}
              style={{ width: `${((rhythmStatus.emotional + 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="rhythm-item">
          <span className="label">智</span>
          <div className="progress-bg">
            <div 
              className={`progress-fill ${rhythmStatus.intellectualStatus.color}`}
              style={{ width: `${((rhythmStatus.intellectual + 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISeasonalCard;
