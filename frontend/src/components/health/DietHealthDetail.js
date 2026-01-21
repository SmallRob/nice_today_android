import React from 'react';
import { Link } from 'react-router-dom';

const DietHealthDetail = () => {
  return (
    <div className="diet-health-detail-page">
      <div className="mb-6">
        <Link to="/health-dashboard" className="text-white hover:text-gray-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回健康仪表板
        </Link>
      </div>

      <div className="diet-health-detail-grid gap-4">
        {/* 标题卡片 */}
        <div className="diet-health-detail-card md:col-span-4 p-8 flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-blue"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <i className="fa-solid fa-apple-whole text-4xl text-white"></i>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">饮食健康详情</h1>
                <p className="text-lg text-white/80 mt-2">个性化营养方案与科学饮食指导</p>
              </div>
            </div>
            <div className="mt-6 text-white/90 leading-relaxed">
              <p className="text-xl md:text-2xl font-medium">本页面基于您的年龄阶段和个人需求，提供详细的饮食推荐、营养成分分析以及健康饮食的科学依据，帮助您实现营养均衡、预防疾病、改善健康的目标。</p>
            </div>
          </div>
        </div>

        {/* 推荐食品营养价值说明 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-green"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-seedling text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">推荐食品营养价值</h2>
            </div>
            <div className="space-y-4 flex-grow">
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">膳食纤维 - 控糖控脂的关键</h3>
                <p className="text-white/90 text-base leading-snug">足量的膳食纤维（每日25-30g）可降低血液中胆固醇含量，促进肠道毒素排出，减少结直肠癌的发病风险。富含膳食纤维的食物包括全谷物、蔬菜、水果等，能增强饱腹感，稳定血糖水平。</p>
              </div>
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">Omega-3脂肪酸 - 护心脑营养素</h3>
                <p className="text-white/90 text-base leading-snug">Omega-3脂肪酸（深海鱼、核桃）是构成大脑神经细胞膜的重要成分，能改善记忆力、缓解抑郁情绪，同时调节血脂，促进大脑发育，维持细胞膜功能。</p>
              </div>
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">抗氧化物质 - 延缓衰老的秘密</h3>
                <p className="text-white/90 text-base leading-snug">富含抗氧化物质的食材（如蓝莓、西兰花、坚果）能清除体内自由基，延缓细胞氧化损伤，降低癌症、老年痴呆的发病概率。多食此类食物有助于提升免疫力。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 按目标分类的推荐食品 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-purple"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-list-check text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">按目标分类推荐</h2>
            </div>
            <div className="space-y-4 flex-grow">
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">控糖目标</h3>
                <p className="text-white/90 text-base leading-snug">用魔芋、山药替代精制主食；水果选柚子、草莓（低GI）；避免添加糖，少食多餐稳定血糖。推荐食物：燕麦、糙米、西兰花、菠菜、柚子、草莓。</p>
              </div>
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">增肌目标</h3>
                <p className="text-white/90 text-base leading-snug">增加蛋白质摄入至平时的1.2-2倍，推荐鸡胸肉、三文鱼、鸡蛋、牛奶、豆腐等优质蛋白；搭配适量碳水化合物如藜麦、红薯，为肌肉合成提供能量。</p>
              </div>
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">减脂目标</h3>
                <p className="text-white/90 text-base leading-snug">主食减半（选全谷物），蛋白质增加20%；蔬菜增至600g；控制总热量缺口300-500大卡。推荐食物：鸡胸肉、西兰花、黄瓜、苹果、杏仁。</p>
              </div>
              <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                <h3 className="text-xl font-bold text-white mb-2">养胃目标</h3>
                <p className="text-white/90 text-base leading-snug">选择易消化食物如小米粥、蒸蛋、软烂蔬菜；避免刺激性食物如辣椒、咖啡；定时定量，细嚼慢咽。推荐食物：小米、山药、南瓜、胡萝卜、香蕉。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 营养速查表 - 主食类 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-cyan"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-wheat-awn text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">主食类营养速查</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/30">
                <thead className="bg-white/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">食物（100g）</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">碳水化合物(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">蛋白质(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">膳食纤维(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">核心特点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">糙米</td>
                    <td className="px-4 py-2 text-sm text-white/90">77</td>
                    <td className="px-4 py-2 text-sm text-white/90">7</td>
                    <td className="px-4 py-2 text-sm text-white/90">3.5</td>
                    <td className="px-4 py-2 text-sm text-white/90">全谷物，B族维生素丰富</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">燕麦</td>
                    <td className="px-4 py-2 text-sm text-white/90">66</td>
                    <td className="px-4 py-2 text-sm text-white/90">15</td>
                    <td className="px-4 py-2 text-sm text-white/90">10</td>
                    <td className="px-4 py-2 text-sm text-white/90">含β-葡聚糖，降胆固醇</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">玉米</td>
                    <td className="px-4 py-2 text-sm text-white/90">22</td>
                    <td className="px-4 py-2 text-sm text-white/90">4</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.4</td>
                    <td className="px-4 py-2 text-sm text-white/90">低升糖，含叶黄素</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">红薯</td>
                    <td className="px-4 py-2 text-sm text-white/90">20</td>
                    <td className="px-4 py-2 text-sm text-white/90">1.6</td>
                    <td className="px-4 py-2 text-sm text-white/90">1.6</td>
                    <td className="px-4 py-2 text-sm text-white/90">富含维生素A、钾</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 营养速查表 - 肉类 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-orange"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-drumstick-bite text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">肉类营养速查</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/30">
                <thead className="bg-white/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">食物（100g）</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">蛋白质(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">脂肪(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">核心特点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">鸡胸肉</td>
                    <td className="px-4 py-2 text-sm text-white/90">20</td>
                    <td className="px-4 py-2 text-sm text-white/90">1.5</td>
                    <td className="px-4 py-2 text-sm text-white/90">低脂高蛋白，易吸收</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">瘦牛肉</td>
                    <td className="px-4 py-2 text-sm text-white/90">26</td>
                    <td className="px-4 py-2 text-sm text-white/90">6</td>
                    <td className="px-4 py-2 text-sm text-white/90">富含肌酸、铁元素</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">瘦猪肉</td>
                    <td className="px-4 py-2 text-sm text-white/90">20</td>
                    <td className="px-4 py-2 text-sm text-white/90">7</td>
                    <td className="px-4 py-2 text-sm text-white/90">富含B族维生素</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">三文鱼</td>
                    <td className="px-4 py-2 text-sm text-white/90">22</td>
                    <td className="px-4 py-2 text-sm text-white/90">13</td>
                    <td className="px-4 py-2 text-sm text-white/90">富含Omega-3脂肪酸</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 合理饮食与健康深层关联研究 */}
        <div className="diet-health-detail-card md:col-span-4 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-blue"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <i className="fa-solid fa-brain text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">合理饮食与健康的深层关联研究</h2>
            </div>
            <div className="space-y-6 text-white/90">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">合理饮食的核心准则：从"营养均衡"到"节律适配"</h3>
                <p>营养素的协同作用：人体必需的七大营养素（碳水、蛋白质、脂肪、维生素、矿物质、膳食纤维、水）并非独立发挥作用，而是相互依存、相互制约。例如：蛋白质的合成需要碳水提供能量，维生素D促进钙的吸收，Omega-3脂肪酸辅助脂溶性维生素的转运。偏离均衡的饮食（如高糖低脂、高蛋白低碳）会打破这种协同关系，引发代谢紊乱。</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">合理饮食对健康的核心影响机制</h3>
                <div className="flex flex-col gap-5">
                  <div className="bg-white/20 p-5 rounded-xl border border-white/40 backdrop-blur-md shadow-xl transition-all hover:bg-white/30">
                    <h4 className="text-lg font-bold text-white mb-2 border-l-4 border-white/60 pl-3">1. 预防慢性疾病：从根源降低发病风险</h4>
                    <p className="text-white/90 text-base leading-relaxed">慢性疾病（高血压、糖尿病、高血脂、心血管疾病、部分癌症）的诱因中，饮食因素占比高达60%以上。高钠饮食会升高血压，增加肾脏和心血管负担；长期高精制碳水饮食会导致胰岛素抵抗，诱发2型糖尿病；足量的膳食纤维（每日25-30g）可降低血液中胆固醇含量，促进肠道毒素排出，减少结直肠癌的发病风险。</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-xl border border-white/40 backdrop-blur-md shadow-xl transition-all hover:bg-white/30">
                    <h4 className="text-lg font-bold text-white mb-2 border-l-4 border-white/60 pl-3">2. 调节免疫功能：构建人体"防御屏障"</h4>
                    <p className="text-white/90 text-base leading-relaxed">免疫系统的正常运转依赖充足且均衡的营养供给：蛋白质是免疫细胞（白细胞、淋巴细胞）的主要构成原料，缺乏会导致免疫细胞数量减少、活性下降；维生素C促进抗体合成，维生素A维持呼吸道黏膜完整性，锌元素调节免疫细胞的分化与增殖。</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-xl border border-white/40 backdrop-blur-md shadow-xl transition-all hover:bg-white/30">
                    <h4 className="text-lg font-bold text-white mb-2 border-l-4 border-white/60 pl-3">3. 改善心理状态：饮食影响情绪与认知</h4>
                    <p className="text-white/90 text-base leading-relaxed">饮食与大脑神经递质的合成密切相关，进而影响情绪和认知能力：色氨酸（存在于鸡蛋、牛奶、豆制品中）是合成血清素（"快乐激素"）的前体，缺乏会导致情绪低落、焦虑；Omega-3脂肪酸（深海鱼、核桃）是构成大脑神经细胞膜的重要成分，能改善记忆力、缓解抑郁情绪。</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-xl border border-white/40 backdrop-blur-md shadow-xl transition-all hover:bg-white/30">
                    <h4 className="text-lg font-bold text-white mb-2 border-l-4 border-white/60 pl-3">4. 维持体重与体态：避免代谢综合征</h4>
                    <p className="text-white/90 text-base leading-relaxed">合理饮食通过"控制热量缺口 + 优化营养结构"，实现健康体重的维持，而非单纯的"节食减重"。全谷物、优质蛋白、膳食纤维能增强饱腹感，减少总热量摄入；健康脂肪（牛油果、橄榄油）能延缓胃排空速度，避免暴饮暴食。</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">不同人群的饮食健康侧重点</h3>
                <div className="flex flex-col gap-4">
                  <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                    <h4 className="text-lg font-bold text-white mb-1">久坐上班族</h4>
                    <p className="text-white/90 text-base">需控制精制碳水、高油高盐外卖的摄入，增加膳食纤维和优质蛋白，预防"办公族三高"（高血脂、高血糖、高血压）</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                    <h4 className="text-lg font-bold text-white mb-1">中老年人群</h4>
                    <p className="text-white/90 text-base">侧重补钙（预防骨质疏松）、补优质蛋白（延缓肌肉流失）、控盐控糖（保护心血管和肾脏）</p>
                  </div>
                  <div className="bg-white/20 p-5 rounded-xl border border-white/30 backdrop-blur-sm shadow-lg">
                    <h4 className="text-lg font-bold text-white mb-1">运动人群</h4>
                    <p className="text-white/90 text-base">需在运动前后合理补充碳水（供能）和蛋白质（修复肌肉），避免过度节食或过量进补</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">总结：合理饮食是健康的"底层逻辑"</h3>
                <p className="text-white/90 text-lg leading-relaxed">合理饮食的本质是<strong className="text-white font-bold">"顺应人体生理规律"</strong>，通过食材的选择、营养的搭配、节律的把控，实现"养身"与"养心"的双重目标。它不是短期的"减脂方案"或"治病偏方"，而是贯穿一生的健康生活方式——与运动、作息、心态共同构成人体健康的四大支柱，缺一不可。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 营养速查表 - 蛋类 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-yellow"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-egg text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">蛋类营养速查</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/30">
                <thead className="bg-white/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">食物（100g）</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">蛋白质(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">脂肪(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">核心特点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">鸡蛋</td>
                    <td className="px-4 py-2 text-sm text-white/90">13</td>
                    <td className="px-4 py-2 text-sm text-white/90">9</td>
                    <td className="px-4 py-2 text-sm text-white/90">含优质卵磷脂，性价比高</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">鸭蛋</td>
                    <td className="px-4 py-2 text-sm text-white/90">13</td>
                    <td className="px-4 py-2 text-sm text-white/90">13</td>
                    <td className="px-4 py-2 text-sm text-white/90">维生素E、磷脂含量更高</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">鹌鹑蛋</td>
                    <td className="px-4 py-2 text-sm text-white/90">13</td>
                    <td className="px-4 py-2 text-sm text-white/90">11</td>
                    <td className="px-4 py-2 text-sm text-white/90">B族维生素含量丰富</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">鹅蛋</td>
                    <td className="px-4 py-2 text-sm text-white/90">11</td>
                    <td className="px-4 py-2 text-sm text-white/90">16</td>
                    <td className="px-4 py-2 text-sm text-white/90">富含卵磷脂和蛋白质</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 营养速查表 - 奶制品 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-pink"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-cheese text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">奶制品营养速查</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/30">
                <thead className="bg-white/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">食物（100g）</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">蛋白质(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">脂肪(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">钙(mg)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">核心特点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">牛奶</td>
                    <td className="px-4 py-2 text-sm text-white/90">3.2</td>
                    <td className="px-4 py-2 text-sm text-white/90">3.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">104</td>
                    <td className="px-4 py-2 text-sm text-white/90">优质蛋白，钙含量丰富</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">酸奶</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.5</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.7</td>
                    <td className="px-4 py-2 text-sm text-white/90">118</td>
                    <td className="px-4 py-2 text-sm text-white/90">含益生菌，助消化吸收</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">奶酪</td>
                    <td className="px-4 py-2 text-sm text-white/90">25</td>
                    <td className="px-4 py-2 text-sm text-white/90">25</td>
                    <td className="px-4 py-2 text-sm text-white/90">799</td>
                    <td className="px-4 py-2 text-sm text-white/90">高钙高蛋白浓缩品</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">豆浆</td>
                    <td className="px-4 py-2 text-sm text-white/90">3.0</td>
                    <td className="px-4 py-2 text-sm text-white/90">1.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">10</td>
                    <td className="px-4 py-2 text-sm text-white/90">植物蛋白，含大豆异黄酮</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* 营养速查表 - 水果类 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-red"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-apple-whole text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">水果类营养速查</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/30">
                <thead className="bg-white/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">食物（100g）</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">碳水化合物(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">膳食纤维(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">维生素C(mg)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">核心特点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">苹果</td>
                    <td className="px-4 py-2 text-sm text-white/90">13.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.4</td>
                    <td className="px-4 py-2 text-sm text-white/90">4.6</td>
                    <td className="px-4 py-2 text-sm text-white/90">富含果胶，助消化</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">香蕉</td>
                    <td className="px-4 py-2 text-sm text-white/90">22.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.6</td>
                    <td className="px-4 py-2 text-sm text-white/90">8.7</td>
                    <td className="px-4 py-2 text-sm text-white/90">钾元素丰富，助能量补充</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">蓝莓</td>
                    <td className="px-4 py-2 text-sm text-white/90">14.5</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.4</td>
                    <td className="px-4 py-2 text-sm text-white/90">9.7</td>
                    <td className="px-4 py-2 text-sm text-white/90">抗氧化，护眼明目</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">橙子</td>
                    <td className="px-4 py-2 text-sm text-white/90">11.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.4</td>
                    <td className="px-4 py-2 text-sm text-white/90">53.2</td>
                    <td className="px-4 py-2 text-sm text-white/90">维C丰富，提升免疫</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 营养速查表 - 蔬菜类 */}
        <div className="diet-health-detail-card md:col-span-2 p-8 flex flex-col">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-green"></div>
          <div className="relative flex-grow flex flex-col z-10">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fa-solid fa-leaf text-2xl text-white"></i>
              <h2 className="text-2xl font-bold text-white">蔬菜类营养速查</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/30">
                <thead className="bg-white/20 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">食物（100g）</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">蛋白质(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">膳食纤维(g)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">维生素A(μg)</th>
                    <th className="px-4 py-2 text-xs font-medium text-white uppercase tracking-wider">核心特点</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">西兰花</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.6</td>
                    <td className="px-4 py-2 text-sm text-white/90">31</td>
                    <td className="px-4 py-2 text-sm text-white/90">维C维K丰富，抗氧化</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">菠菜</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.9</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.2</td>
                    <td className="px-4 py-2 text-sm text-white/90">469</td>
                    <td className="px-4 py-2 text-sm text-white/90">叶酸铁元素丰富</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-white/90">胡萝卜</td>
                    <td className="px-4 py-2 text-sm text-white/90">0.9</td>
                    <td className="px-4 py-2 text-sm text-white/90">2.8</td>
                    <td className="px-4 py-2 text-sm text-white/90">4010</td>
                    <td className="px-4 py-2 text-sm text-white/90">胡萝卜素丰富，护视力</td>
                  </tr>
                  <tr className="bg-white/10">
                    <td className="px-4 py-2 text-sm text-white/90">番茄</td>
                    <td className="px-4 py-2 text-sm text-white/90">0.9</td>
                    <td className="px-4 py-2 text-sm text-white/90">1.2</td>
                    <td className="px-4 py-2 text-sm text-white/90">42</td>
                    <td className="px-4 py-2 text-sm text-white/90">番茄红素，抗氧化</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="diet-health-detail-card md:col-span-4 p-8 flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-purple"></div>
          <div className="relative text-center z-10">
            <Link
              to="/healthdashboard"
              className="bg-gradient-to-r from-white/30 to-white/40 text-white text-lg font-bold py-3 px-8 rounded-full hover:from-white/40 hover:to-white/50 transition-all duration-300 backdrop-blur-sm border border-white/30"
            >
              返回健康仪表板
            </Link>
            <p className="mt-4 text-white/80">持续关注饮食健康，构建科学营养生活</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietHealthDetail;