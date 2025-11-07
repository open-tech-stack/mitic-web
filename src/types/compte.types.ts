// @/types/compte.types.ts

export interface Compte {
  id: number;
  numeroCompte: string;
  libelle: string;
  dateCreation: Date;
  user: number | null;
  nom: string;
  prenom: string;
  numPerteProfits: string;
  codeUo: string | null;
  pcgNumero: string;
  path: string;
  pcgNumeroPerteProfits: string;
  libelleUo: string;
  typeCompte: number;
  solde?: number;
}

// Pour les réponses API
export interface CompteApiResponse {
  data: Compte[];
  success: boolean;
  message: string;
  status: number;
}

export interface CompteCreateData {
  numeroCompte: string;
  libelle: string;
  dateCreation: Date;
  user: number | null;
  nom: string;
  prenom: string;
  numPerteProfits: string;
  codeUo: string | null;
  pcgNumero: string;
  path: string;
  pcgNumeroPerteProfits: string;
  libelleUo: string;
  typeCompte: number;
}

export interface CompteState {
  comptes: Compte[];
  loading: boolean;
  error: string | null;
  selectedCompte: Compte | null;
}

// Validateur simplifié
export class CompteValidator {
  static validate(compte: Partial<CompteCreateData>, isEdit: boolean = false): string[] {
    const errors: string[] = [];
    
    if (!compte.numeroCompte?.trim()) {
      errors.push('Le numéro de compte est requis');
    } else if (!/^\d{10,15}$/.test(compte.numeroCompte.trim())) {
      errors.push('Le numéro doit contenir 10 à 15 chiffres');
    }

    if (!compte.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (compte.libelle.trim().length > 100) {
      errors.push('Le libellé ne peut dépasser 100 caractères');
    }

    if (!compte.typeCompte) {
      errors.push('Le type de compte est requis');
    }

    if (!compte.user && !compte.codeUo) {
      errors.push('Vous devez sélectionner soit un utilisateur soit une UO');
    }

    if (!compte.pcgNumero?.trim()) {
      errors.push('Le PCG associé est requis');
    }

    if (!compte.path?.trim()) {
      errors.push('Le chemin PCG est requis');
    }

    // Validation spécifique pour les comptes caisse UNIQUEMENT en création
    if (compte.typeCompte && this.isCompteCaisse(compte.typeCompte) && !isEdit) {
      if (!compte.numPerteProfits?.trim()) {
        errors.push('Le numéro de compte perte et profit est requis pour les comptes caisse');
      }
      if (!compte.pcgNumeroPerteProfits?.trim()) {
        errors.push('Le PCG perte et profit est requis pour les comptes caisse');
      }
    }

    return errors;
  }

  private static isCompteCaisse(typeCompte: number): boolean {
    return typeCompte === 4;
  }
}