// @/types/operationMontantType.types.ts

export interface OperationMontantType {
  id: number;
  idTypeOperation: number;
  idTypeMontant: number;
  libelleTypeOperation?: string;
  libelleTypeMontant?: string;
}

export interface DeleteOperationMontantTypeRequest {
  idTypeOperation: number;
  idTypeMontant: number;
}

// Interface pour la requête de mise à jour
export interface UpdateOperationMontantTypeRequest {
  // IDs actuels (pour identifier l'association à modifier)
  currentIdTypeOperation: number;
  currentIdTypeMontant: number;
  // Nouvelles valeurs
  newIdTypeOperation: number;
  newIdTypeMontant: number;
}


export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class OperationMontantTypeValidator {
  static validate(association: Partial<OperationMontantType>, existingAssociations: OperationMontantType[] = []): string[] {
    const errors: string[] = [];

    // Validation type d'opération
    if (!association.idTypeOperation) {
      errors.push('Le type d\'opération est requis');
    }

    // Validation type de montant
    if (!association.idTypeMontant) {
      errors.push('Le type de montant est requis');
    }

    // Validation association unique
    const duplicate = existingAssociations.find(a =>
      a.idTypeOperation === association.idTypeOperation &&
      a.idTypeMontant === association.idTypeMontant
    );

    if (duplicate) {
      errors.push('Cette association existe déjà');
    }

    return errors;
  }
}