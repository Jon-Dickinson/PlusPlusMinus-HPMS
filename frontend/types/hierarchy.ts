// Types for the hierarchical permission system

export interface HierarchyLevel {
  id: number;
  name: string;
  level: number;
  parentId?: number | null;
  createdAt: string;
  children?: HierarchyLevel[];
  users?: BasicUser[];
}

export interface BasicUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: 'ADMIN' | 'MAYOR' | 'VIEWER';
}

export interface HierarchyUser extends BasicUser {
  email: string;
  hierarchy?: {
    id: number;
    name: string;
    level: number;
  };
}

export interface UserPermission {
  id: number;
  userId: number;
  categoryId: number;
  canBuild: boolean;
  createdAt: string;
}

export interface BuildingDetails {
  id: number;
  name: string;
  level: number;
  sizeX: number;
  sizeY: number;
  powerUsage: number;
  powerOutput: number;
  waterUsage: number;
  waterOutput: number;
}

export interface AllowedBuildingCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  buildings: BuildingDetails[];
}

// Helper types for hierarchy tree navigation
export interface HierarchyTreeNode extends HierarchyLevel {
  isExpanded?: boolean;
  isSelected?: boolean;
}

export interface HierarchyPermissionInfo {
  userId: number;
  userLevel: number;
  allowedCategories: AllowedBuildingCategory[];
  subordinates: HierarchyUser[];
}