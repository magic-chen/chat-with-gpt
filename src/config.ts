// src/config.ts
const API_HOST = import.meta.env.VITE_BACKEND_HOST;

export const apiConfig = {
  conversations: `${API_HOST}/conversations`,
  chat: `${API_HOST}/chat`,
  chat_test: `${API_HOST}/chat_test`,
  models: `${API_HOST}/models`,
  model_by_id: `${API_HOST}/model_by_id`,
  favorite_models: `${API_HOST}/user_favorite_model`,
  select_model: `${API_HOST}/select_model`,
  create_model: `${API_HOST}/create_model`,
  user: `${API_HOST}/user`,
  upload_avatar: `${API_HOST}/upload_avatar`,
};

export const maxCardReturn = 10;
export const typesConfig = ["教育", "程序", "写作", "图片"]
