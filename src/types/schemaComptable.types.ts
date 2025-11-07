// @/types/schemaComptable.types.ts

export interface EcritureComptable {
  id?: number;
  sens: 'DEBIT' | 'CREDIT';
  id_typeCompte: number;
  type_detenteur: boolean;
  id_typeMontant: number; // Nouveau champ ajouté
}

export interface CreateEcritureComptable extends Omit<EcritureComptable, 'id'> {}

export interface SchemaComptable {
  id?: number;
  id_reglement: number;
  id_tyOp: number;
  ecritures: EcritureComptable[];
}

export interface CreateSchemaComptable extends Omit<SchemaComptable, 'id'> {}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export class EcritureComptableValidator {
  static validate(ecriture: Partial<EcritureComptable>): string[] {
    const errors: string[] = [];
    
    if (!ecriture.sens || !['DEBIT', 'CREDIT'].includes(ecriture.sens)) {
      errors.push('Le sens (DEBIT/CREDIT) est requis');
    }
    
    if (!ecriture.id_typeCompte || ecriture.id_typeCompte <= 0) {
      errors.push('Un type de compte valide est requis');
    }
    
    if (ecriture.type_detenteur === undefined || ecriture.type_detenteur === null) {
      errors.push('Le type de détenteur est requis');
    }

    // Validation du nouveau champ
    if (!ecriture.id_typeMontant || ecriture.id_typeMontant <= 0) {
      errors.push('Un type de montant valide est requis');
    }

    return errors;
  }
}

export class SchemaComptableValidator {
  static validate(schema: Partial<SchemaComptable>): string[] {
    const errors: string[] = [];
    
    if (!schema.id_reglement || schema.id_reglement <= 0) {
      errors.push('Un mode de règlement valide est requis');
    }
    
    if (!schema.id_tyOp || schema.id_tyOp <= 0) {
      errors.push('Un type d\'opération valide est requis');
    }
    
    if (!schema.ecritures || schema.ecritures.length === 0) {
      errors.push('Au moins une écriture comptable est requise');
    }

    if (schema.ecritures) {
      schema.ecritures.forEach((ecriture, index) => {
        const ecritureErrors = EcritureComptableValidator.validate(ecriture);
        ecritureErrors.forEach(error => {
          errors.push(`Écriture ${index + 1}: ${error}`);
        });
      });
    }

    return errors;
  }
}