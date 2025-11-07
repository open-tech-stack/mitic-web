// @/services/type-montant/type-montant.service.ts

import { TypeMontant, TypeMontantValidator, ApiResponse } from "@/types/typeMontant.types";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "@/services/factory/factory.service";

interface TypeMontantState {
  types: TypeMontant[];
  loading: boolean;
  error: string | null;
  selectedType: TypeMontant | null;
}

export class TypeMontantService {
  private static instance: TypeMontantService;
  private readonly endpoint = 'type-montants';
  private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
  private errorHandler = ErrorHandlerService.getInstance();

  private state: TypeMontantState = {
    types: [],
    loading: false,
    error: null,
    selectedType: null
  };

  private stateUpdateCallbacks: ((state: TypeMontantState) => void)[] = [];

  public static getInstance(): TypeMontantService {
    if (!TypeMontantService.instance) {
      TypeMontantService.instance = new TypeMontantService();
    }
    return TypeMontantService.instance;
  }

  subscribe(callback: (state: TypeMontantState) => void): () => void {
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

  private updateState(newState: Partial<TypeMontantState>): void {
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

  async loadAll(): Promise<TypeMontant[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: ApiResponse<TypeMontant[]> = await this.httpService.get(this.endpoint);
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

  async create(typeData: Omit<TypeMontant, 'id'>): Promise<TypeMontant> {
    this.updateState({ loading: true, error: null });

    try {
      // Validation
      const validationErrors = TypeMontantValidator.validate(typeData, 
        this.state.types.filter(t => !t.isDelete).map(t => t.libelle.toLowerCase())
      );
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({ 
          error: errorMessage,
          loading: false 
        });
        throw new Error(errorMessage);
      }

      // Préparer les données à envoyer (uniquement id et libelle pour le backend)
      const dataToSend = {
        libelle: typeData.libelle
      };

      const apiResponse: ApiResponse<TypeMontant> = await this.httpService.post(this.endpoint, dataToSend);
      
      // Validation plus flexible de la réponse
      let newType: TypeMontant;
      
      if (apiResponse && apiResponse.data) {
        newType = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        // Si la réponse directe contient l'objet créé
        const { id, libelle } = apiResponse as any;
        newType = { id, libelle } as TypeMontant;
      } else {
        // En dernier recours, rechargeons les données depuis le serveur
        console.warn('Réponse de création non standard, rechargement des données...');
        await this.loadAll();
        return this.state.types[this.state.types.length - 1];
      }

      // Ajouter les champs d'évolution future avec des valeurs par défaut
      const completeType: TypeMontant = {
        ...newType,
        calcul: typeData.calcul || false,
        calculateur: typeData.calculateur || '',
        isDelete: typeData.isDelete || false,
        createdAt: typeData.createdAt || new Date()
      };

      this.updateState({ 
        types: [...this.state.types, completeType],
        loading: false,
        error: null
      });
      
      return completeType;
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

  async update(typeData: TypeMontant): Promise<TypeMontant> {
    // Vérification préalable
    if (!typeData || !typeData.id) {
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
      const validationErrors = TypeMontantValidator.validate(typeData, 
        this.state.types
          .filter(t => t.id !== typeData.id && !t.isDelete)
          .map(t => t.libelle.toLowerCase())
      );
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({ 
          error: errorMessage,
          loading: false 
        });
        throw new Error(errorMessage);
      }

      // Préparer les données à envoyer (uniquement id et libelle pour le backend)
      const dataToSend = {
        libelle: typeData.libelle
      };

      const url = `${this.endpoint}/${typeData.id}`;
      const apiResponse: ApiResponse<TypeMontant> = await this.httpService.put(url, dataToSend);
      
      // Validation plus flexible de la réponse
      let updatedType: TypeMontant;
      
      if (apiResponse && apiResponse.data) {
        updatedType = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        // Si la réponse directe contient l'objet mis à jour
        const { id, libelle } = apiResponse as any;
        updatedType = { id, libelle } as TypeMontant;
      } else {
        // En dernier recours, utilisons les données que nous avons envoyées
        console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
        updatedType = typeData;
      }

      // Conserver les champs d'évolution future
      const completeType: TypeMontant = {
        ...updatedType,
        calcul: typeData.calcul || false,
        calculateur: typeData.calculateur || '',
        isDelete: typeData.isDelete || false,
        createdAt: typeData.createdAt
      };

      this.updateState({
        types: this.state.types.map(t => 
          t.id === completeType.id ? completeType : t
        ),
        loading: false,
        error: null
      });
      
      return completeType;
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
      
      // Soft delete: marquer comme supprimé plutôt que de supprimer réellement
      this.updateState({
        types: this.state.types.map(t => 
          t.id === id ? {...t, isDelete: true} : t
        ),
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

  // Méthode pour restaurer un élément (soft delete)
  async restore(id: number): Promise<void> {
    if (!id) {
      const error = new Error('ID manquant pour la restauration');
      this.updateState({ 
        error: 'ID manquant pour la restauration',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      // Pour un vrai backend, vous auriez un endpoint spécifique pour la restauration
      // Pour l'instant, on simule juste la restauration côté client
      
      this.updateState({
        types: this.state.types.map(t => 
          t.id === id ? {...t, isDelete: false} : t
        ),
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

  // Méthode pour sélectionner un type
  selectType(type: TypeMontant | null): void {
    this.updateState({ selectedType: type });
  }

  // Méthode pour récupérer l'état actuel
  getCurrentState(): TypeMontantState {
    return { ...this.state };
  }

  // Méthode pour réinitialiser l'état d'erreur
  clearError(): void {
    this.updateState({ error: null });
  }
}