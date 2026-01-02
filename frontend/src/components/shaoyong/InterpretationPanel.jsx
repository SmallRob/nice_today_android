import React from 'react';
import './InterpretationPanel.css';

const InterpretationPanel = ({ result }) => {
  // Handle both old and new result formats
  if (result.interpretation) {
    // New format from algorithm module
    const { 
      method,
      question,
      hexagram,
      interpretation 
    } = result;

    // 梅花易数解读原则
    const principles = [
      '体用生克：本卦中无动爻的卦为体卦，有动爻的卦为用卦。体克用吉，用克体凶。',
      '卦气旺衰：根据起卦时节判断五行旺衰，春季木旺，夏季火旺等。',
      '互卦参详：互卦揭示事情发展过程中的隐藏因素。',
      '变卦定果：变卦预示事情最终的发展结果。',
      '外应参考：起卦时的周围环境、声音、现象等可作为参考。'
    ];

    return (
      <div className="interpretation-panel">
        <div className="interpretation-summary">
          <h3>卦象总解</h3>
          <div className="summary-card">
            <h4>{hexagram.name}</h4>
            <p>{interpretation.description}</p>
            <div className="summary-tags">
              <span className="tag fortune-tag">{interpretation.fortune}</span>
              <span className="tag">五行关系：{interpretation.elementInteraction}</span>
            </div>
          </div>
        </div>

        <div className="practical-advice">
          <h3>实践建议</h3>
          <div className="advice-card">
            <p>{interpretation.advice}</p>
          </div>
        </div>

        <div className="meihua-principles">
          <h3>梅花易数解读原则</h3>
          <div className="principles-list">
            {principles.map((principle, index) => (
              <div key={index} className="principle-item">
                <span className="principle-number">{index + 1}</span>
                <p>{principle}</p>
              </div>
            ))}
          </div>
          <div className="note">
            <p><strong>注：</strong>梅花易数强调"心易"，即用心体会卦象，不执着于固定解释。同一卦象在不同情境、不同问卦者心中，解读应有不同。</p>
          </div>
        </div>

        <div className="method-note">
          <h4>关于{method}的说明</h4>
          <p>
            {method === '数字起卦' 
              ? '您选择了数字起卦法，这体现了邵雍"万物皆数"的思想。数字中蕴含天地之理，通过简单数字即可窥探事物规律。'
              : method === '时间起卦'
              ? '您选择了时间起卦法，时间流转中蕴含天地节律。此时此地的时空信息与卦象相应，揭示当下时运。'
              : '您选择了随机起卦法，随机之中蕴含必然。心念一动，卦象即生，反映内心潜意识的提示。'
            }
          </p>
          <p><strong>占卜问题：</strong>{question || '未提供问题'}</p>
        </div>
      </div>
    );
  } else {
    // Fallback to the old format for backward compatibility
    const { 
      originalHexagram, 
      changingLine,
      method
    } = result;

  // 卦象解读数据 (简化版)
  const interpretations = {
    1: {
      name: '乾为天',
      overall: '乾卦象征天，具有创始、通达、适宜、正固的德性。代表刚健进取，自强不息的精神。',
      changingLines: {
        1: '初九：潜龙勿用。时机未到，宜隐藏实力，等待时机。',
        2: '九二：见龙在田，利见大人。开始展现才能，遇到贵人提携。',
        3: '九三：君子终日乾乾，夕惕若厉，无咎。勤奋努力，时刻警惕，可免灾祸。',
        4: '九四：或跃在渊，无咎。进退有据，尝试突破，没有灾祸。',
        5: '九五：飞龙在天，利见大人。达到巅峰，大展宏图，利于见贵人。',
        6: '上九：亢龙有悔。过于高亢，物极必反，需知进退。'
      },
      advice: '当前处于开创阶段，需要积极主动，但也要注意时机。保持刚健而不失中正，勇往直前。'
    },
    2: {
      name: '坤为地',
      overall: '坤卦象征地，具有柔顺、包容、承载万物的德性。代表厚德载物，顺应时势的智慧。',
      changingLines: {
        1: '初六：履霜，坚冰至。看到微霜，要预知坚冰将至，防微杜渐。',
        2: '六二：直方大，不习无不利。正直、方正、宏大，不熟悉也没不利。',
        3: '六三：含章可贞，或从王事，无成有终。蕴含才华，可守正道，跟从君王做事，不居功有善终。',
        4: '六四：括囊，无咎无誉。扎紧口袋，谨慎言行，无灾无誉。',
        5: '六五：黄裳，元吉。穿着黄色下衣，大吉大利。',
        6: '上六：龙战于野，其血玄黄。阴盛至极，与阳交战，两败俱伤。'
      },
      advice: '当前宜采取守势，顺应时势，以柔克刚。培养包容心，厚积薄发。'
    },
    11: {
      name: '地天泰',
      overall: '泰卦象征通达、安泰。天地交而万物通，上下交而志同。是小往大来，吉亨之象。',
      changingLines: {
        1: '初九：拔茅茹，以其汇，征吉。像拔茅草连根而起，同类汇聚，前进吉祥。',
        2: '九二：包荒，用冯河，不遐遗，朋亡，得尚于中行。包容广阔，徒步过河，不遗远人，不结朋党，得行中道。',
        3: '九三：无平不陂，无往不复，艰贞无咎。没有平地不变斜坡，没有只往不返，艰难中守正无灾。',
        4: '六四：翩翩不富，以其邻，不戒以孚。轻飘飘不富有，与邻相处，以诚信不戒备。',
        5: '六五：帝乙归妹，以祉元吉。帝乙嫁妹，得福大吉。',
        6: '上六：城复于隍，勿用师。自邑告命，贞吝。城墙倒塌在壕沟，不宜用兵。从城邑传来命令，守正防憾惜。'
      },
      advice: '目前形势通达顺利，但要注意物极必反。把握时机，积极作为，但勿过度。'
    }
  };

  // 获取解读数据
  const getInterpretation = (hexagramId) => {
    return interpretations[hexagramId] || {
      name: `卦${hexagramId}`,
      overall: '此卦象征变化与转化。阴阳交合，万物化生。',
      changingLines: {
        1: '初爻：起始阶段，宜谨慎小心。',
        2: '二爻：逐渐展现，需把握时机。',
        3: '三爻：面临选择，需明辨是非。',
        4: '四爻：接近目标，需坚持不懈。',
        5: '五爻：达到顶峰，需保持谦逊。',
        6: '上爻：物极必反，需知进退。'
      },
      advice: '顺应自然规律，把握阴阳变化之道。'
    };
  };

  const interpretation = getInterpretation(originalHexagram);
  const changingLineText = interpretation.changingLines[changingLine] || 
    '此爻变动，预示变化将生。需注意观察局势变化。';

  // 梅花易数解读原则
  const principles = [
    '体用生克：本卦中无动爻的卦为体卦，有动爻的卦为用卦。体克用吉，用克体凶。',
    '卦气旺衰：根据起卦时节判断五行旺衰，春季木旺，夏季火旺等。',
    '互卦参详：互卦揭示事情发展过程中的隐藏因素。',
    '变卦定果：变卦预示事情最终的发展结果。',
    '外应参考：起卦时的周围环境、声音、现象等可作为参考。'
  ];

  return (
    <div className="interpretation-panel">
      <div className="interpretation-summary">
        <h3>卦象总解</h3>
        <div className="summary-card">
          <h4>{interpretation.name}</h4>
          <p>{interpretation.overall}</p>
          <div className="summary-tags">
            <span className="tag">本卦</span>
            <span className="tag">体用分析</span>
            <span className="tag">卦气判断</span>
          </div>
        </div>
      </div>

      <div className="changing-line-interpretation">
        <h3>动爻解读 <span className="line-number">第{changingLine}爻</span></h3>
        <div className="changing-line-card">
          <div className="line-header">
            <span className="line-position">
              {changingLine === 1 ? '初爻' : 
               changingLine === 6 ? '上爻' : 
               `${changingLine}爻`}
            </span>
            <span className="line-type">
              {changingLine % 2 === 1 ? '阳爻' : '阴爻'}
            </span>
          </div>
          <p className="line-text">{changingLineText}</p>
          <div className="line-advice">
            <h4>爻辞启示：</h4>
            <p>此爻变动提示您需要关注当前阶段的转变。{changingLine <= 3 ? '事情处于起始或发展阶段，需积极作为。' : '事情接近完成或转变阶段，需谨慎处理。'}</p>
          </div>
        </div>
      </div>

      <div className="practical-advice">
        <h3>实践建议</h3>
        <div className="advice-card">
          <p>{interpretation.advice}</p>
          <div className="advice-details">
            <h4>具体建议：</h4>
            <ul>
              <li>根据体用生克关系，把握主动与被动</li>
              <li>注意观察周围环境的外应提示</li>
              <li>结合互卦分析事情发展中的隐藏因素</li>
              <li>参考变卦预判最终结果，调整当前策略</li>
              <li>保持内心平静，理性分析卦象启示</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="meihua-principles">
        <h3>梅花易数解读原则</h3>
        <div className="principles-list">
          {principles.map((principle, index) => (
            <div key={index} className="principle-item">
              <span className="principle-number">{index + 1}</span>
              <p>{principle}</p>
            </div>
          ))}
        </div>
        <div className="note">
          <p><strong>注：</strong>梅花易数强调"心易"，即用心体会卦象，不执着于固定解释。同一卦象在不同情境、不同问卦者心中，解读应有不同。</p>
        </div>
      </div>

      <div className="method-note">
        <h4>关于{method}的说明</h4>
        <p>
          {method === '数字起卦' 
            ? '您选择了数字起卦法，这体现了邵雍"万物皆数"的思想。数字中蕴含天地之理，通过简单数字即可窥探事物规律。'
            : method === '时间起卦'
            ? '您选择了时间起卦法，时间流转中蕴含天地节律。此时此地的时空信息与卦象相应，揭示当下时运。'
            : '您选择了随机起卦法，随机之中蕴含必然。心念一动，卦象即生，反映内心潜意识的提示。'
          }
        </p>
      </div>
    </div>
  );
  }
};

export default InterpretationPanel;