import React from 'react';
import axios from '../lib/axios';
import {
  HierarchyLevel,
  HierarchyUser,
  AllowedBuildingCategory,
} from '../types/hierarchy';

/**
 * Hierarchy API client for managing hierarchical permissions and structure
 */
export class HierarchyAPI {
  /**
   * Get the complete hierarchy tree structure
   * @returns Promise<HierarchyLevel[]> - Root level hierarchy nodes with nested children
   */
  static async getHierarchyTree(): Promise<HierarchyLevel[]> {
    const response = await axios.instance.get('/hierarchy/tree');
    return response.data;
  }

  /**
   * Get all subordinate users for a given user based on hierarchy
   * @param userId - The user ID to get subordinates for
   * @returns Promise<HierarchyUser[]> - Array of users in subordinate hierarchy levels
   */
  static async getUserSubordinates(userId: number): Promise<HierarchyUser[]> {
    const response = await axios.instance.get(`/hierarchy/users/subordinates/${userId}`);
    return response.data;
  }

  /**
   * Get buildings that a user is allowed to build based on their permissions
   * @param userId - The user ID to check permissions for
   * @returns Promise<AllowedBuildingCategory[]> - Building categories and buildings the user can build
   */
  static async getAllowedBuildings(userId: number): Promise<AllowedBuildingCategory[]> {
    const response = await axios.instance.get(`/hierarchy/buildings/allowed/${userId}`);
    return response.data;
  }

  /**
   * Get the effective permissions for a user (direct + ancestor permissions)
   */
  static async getEffectivePermissions(userId: number): Promise<any[]> {
    const response = await axios.instance.get(`/hierarchy/users/${userId}/effective-permissions`);
    return response.data;
  }
}

/**
 * Hook for managing hierarchy data with React state
 */
export function useHierarchy() {
  const [hierarchyTree, setHierarchyTree] = React.useState<HierarchyLevel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadHierarchyTree = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tree = await HierarchyAPI.getHierarchyTree();
      setHierarchyTree(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hierarchy tree');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadHierarchyTree();
  }, [loadHierarchyTree]);

  return {
    hierarchyTree,
    loading,
    error,
    reload: loadHierarchyTree,
  };
}

export default HierarchyAPI;