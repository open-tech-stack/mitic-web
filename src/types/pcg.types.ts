// @/types/pcg.types.ts

export interface Pcg {
  numeroCompte: string;
  libelle: string;
  classe: string;
  parent: string | null;
  path: string;
  sousComptes: Pcg[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export interface PcgApiResponse extends ApiResponse<Pcg[]> { }

export interface CreatePcgRequest {
  numeroCompte: string;
  libelle: string;
  classe: string;
}

export interface UpdatePcgRequest extends Partial<CreatePcgRequest> {
  numeroCompte: string;
}

// Types pour le state
export interface PcgState {
  comptes: Pcg[];
  isLoading: boolean;
  error: string | null;
}

// Types pour les erreurs
export interface PcgError {
  message: string;
  status?: number;
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'UNKNOWN_ERROR';
}

// Types pour les résultats d'opérations
export interface PcgOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: PcgError;
}

// Classe utilitaire pour les validations
export class PcgValidator {
  static validateNumeroCompte(numero: string): boolean {
    // Validation pour s'assurer que c'est un nombre
    const isNumeric = /^\d+$/.test(numero);
    return !!(numero && numero.trim().length > 0 && isNumeric);
  }

  static validateLibelle(libelle: string): boolean {
    return !!(libelle && libelle.trim().length > 0 && libelle.trim().length <= 255);
  }

  static validateClasse(classe: string): boolean {
    return !classe || classe.trim().length <= 255;
  }

  static hasRootCompte(comptes: Pcg[]): boolean {
    return comptes.some(c => c.parent === null);
  }

  static getRootCompte(comptes: Pcg[]): Pcg | null {
    return comptes.find(c => c.parent === null) || null;
  }

  static getAvailableParents(comptes: Pcg[], excludeNumeroCompte?: string): Pcg[] {
    return comptes.filter(c => c.numeroCompte !== excludeNumeroCompte);
  }
}