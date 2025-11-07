// @/types/uo.types.ts

export interface OrganizationalUnit {
  codeUo: string;
  libUo: string;
  parent: string | null;
  enfants: OrganizationalUnit[];
  compte: any[];
  usersAssocies: any[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export interface UoApiResponse extends ApiResponse<OrganizationalUnit[]> {}

export interface CreateUoRequest {
  codeUo: string;
  libUo: string;
  parent: string | null;
}

export interface UpdateUoRequest extends Partial<CreateUoRequest> {
  codeUo: string;
}

// Types pour le state
export interface UoState {
  units: OrganizationalUnit[];
  isLoading: boolean;
  error: string | null;
}

// Types pour les erreurs
export interface UoError {
  message: string;
  status?: number;
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'UNKNOWN_ERROR';
}

// Types pour les résultats d'opérations
export interface UoOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: UoError;
}

// Classe utilitaire pour les validations
export class UoValidator {
  static validateCodeUo(code: string): boolean {
    return !!(code && code.trim().length > 0 && code.trim().length <= 20);
  }

  static validateLibUo(lib: string): boolean {
    return !!(lib && lib.trim().length > 0 && lib.trim().length <= 100);
  }

  static hasRootUnit(units: OrganizationalUnit[]): boolean {
    return units.some(u => u.parent === null);
  }

  static getRootUnit(units: OrganizationalUnit[]): OrganizationalUnit | null {
    return units.find(u => u.parent === null) || null;
  }

  static getAvailableParents(units: OrganizationalUnit[], excludeCodeUo?: string): OrganizationalUnit[] {
    return units.filter(u => u.codeUo !== excludeCodeUo);
  }
}