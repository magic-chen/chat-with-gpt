export interface Model {
  created_at: string;
  updated_at: string;
  type: string;
  icon: string;
  src: string;
  id: number;
  name: string;
  prompt: string;
  description: string;
  publish_type: string;
  introduce: string;
  is_favorite: boolean;
};

export interface ModelRequest extends Omit<Model,  'is_favorite'| 'id' | 'created_at' | 'updated_at'> {}
