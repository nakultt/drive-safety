// api.ts
import axios from 'axios';

const base = (import.meta as any).env?.VITE_API_URL || '/api';

const instance = axios.create({
  baseURL: base,
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
