// src/config.ts
const API_HOST = import.meta.env.VITE_BACKEND_HOST;

export const apiConfig = {
  conversations: `${API_HOST}/conversations`,
  chat: `${API_HOST}/chat`,
  models: `${API_HOST}/models`,
  select_model: `${API_HOST}/select_model`,
  user: `${API_HOST}/user`,
};
