// @/types/typeOperation.types.ts

export interface TypeOperation {
  id: number;
  libelle: string;
  isDelete?: boolean;
  createdAt?: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class TypeOperationValidator {
  static validate(typeOperation: Partial<TypeOperation>, existingLibelles: string[] = []): string[] {
    const errors: string[] = [];
    
    // Validation libellé
    if (!typeOperation.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (typeOperation.libelle.trim().length > 100) {
      errors.push('Le libellé ne peut pas dépasser 100 caractères');
    } else if (existingLibelles.includes(typeOperation.libelle.toLowerCase())) {
      errors.push('Un type d\'opération avec ce libellé existe déjà');
    }
    
    return errors;
  }
}