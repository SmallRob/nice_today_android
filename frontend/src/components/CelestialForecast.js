import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';

const CelestialForecast = ({ zodiac }) => {
  const [forecast, setForecast] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (zodiac) {
      generateForecast();
    }
  }, [zodiac]);

  const generateForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `为${zodiac}生成今天的星象预测，特别关注当前主要行星（如水星、金星、火星）的运行状态对该星座的影响。如果有水星逆行（Mercury Retrograde），请特别提醒。请用简洁、温暖的语言风格。`;
      const result = await aiService.generateCompletion(prompt, { zodiac, date: new Date().toISOString() });
      setForecast(result);
    } catch (err) {
      console.error('Failed to generate celestial forecast:', err);
      setError('无法获取星象预测，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 shadow-xl text-white mt-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">🌌</span> AI 星象预测
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-purple-300 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-red-300 text-sm text-center py-4">{error}</div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{forecast}</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-purple-300/60 text-center italic">
        *基于当前星象的AI解读
      </div>
    </div>
  );
};

export default CelestialForecast;
