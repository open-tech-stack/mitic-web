// @/types/typeMontant.types.ts

export interface TypeMontant {
  id: number;
  libelle: string;
  calculable: boolean;
  formule: string;
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

    // Validation pour les types calculables
    if (typeMontant.calculable) {
      if (!typeMontant.formule?.trim()) {
        errors.push('La formule est requise pour un type calculable');
      } else {
        // Vérifier qu'il y a au moins un opérateur dans la formule
        const hasOperator = /[\+\-\*\/]/.test(typeMontant.formule);
        if (!hasOperator) {
          errors.push('La formule doit contenir au moins un opérateur (+, -, *, /)');
        }
      }
    } else {
      // Si non calculable, formule doit être vide
      if (typeMontant.formule && typeMontant.formule.trim() !== '') {
        errors.push('La formule ne doit pas être renseignée pour un type non calculable');
      }
    }

    return errors;
  }
}