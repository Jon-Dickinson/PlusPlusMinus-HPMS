import axios from './axios';

export class UserAPI {
  static async updatePermissions(userId: number, permissions: Array<{ categoryId: number; canBuild: boolean }>) {
    const response = await axios.instance.put(`/users/${userId}/permissions`, { permissions });
    return response.data;
  }
}

export default UserAPI;
