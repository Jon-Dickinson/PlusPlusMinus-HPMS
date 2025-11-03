import axiosLib from 'axios';

// Default to backend port 4000 in development to avoid conflict with Next.js on 3000.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// All backend routes are mounted under /api — make the axios instance point at that prefix so
// frontend code can call endpoints like `/auth/login` or `/cities` without repeating `/api`.
const instance = axiosLib.create({ baseURL: `${API_BASE}/api` });

function setAuthToken(token: string | null) {
  if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete instance.defaults.headers.common['Authorization'];
}

export default { instance, setAuthToken };
