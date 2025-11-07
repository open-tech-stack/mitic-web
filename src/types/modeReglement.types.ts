// @/types/modeReglement.types.ts

export interface ModeReglement {
  id: number;
  libelle: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class ModeReglementValidator {
  static validate(modeReglement: Partial<ModeReglement>, existingLibelles: string[] = []): string[] {
    const errors: string[] = [];
    
    // Validation libellé
    if (!modeReglement.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (modeReglement.libelle.trim().length > 100) {
      errors.push('Le libellé ne peut pas dépasser 100 caractères');
    } else if (existingLibelles.includes(modeReglement.libelle.toLowerCase())) {
      errors.push('Un mode de règlement avec ce libellé existe déjà');
    }
    
    return errors;
  }
}