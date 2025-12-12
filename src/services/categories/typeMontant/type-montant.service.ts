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
        this.state.types.map(t => t.libelle.toLowerCase())
      );

      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({
          error: errorMessage,
          loading: false
        });
        throw new Error(errorMessage);
      }

      const dataToSend = {
        libelle: typeData.libelle,
        calculable: typeData.calculable,
        formule: typeData.calculable ? typeData.formule : ''
      };

      const apiResponse: ApiResponse<TypeMontant> = await this.httpService.post(this.endpoint, dataToSend);

      let newType: TypeMontant;

      if (apiResponse && apiResponse.data) {
        newType = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        const { id, libelle, calculable, formule } = apiResponse as any;
        newType = { id, libelle, calculable, formule } as TypeMontant;
      } else {
        await this.loadAll();
        return this.state.types[this.state.types.length - 1];
      }

      // Mettre à jour l'état local
      this.updateState({
        types: [...this.state.types, newType],
        loading: false,
        error: null
      });

      return newType;
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
          .filter(t => t.id !== typeData.id)
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

      const dataToSend = {
        libelle: typeData.libelle,
        calculable: typeData.calculable,
        formule: typeData.calculable ? typeData.formule : ''
      };

      const url = `${this.endpoint}/${typeData.id}`;
      const apiResponse: ApiResponse<TypeMontant> = await this.httpService.put(url, dataToSend);

      let updatedType: TypeMontant;

      if (apiResponse && apiResponse.data) {
        updatedType = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        const { id, libelle, calculable, formule } = apiResponse as any;
        updatedType = { id, libelle, calculable, formule } as TypeMontant;
      } else {
        updatedType = typeData;
      }

      // Mettre à jour l'état local
      const updatedTypes = this.state.types.map(t =>
        t.id === updatedType.id ? updatedType : t
      );

      this.updateState({
        types: updatedTypes,
        loading: false,
        selectedType: null
      });

      return updatedType;
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

      // Suppression définitive du tableau
      const updatedTypes = this.state.types.filter(t => t.id !== id);

      this.updateState({
        types: updatedTypes,
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