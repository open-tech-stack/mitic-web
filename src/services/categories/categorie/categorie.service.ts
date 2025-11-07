// @/services/categorie/categorie.service.ts

import { Categorie, CategorieValidator, ApiResponse } from "@/types/categorie.types";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "@/services/factory/factory.service";

interface CategorieState {
  categories: Categorie[];
  loading: boolean;
  error: string | null;
  selectedCategorie: Categorie | null;
}

export class CategorieService {
  private static instance: CategorieService;
  private readonly endpoint = 'categories';
  private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
  private errorHandler = ErrorHandlerService.getInstance();
  private categorieTypeService = ServiceFactory.createCategorieTypeService();

  private state: CategorieState = {
    categories: [],
    loading: false,
    error: null,
    selectedCategorie: null
  };

  private stateUpdateCallbacks: ((state: CategorieState) => void)[] = [];

  public static getInstance(): CategorieService {
    if (!CategorieService.instance) {
      CategorieService.instance = new CategorieService();
    }
    return CategorieService.instance;
  }

  subscribe(callback: (state: CategorieState) => void): () => void {
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

  private updateState(newState: Partial<CategorieState>): void {
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

  async loadAll(): Promise<Categorie[]> {
    this.updateState({ loading: true, error: null });

    try {
      // S'assurer que les types de catégories sont chargés
      const typeState = this.categorieTypeService.getCurrentState();
      if (typeState.types.length === 0) {
        await this.categorieTypeService.loadAll();
      }

      const apiResponse: ApiResponse<Categorie[]> = await this.httpService.get(this.endpoint);
      const categories = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      
      this.updateState({ 
        categories: categories,
        loading: false,
        error: null
      });
      
      return categories;
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

  async create(categorieData: Omit<Categorie, 'id'>): Promise<Categorie> {
    this.updateState({ loading: true, error: null });

    try {
      // Récupérer le type pour déterminer si c'est un poids lourd
      const typeState = this.categorieTypeService.getCurrentState();
      const type = typeState.types.find(t => t.id === Number(categorieData.typeCategorie));
      const isPoidsLourd = type ? CategorieValidator.isPoidsLourd(type.libelle) : false;

      // Validation
      const validationErrors = CategorieValidator.validate(categorieData, isPoidsLourd);
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
        typeCategorie: Number(categorieData.typeCategorie),
        montant: Number(categorieData.montant),
        nbreEssieux: isPoidsLourd ? Number(categorieData.nbreEssieux) : 0
      };

      const apiResponse: ApiResponse<Categorie> = await this.httpService.post(this.endpoint, dataToSend);
      
      // Validation plus flexible de la réponse
      let newCategorie: Categorie;
      
      if (apiResponse && apiResponse.data) {
        newCategorie = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'typeCategorie' in apiResponse) {
        // Si la réponse directe contient l'objet créé
        newCategorie = apiResponse as unknown as Categorie;
      } else {
        // En dernier recours, rechargeons les données depuis le serveur
        console.warn('Réponse de création non standard, rechargement des données...');
        await this.loadAll();
        return this.state.categories[this.state.categories.length - 1]; // Retourner le dernier élément
      }

      // Validation que l'élément créé a bien les propriétés nécessaires
      if (!newCategorie.typeCategorie || newCategorie.montant === undefined) {
        console.warn('Réponse de création incomplète, rechargement des données...');
        await this.loadAll();
        return this.state.categories.find(c => 
          c.typeCategorie === categorieData.typeCategorie && 
          c.montant === categorieData.montant &&
          c.nbreEssieux === (isPoidsLourd ? categorieData.nbreEssieux : 0)
        ) || this.state.categories[this.state.categories.length - 1];
      }

      this.updateState({ 
        categories: [...this.state.categories, newCategorie],
        loading: false,
        error: null
      });
      
      return newCategorie;
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

  async update(categorieData: Categorie): Promise<Categorie> {
    // Vérification préalable
    if (!categorieData || !categorieData.id) {
      const error = new Error('Données invalides: ID manquant pour la mise à jour');
      this.updateState({ 
        error: 'ID manquant pour la modification',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      // Récupérer le type pour déterminer si c'est un poids lourd
      const typeState = this.categorieTypeService.getCurrentState();
      const type = typeState.types.find(t => t.id === categorieData.typeCategorie);
      const isPoidsLourd = type ? CategorieValidator.isPoidsLourd(type.libelle) : false;

      // Validation
      const validationErrors = CategorieValidator.validate(categorieData, isPoidsLourd);
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
        ...categorieData,
        nbreEssieux: isPoidsLourd ? (categorieData.nbreEssieux || 0) : 0
      };

      const url = `${this.endpoint}/${categorieData.id}`;
      const apiResponse: ApiResponse<Categorie> = await this.httpService.put(url, dataToSend);
      
      // Validation plus flexible de la réponse
      let updatedCategorie: Categorie;
      
      if (apiResponse && apiResponse.data) {
        updatedCategorie = apiResponse.data;
      } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
        // Si la réponse directe contient l'objet mis à jour
        updatedCategorie = apiResponse as unknown as Categorie;
      } else {
        // En dernier recours, utilisons les données que nous avons envoyées
        console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
        updatedCategorie = categorieData;
      }

      // Validation que l'élément mis à jour a bien les propriétés nécessaires
      if (!updatedCategorie.id || updatedCategorie.typeCategorie === undefined || updatedCategorie.montant === undefined) {
        console.warn('Réponse de mise à jour incomplète, utilisation des données locales...');
        updatedCategorie = categorieData;
      }

      this.updateState({
        categories: this.state.categories.map(c => 
          c.id === updatedCategorie.id ? updatedCategorie : c
        ),
        loading: false,
        error: null
      });
      
      return updatedCategorie;
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
      
      this.updateState({
        categories: this.state.categories.filter(c => c.id !== id),
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

  // Méthode utilitaire pour obtenir le libellé d'un type
  getTypeLibelle(typeId: number): string {
    const typeState = this.categorieTypeService.getCurrentState();
    const type = typeState.types.find(t => t.id === typeId);
    return type?.libelle || 'Inconnu';
  }

  // Méthode pour sélectionner une catégorie
  selectCategorie(categorie: Categorie | null): void {
    this.updateState({ selectedCategorie: categorie });
  }

  // Méthode pour récupérer l'état actuel
  getCurrentState(): CategorieState {
    return { ...this.state };
  }

  // Méthode pour réinitialiser l'état d'erreur
  clearError(): void {
    this.updateState({ error: null });
  }

  // Méthode pour vérifier si un type est un poids lourd
  isPoidsLourd(typeId: number): boolean {
    const typeState = this.categorieTypeService.getCurrentState();
    const type = typeState.types.find(t => t.id === typeId);
    return type ? CategorieValidator.isPoidsLourd(type.libelle) : false;
  }
}