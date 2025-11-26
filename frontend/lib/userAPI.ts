import axios from './axios';

export class UserAPI {
  static async updatePermissions(userId: number, permissions: Array<{ categoryId: number; canBuild: boolean }>) {
    const response = await axios.instance.put(`/users/${userId}/permissions`, { permissions });
    return response.data;
  }

  static async getAudits(userId: number, opts?: { limit?: number; offset?: number; action?: string; decision?: string; startDate?: string; endDate?: string }) {
    const response = await axios.instance.get(`/users/${userId}/audits`, { params: opts });
    return response.data;
  }
}

export default UserAPI;
