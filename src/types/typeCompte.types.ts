// @/types/typeCompte.types.ts

export interface CompteType {
  id: number;
  libelle: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export interface CompteTypeState {
  types: CompteType[];
  loading: boolean;
  error: string | null;
}

export class CompteTypeValidator {
  static validateCreation(type: Omit<CompteType, 'id'>): string[] {
    const errors: string[] = [];
    
    if (!type.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (type.libelle.trim().length > 50) {
      errors.push('Le libellé ne peut pas dépasser 50 caractères');
    }

    return errors;
  }

  static validateUpdate(type: CompteType): string[] {
    const errors = this.validateCreation(type);
    
    if (!type.id) {
      errors.push('ID manquant pour la modification');
    }

    return errors;
  }
}