// Types de base
export interface Role {
  id: number;
  name: string;
}

export interface Association {
  roleId: number;
  permissionId: number;
  roleName?: string;
  permissionName?: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface RolePermissionAssociation {
  role: number;
  permission: number[];
}

// État global
export interface SecurityState {
  roles: Role[];
  permissions: Permission[];
  associations: RolePermissionAssociation[];
  isLoading: boolean;
  error: string | null;
}

// Résultat des opérations
export interface SecurityOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}