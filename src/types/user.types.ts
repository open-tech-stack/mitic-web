// @/types/user.types.ts

export interface User {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  password?: string;
  codeUo: string | null;
  roleId: number;
  localiteId?: number | null;
  peageId?: number | null;
  sens?: 'IN' | 'OUT' | null;
  hasPassword?: boolean;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  username: string;
  password?: string;
  codeUo: string | null;
  roleId: number;
  localiteId?: number | null;
  peageId?: number | null;
  sens?: 'IN' | 'OUT' | null;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  username?: string; 
  password?: string;
  codeUo?: string | null;
  roleId?: number;
  localiteId?: number | null;
  peageId?: number | null;
  sens?: 'IN' | 'OUT' | null;
}

export interface UserApiResponse {
  success: boolean;
  data: User | User[];
  message?: string;
  status?: number;
}

export interface UserState {
  users: User[];
  loading: boolean;
  selectedUser: User | null;
  error: string | null;
}

export interface UserStats {
  total: number;
  withUo: number;
  withoutUo: number;
  withPassword: number;
  withoutPassword: number;
  byRole: { role: string; count: number; code: string }[];
  byUo: { uo: string; count: number; code: string }[];
}