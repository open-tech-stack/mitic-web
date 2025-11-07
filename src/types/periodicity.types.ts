// @/types/periodicity.types.ts

export interface Periodicite {
  id: number;
  libelle: string;
  actif: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class PeriodiciteValidator {
  static validate(periodicite: Partial<Periodicite>, existingLibelles: string[] = []): string[] {
    const errors: string[] = [];
    
    // Validation libellé
    if (!periodicite.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (periodicite.libelle.trim().length > 100) {
      errors.push('Le libellé ne peut pas dépasser 100 caractères');
    } else if (existingLibelles.includes(periodicite.libelle.toLowerCase())) {
      errors.push('Une périodicité avec ce libellé existe déjà');
    }
    
    return errors;
  }
}