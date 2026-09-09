export interface ChatMessagePart {
  type: string;
  content?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts?: ChatMessagePart[];
  content?: string;
  createdAt?: Date | string | number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number | string | Date;
  updatedAt: number | string | Date;
  messages?: any[];
  _messagesLoaded?: boolean;
}

export interface DateGroupedSessions {
  today: ChatSession[];
  yesterday: ChatSession[];
  lastWeek: ChatSession[];
  older: ChatSession[];
}
