// @/types/localite.types.ts
export interface Localite {
  id: number;
  codeLoc: string;
  libLoc: string;
  virtuel: boolean;
  tronconIds?: number[]; 
  libelleTroncons?: string[]; 
}

export interface LocaliteCreateRequest {
  codeLoc: string;
  libLoc: string;
  virtuel: boolean;
  tronconId?: number[]; 
}

export interface LocaliteUpdateRequest {
  id: number;
  codeLoc?: string;
  libLoc?: string;
  virtuel?: boolean;
  tronconId?: number[]; 
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class LocaliteValidator {
  static validateId(id: number): boolean {
    return Number.isInteger(id) && id > 0;
  }

  static validateCodeLoc(codeLoc: string): boolean {
    if (!codeLoc || typeof codeLoc !== 'string') return false;
    const regex = /^\d{3}$/;
    if (!regex.test(codeLoc)) return false;
    return codeLoc !== "000";
  }

  static formatCodeLoc(input: string | number): string {
    const numStr = input.toString().replace(/\D/g, '');
    if (numStr === '' || numStr === '0' || numStr === '00' || numStr === '000') {
      return '';
    }
    const num = parseInt(numStr, 10);
    if (num > 999) return '';
    return num.toString().padStart(3, '0');
  }

  static validateLibLoc(libLoc: string): boolean {
    return !!(libLoc && libLoc.trim().length > 0 && libLoc.trim().length <= 50);
  }

  static validateVirtuel(virtuel: boolean): boolean {
    return typeof virtuel === 'boolean';
  }

   static validateTroncon(virtuel: boolean, tronconIds?: number[]): boolean {
    if (virtuel) {
      return tronconIds !== undefined && tronconIds.length > 0;
    }
    return true;
  }
}

export interface LocaliteApiResponse extends ApiResponse<Localite[]> { }

// Types pour les statistiques
export interface LocaliteStats {
  total: number;
  virtuelles: number;
  reelles: number;
}

export interface LocaliteState {
  localites: Localite[];
  loading: boolean;
  selectedLocalite: Localite | null;
  error: string | null;
}