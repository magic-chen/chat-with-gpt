export interface Chat {
  id?: number;
  AI: string;
  HUMAN: string;
  isEditing?: boolean; 
}

export interface Conversation {
  id?: number;
  user_id: string;
  model_id: number;
  conversation_title: string;
  chats: Chat[];
}

