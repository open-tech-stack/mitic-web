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

    // Validation spécifique pour les comptes caisse ET agent UNIQUEMENT en création
    if (compte.typeCompte && this.isCompteAvecGain(compte.typeCompte) && !isEdit) {
      if (!compte.numPerteProfits?.trim()) {
        errors.push(this.getGainFieldLabel(compte.typeCompte) + ' est requis');
      }
      if (!compte.pcgNumeroPerteProfits?.trim()) {
        errors.push('Le PCG ' + this.getGainFieldLabel(compte.typeCompte).toLowerCase() + ' est requis');
      }
    }

    return errors;
  }

  private static isCompteAvecGain(typeCompte: number): boolean {
    return this.isCompteCaisse(typeCompte) || this.isCompteAgent(typeCompte);
  }

  private static isCompteCaisse(typeCompte: number): boolean {
    return typeCompte === 4;
  }

  private static isCompteAgent(typeCompte: number): boolean {
    return typeCompte === 5;
  }

  private static getGainFieldLabel(typeCompte: number): string {
    if (this.isCompteCaisse(typeCompte)) {
      return 'Le numéro de compte perte et profit';
    } else if (this.isCompteAgent(typeCompte)) {
      return 'Le numéro de compte gain';
    }
    return 'Le numéro de compte';
  }
}