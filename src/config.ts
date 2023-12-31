// src/config.ts
const API_HOST = import.meta.env.VITE_BACKEND_HOST;
const UPLOAD_HOST = import.meta.env.VITE_UPLOAD_HOST

export const apiConfig = {
  conversations: `${API_HOST}/conversations`,
  chat: `${API_HOST}/chat`,
  chat_test: `${API_HOST}/chat_test`,
  models: `${API_HOST}/models`,
  model_by_id: `${API_HOST}/model_by_id`,
  user_models: `${API_HOST}/user_model`,
  select_model: `${API_HOST}/select_model`,
  create_model: `${API_HOST}/create_model`,
  update_model: `${API_HOST}/update_model`,
  delete_model: `${API_HOST}/delete_model`,
  user: `${API_HOST}/user`,
  upload_avatar: `${UPLOAD_HOST}/upload_avatar`,
};

export const maxCardReturn = 10;
export const typesConfig = ["教育", "程序", "写作", "图片"]
