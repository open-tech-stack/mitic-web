// @/services/categorie-type/categorie-type.service.ts

import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "@/services/factory/factory.service";
import { CategorieType } from "@/types/categoryType.types";
import { ApiResponse } from "@/types/typeCompte.types";

interface CategorieTypeState {
  types: CategorieType[];
  loading: boolean;
  error: string | null;
}

export class CategorieTypeService {
  private static instance: CategorieTypeService;
  private readonly endpoint = 'type-categories';
  private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
  private errorHandler = ErrorHandlerService.getInstance();

  private state: CategorieTypeState = {
    types: [],
    loading: false,
    error: null
  };

  private stateUpdateCallbacks: ((state: CategorieTypeState) => void)[] = [];

  public static getInstance(): CategorieTypeService {
    if (!CategorieTypeService.instance) {
      CategorieTypeService.instance = new CategorieTypeService();
    }
    return CategorieTypeService.instance;
  }

  subscribe(callback: (state: CategorieTypeState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    // Envoi immédiat de l'état actuel
    callback(this.state);
    
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private updateState(newState: Partial<CategorieTypeState>): void {
    this.state = { ...this.state, ...newState };
    // Notification immédiate de tous les abonnés
    this.stateUpdateCallbacks.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du callback:', error);
      }
    });
  }

  async loadAll(): Promise<CategorieType[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: ApiResponse<CategorieType[]> = await this.httpService.get(this.endpoint);
      const types = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      
      this.updateState({ 
        types: types,
        loading: false,
        error: null
      });
      
      return types;
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  async create(typeData: Omit<CategorieType, 'id'>): Promise<CategorieType> {
    throw new Error('La création de types de catégorie est désactivée');
  }

  async update(typeData: CategorieType): Promise<CategorieType> {
    throw new Error('La modification de types de catégorie est désactivée');
  }

  async delete(id: number): Promise<void> {
    throw new Error('La suppression de types de catégorie est désactivée');
  }
  // Méthode pour récupérer l'état actuel
  getCurrentState(): CategorieTypeState {
    return { ...this.state };
  }

  // Méthode pour réinitialiser l'état d'erreur
  clearError(): void {
    this.updateState({ error: null });
  }
}