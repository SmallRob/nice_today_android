import { aiService } from './ai';

export type GenerateAgentPromptInput = {
  name: string;
  keywords: string[];
  description: string;
};

export type GenerateAgentPromptResult = {
  systemPrompt: string;
};

export const buildAgentSystemPromptPrompt = (input: GenerateAgentPromptInput) => {
  const safeKeywords = input.keywords.map((x) => x.trim()).filter(Boolean).slice(0, 12);
  const safeDesc = (input.description || '').trim().slice(0, 1200);
  return [
    '你是一个“系统提示词生成器”。你的任务是为应用内的对话智能体生成一段高质量的系统提示词（System Prompt）。',
    '要求：',
    '1) 输出只包含系统提示词本身，不要加任何解释、标题或代码块标记。',
    '2) 系统提示词必须包含：角色定位、能力边界、输出格式、拒绝策略与澄清提问策略。',
    '3) 不要要求用户提供隐私或敏感信息（精确地址/经纬度/身份证/银行卡/密钥等）。',
    '4) 风格：移动端友好、结构清晰、可执行步骤优先。',
    '',
    `智能体名称：${input.name}`,
    `领域/关键字：${safeKeywords.join('、')}`,
    '智能体作用描述：',
    safeDesc
  ].join('\n');
};

export const generateAgentSystemPrompt = async (input: GenerateAgentPromptInput): Promise<GenerateAgentPromptResult> => {
  const prompt = buildAgentSystemPromptPrompt(input);
  const systemPrompt = (await aiService.generateContent(prompt)).trim();
  if (!systemPrompt) throw new Error('AI 未返回可用的系统提示词');
  return { systemPrompt };
};

