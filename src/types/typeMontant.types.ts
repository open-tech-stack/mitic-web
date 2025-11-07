// @/types/typeMontant.types.ts

export interface TypeMontant {
  id: number;
  libelle: string;
  // Champs pour évolution future (non utilisés pour le moment)
  calcul?: boolean;
  calculateur?: string;
  isDelete?: boolean;
  createdAt?: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class TypeMontantValidator {
  static validate(typeMontant: Partial<TypeMontant>, existingLibelles: string[] = []): string[] {
    const errors: string[] = [];
    
    // Validation libellé
    if (!typeMontant.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (typeMontant.libelle.trim().length > 100) {
      errors.push('Le libellé ne peut pas dépasser 100 caractères');
    } else if (existingLibelles.includes(typeMontant.libelle.toLowerCase())) {
      errors.push('Un type de montant avec ce libellé existe déjà');
    }
    
    return errors;
  }
}