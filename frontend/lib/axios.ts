import axiosLib from 'axios';

// Default to the backend dev port (3000) — frontend dev server runs on 3001.
// Consumers should set NEXT_PUBLIC_API_URL in .env.local for other environments.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const instance = axiosLib.create({ baseURL: `${API_BASE}/api` });

function setAuthToken(token: string | null) {
  if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete instance.defaults.headers.common['Authorization'];
}

export default { instance, setAuthToken };
