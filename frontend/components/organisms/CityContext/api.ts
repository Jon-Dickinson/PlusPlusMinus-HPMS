import axios from '../../../lib/axios';

export async function loadCityData(cityId: string) {
  try {
    const response = await axios.instance.get(`/cities/${cityId}/data`);
    return response.data;
  } catch (error) {
    console.error('Failed to load city data', error);
    throw error;
  }
}