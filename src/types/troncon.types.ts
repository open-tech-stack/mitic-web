import { ApiResponse } from "./localite.types";

export interface Troncon {
  id: number;
  peagesGauche: number;
  peagesDroit: number;
  codLoc?: string | null;
}

export interface TronconApiResponse extends ApiResponse<Troncon[]> {}

// Interface pour les données reçues du backend
export interface TronconLocaliteBackend {
  id: number;
  troncon: string;  // libellé du tronçon
  localite: string; // libellé de la localité
}

export interface TronconLocaliteBackendApiResponse extends ApiResponse<TronconLocaliteBackend[]> {}

// Ancienne interface (conservée pour compatibilité)
export interface TronconLocalite {
  id: number;
  tronconId: number;
  localiteId: number;
}

export interface TronconLocaliteApiResponse extends ApiResponse<TronconLocalite[]> {}

export interface TronconDisplay extends Troncon {
  libelleTroncon: string;
  peageGaucheLib?: string;
  peageDroitLib?: string;
  peageGaucheCode?: string;
  peageDroitCode?: string;
  canEdit: boolean;
  canDelete: boolean;
}

// Interface pour l'affichage des associations
export interface TronconLocaliteDisplay {
  id: number;
  tronconLibelle: string;
  localiteLibelle: string;
  numero?: number; // Pour l'affichage dans le tableau
}

export interface TronconCreateRequest {
  peagesGauche: number;
  peagesDroit: number;
}

export interface TronconUpdateRequest {
  peagesGauche?: number;
  peagesDroit?: number;
}

export interface TronconLocaliteCreateRequest {
  tronconId: number;
  localiteId: number;
}

export class TronconValidator {
  static validatePeagesGauche(peagesGauche: number): boolean {
    return Number.isInteger(peagesGauche) && peagesGauche > 0;
  }

  static validatePeagesDroit(peagesDroit: number): boolean {
    return Number.isInteger(peagesDroit) && peagesDroit > 0;
  }

  static validatePeagesDifferent(peagesGauche: number, peagesDroit: number): boolean {
    return peagesGauche !== peagesDroit;
  }

  static validateTronconIds(peagesGauche: number, peagesDroit: number): boolean {
    return this.validatePeagesGauche(peagesGauche) && 
           this.validatePeagesDroit(peagesDroit) && 
           this.validatePeagesDifferent(peagesGauche, peagesDroit);
  }
}

export interface TronconState {
  troncons: Troncon[];
  tronconLocalites: TronconLocaliteBackend[];
  loading: boolean;
  selectedTroncon: Troncon | null;
  error: string | null;
}