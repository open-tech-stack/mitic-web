// types/caissie.types.ts
export interface Caisse {
  idCaisse: number;
  nom: string;
  prenom: string;
  montantTheorique: number;
  montantPhysique: number;
  montantPerte?: number;
  etatCompte: string; // "OUVERT" | "FERME" | "INSTANCE_FERMETURE" | "INITIAL";
  state: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class CaisseValidator {
  static validateMontantPhysique(montant: number): string[] {
    const errors: string[] = [];

    if (montant < 0) {
      errors.push('Le montant physique ne peut pas être négatif');
    }

    if (montant > 7000000) {
      errors.push('Le montant physique ne peut pas dépasser 7 000 000');
    }

    return errors;
  }
}