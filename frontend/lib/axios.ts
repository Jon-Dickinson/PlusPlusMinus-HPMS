import axiosLib from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const instance = axiosLib.create({ baseURL: API_BASE })

function setAuthToken(token: string | null) {
  if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete instance.defaults.headers.common['Authorization']
}

export default { instance, setAuthToken }
