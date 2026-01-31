export type AgentKind = 'system' | 'custom';

export type AgentChatRole = 'user' | 'assistant';

export interface AgentDefinition {
  id: string;
  kind: AgentKind;
  name: string;
  icon: string;
  keywords: string[];
  description: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentChatMessage {
  id: string;
  role: AgentChatRole;
  content: string;
  createdAt: string;
  agentId?: string;
}

export interface AgentChatSession {
  id: string;
  title: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  sourceSessionId?: string;
  userConfigConfirmation?: {
    confirmed: boolean;
    confirmedAt: string;
  };
  messages: AgentChatMessage[];
}

export type AgentChatStoreV1 = {
  version: 1;
  agents: AgentDefinition[];
  sessions: AgentChatSession[];
};
