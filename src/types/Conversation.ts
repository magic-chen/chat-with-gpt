export interface Chat {
  AI: string;
  HUMAN: string;
}

export interface Conversation {
  id?: number;
  user_id: string;
  model_id: number;
  conversation_title: string;
  chats: Chat[];
}

