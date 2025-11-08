import axios from '../../../lib/axios';

export interface Mayor {
  id: number;
  firstName: string;
  lastName: string;
  city?: {
    name: string;
    country: string;
    qualityIndex?: number;
  };
}

export const fetchMayor = async (id: number | string): Promise<Mayor | null> => {
  try {
    const res = await axios.instance.get(`/users/${id}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch mayor data', error);
    return null;
  }
};