// @/services/mode-reglement/mode-reglement.service.ts

import { ModeReglement, ModeReglementValidator, ApiResponse } from "@/types/modeReglement.types";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "@/services/factory/factory.service";

interface ModeReglementState {
  modes: ModeReglement[];
  loading: boolean;
  error: string | null;
  selectedMode: ModeReglement | null;
}

export class ModeReglementService {
  private static instance: ModeReglementService;
  private readonly endpoint = 'type-reglements';
  private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
  private errorHandler = ErrorHandlerService.getInstance();

  private state: ModeReglementState = {
    modes: [],
    loading: false,
    error: null,
    selectedMode: null
  };

  private stateUpdateCallbacks: ((state: ModeReglementState) => void)[] = [];

  public static getInstance(): ModeReglementService {
    if (!ModeReglementService.instance) {
      ModeReglementService.instance = new ModeReglementService();
    }
    return ModeReglementService.instance;
  }

  subscribe(callback: (state: ModeReglementState) => void): () => void {
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

  private updateState(newState: Partial<ModeReglementState>): void {
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

  async loadAll(): Promise<ModeReglement[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: ApiResponse<ModeReglement[]> = await this.httpService.get(this.endpoint);
      const modes = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      
      this.updateState({ 
        modes: modes,
        loading: false,
        error: null
      });
      
      return modes;
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

  async create(modeData: Omit<ModeReglement, 'id'>): Promise<ModeReglement> {
    this.updateState({ loading: true, error: null });

    try {
      // Validation
      const validationErrors = ModeReglementValidator.validate(modeData, 
        this.state.modes.map(m => m.libelle.toLowerCase())
      );
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({ 
          error: errorMessage,
          loading: false 
        });
        throw new Error(errorMessage);
      }

      // Préparer les données à envoyer
      const dataToSend = {
        libelle: modeData.libelle
      };

      const apiResponse: ApiResponse<ModeReglement> = await this.httpService.post(this.endpoint, dataToSend);
      
      // Validation plus flexible de la réponse
      let newMode: ModeReglement;
      
      if (apiResponse && apiResponse.data) {
        newMode = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        // Si la réponse directe contient l'objet créé
        const { id, libelle } = apiResponse as any;
        newMode = { id, libelle } as ModeReglement;
      } else {
        // En dernier recours, rechargeons les données depuis le serveur
        console.warn('Réponse de création non standard, rechargement des données...');
        await this.loadAll();
        return this.state.modes[this.state.modes.length - 1];
      }

      this.updateState({ 
        modes: [...this.state.modes, newMode],
        loading: false,
        error: null
      });
      
      return newMode;
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

  async update(modeData: ModeReglement): Promise<ModeReglement> {
    // Vérification préalable
    if (!modeData || !modeData.id) {
      const error = new Error('Données invalides: ID manquant pour la mise à jour');
      this.updateState({ 
        error: 'ID manquant pour la modification',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      // Validation
      const validationErrors = ModeReglementValidator.validate(modeData, 
        this.state.modes
          .filter(m => m.id !== modeData.id)
          .map(m => m.libelle.toLowerCase())
      );
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({ 
          error: errorMessage,
        loading: false 
        });
        throw new Error(errorMessage);
      }

      // Préparer les données à envoyer
      const dataToSend = {
        libelle: modeData.libelle
      };

      const url = `${this.endpoint}/${modeData.id}`;
      const apiResponse: ApiResponse<ModeReglement> = await this.httpService.put(url, dataToSend);
      
      // Validation plus flexible de la réponse
      let updatedMode: ModeReglement;
      
      if (apiResponse && apiResponse.data) {
        updatedMode = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        // Si la réponse directe contient l'objet mis à jour
        const { id, libelle } = apiResponse as any;
        updatedMode = { id, libelle } as ModeReglement;
      } else {
        // En dernier recours, utilisons les données que nous avons envoyées
        console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
        updatedMode = modeData;
      }

      this.updateState({
        modes: this.state.modes.map(m => 
          m.id === updatedMode.id ? updatedMode : m
        ),
        loading: false,
        error: null
      });
      
      return updatedMode;
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

  async delete(id: number): Promise<void> {
    if (!id) {
      const error = new Error('ID manquant pour la suppression');
      this.updateState({ 
        error: 'ID manquant pour la suppression',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      const url = `${this.endpoint}/${id}`;
      await this.httpService.delete(url);
      
      // Suppression directe (pas de soft delete)
      this.updateState({
        modes: this.state.modes.filter(m => m.id !== id),
        loading: false,
        error: null
      });
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

  // Méthode pour sélectionner un mode
  selectMode(mode: ModeReglement | null): void {
    this.updateState({ selectedMode: mode });
  }

  // Méthode pour récupérer l'état actuel
  getCurrentState(): ModeReglementState {
    return { ...this.state };
  }

  // Méthode pour réinitialiser l'état d'erreur
  clearError(): void {
    this.updateState({ error: null });
  }
}