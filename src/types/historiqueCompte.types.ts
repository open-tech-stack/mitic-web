// Mettez à jour vos types comme ceci :

export interface OperationHistorique {
  id: number;
  date: string;
  sens: 'DEBIT' | 'CREDIT';
  montant: number;
  typeOp: string;
  solde: number;
  numeroCompte?: string;
  dateDebut?: string;
  dateFin?: string;
  soldeFinal?: number;
}

export interface HistoriqueCompteApiResponse {
  success: boolean;
  message?: string;
  data?: Array<{
    numeroCompte: string;
    dateDebut: string;
    dateFin: string;
    solde: number;
    soldeFinal: number;
    date?: string;
    sens?: 'DEBIT' | 'CREDIT';
    montant?: number;
    typeOp?: string;
  }>;
  timestamp?: string;
}

export interface HistoriqueCompteState {
  operations: OperationHistorique[];
  loading: boolean;
  error: string | null;
  filters: {
    numeroCompte: string;
    dateDebut: string;
    dateFin: string;
  };
  soldeFinal: number;
}

export interface HistoriqueFilters {
  numeroCompte: string;
  dateDebut: string;
  dateFin: string;
}

export class HistoriqueCompteValidator {
  static validateFilters(filters: HistoriqueFilters): string[] {
    const errors: string[] = [];

    if (!filters.numeroCompte?.trim()) {
      errors.push('Le numéro de compte est requis');
    }

    if (!filters.dateDebut) {
      errors.push('La date de début est requise');
    }

    if (!filters.dateFin) {
      errors.push('La date de fin est requise');
    }

    if (filters.dateDebut && filters.dateFin) {
      const debut = new Date(filters.dateDebut);
      const fin = new Date(filters.dateFin);

      if (debut > fin) {
        errors.push('La date de début ne peut pas être après la date de fin');
      }
    }

    return errors;
  }
}