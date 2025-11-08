import axios from '../../../lib/axios';

export interface Mayor {
  id: number;
  firstName: string;
  lastName: string;
  username?: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'VIEWER' | 'MAYOR';
  cityName?: string;
  country?: string;
  mayorId?: number;
}

export const fetchMayors = async (): Promise<Mayor[]> => {
  try {
    const res = await axios.instance.get('/public/mayors');
    return res.data || [];
  } catch (error) {
    console.error('Failed to load mayors for registration', error);
    throw error;
  }
};

export const registerUser = async (payload: RegisterPayload): Promise<void> => {
  try {
    await axios.instance.post('/auth/register', payload);
  } catch (error) {
    throw error;
  }
};