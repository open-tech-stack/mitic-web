// @/services/peage/peage.service.ts
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { LocaliteService } from "@/services/localite/localite.service";
import {
  Peage,
  PeageCreateRequest,
  PeageUpdateRequest,
  PeageApiResponse,
  PeageState
} from "@/types/peage.types";
import { ServiceFactory } from "../factory/factory.service";

export class PeageService {
  private static instance: PeageService;
  private readonly endpoint = 'peages';
  private httpService: any;
  private errorHandler: ErrorHandlerService;
  private localiteService: LocaliteService;

  // État du service
  private state: PeageState = {
    peages: [],
    loading: false,
    selectedPeage: null,
    error: null
  };

  private stateUpdateCallbacks: ((state: PeageState) => void)[] = [];

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
    this.localiteService = ServiceFactory.createLocaliteService();
  }

  public static getInstance(): PeageService {
    if (!PeageService.instance) {
      PeageService.instance = new PeageService();
    }
    return PeageService.instance;
  }

  subscribe(callback: (state: PeageState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    callback(this.state);
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private updateState(newState: Partial<PeageState>): void {
    this.state = { ...this.state, ...newState };
    this.stateUpdateCallbacks.forEach(callback => callback(this.state));
  }

  // Accesseurs
  get peages(): Peage[] {
    return this.state.peages;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get selectedPeage(): Peage | null {
    return this.state.selectedPeage;
  }

  get error(): string | null {
    return this.state.error;
  }

  // Récupérer un péage par son identifiant
  getPeageById(id: number): Peage | undefined {
    return this.state.peages.find(p => p.id === id);
  }

  // Statistiques simplifiées
  get stats(): { total: number; parLocalite: Record<string, number> } {
    const total = this.state.peages.length;

    const parLocalite = this.state.peages.reduce((acc, peage) => {
      if (peage.libLoc) {
        acc[peage.libLoc] = (acc[peage.libLoc] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, parLocalite };
  }

  async loadAllPeages(): Promise<Peage[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: PeageApiResponse = await this.httpService.get(this.endpoint);

      let peages: Peage[] = [];

      // Extraction des données
      if (apiResponse.success && apiResponse.data) {
        peages = apiResponse.data;
      } else if (Array.isArray(apiResponse)) {
        peages = apiResponse;
      } else if (apiResponse.data) {
        peages = apiResponse.data;
      }

      // ✅ PLUS BESOIN DE JOINTURE - libLoc est déjà inclus
      this.updateState({
        peages: peages || [],
        loading: false
      });

      return peages || [];
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  // Récupérer les péages par localité
  async getPeagesByLocalite(localiteId: number): Promise<Peage[]> {
    const url = `${this.endpoint}?localite=${localiteId}`;
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: any = await this.httpService.get(url);

      let peages: Peage[] = [];

      if (apiResponse.success && apiResponse.data) {
        peages = apiResponse.data;
      } else if (apiResponse.data) {
        peages = apiResponse.data;
      } else if (Array.isArray(apiResponse)) {
        peages = apiResponse;
      }

      this.updateState({ loading: false });
      return peages;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return [];
    }
  }

  // Créer un péage
  async createPeage(peageData: PeageCreateRequest): Promise<Peage | null> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: any = await this.httpService.post(this.endpoint, peageData);

      let createdPeage: Peage;
      if (apiResponse.success && apiResponse.data) {
        createdPeage = apiResponse.data;
      } else {
        createdPeage = apiResponse;
      }

      this.updateState({
        peages: [...this.state.peages, createdPeage],
        loading: false
      });

      return createdPeage;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return null;
    }
  }

  // Mettre à jour un péage
  async updatePeage(id: number, peageData: Partial<PeageUpdateRequest>): Promise<Peage | null> {
    this.updateState({ loading: true, error: null });
    const url = `${this.endpoint}/${id}`;

    try {
      const apiResponse: any = await this.httpService.put(url, peageData);

      let updatedPeage: Peage;
      if (apiResponse.success && apiResponse.data) {
        updatedPeage = apiResponse.data;
      } else {
        updatedPeage = apiResponse;
      }

      const updatedPeages = this.state.peages.map(p =>
        p.id === id ? { ...p, ...updatedPeage } : p
      );

      const updatedSelectedPeage = this.state.selectedPeage?.id === id
        ? { ...this.state.selectedPeage, ...updatedPeage }
        : this.state.selectedPeage;

      this.updateState({
        peages: updatedPeages,
        selectedPeage: updatedSelectedPeage,
        loading: false
      });

      return updatedPeage;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return null;
    }
  }

  // Supprimer un péage
  async deletePeage(id: number): Promise<boolean> {
    this.updateState({ loading: true, error: null });
    const url = `${this.endpoint}/${id}`;

    try {
      await this.httpService.delete(url);

      const filteredPeages = this.state.peages.filter(p => p.id !== id);
      const updatedSelectedPeage = this.state.selectedPeage?.id === id
        ? null
        : this.state.selectedPeage;

      this.updateState({
        peages: filteredPeages,
        selectedPeage: updatedSelectedPeage,
        loading: false
      });

      return true;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return false;
    }
  }

  // Supprimer plusieurs péages
  async deletePeages(ids: number[]): Promise<boolean> {
    this.updateState({ loading: true, error: null });

    try {
      const deletePromises = ids.map(async id => {
        try {
          return await this.deletePeage(id);
        } catch (e) {
          console.error(`Error deleting peage ${id}`, e);
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      const allSuccess = results.every(r => r === true);

      if (!allSuccess) {
        const appError = this.errorHandler.normalizeError(new Error('Certains péages n\'ont pas pu être supprimés'));
        const errorMessage = this.errorHandler.getUserMessage(appError);
        this.updateState({ error: errorMessage, loading: false });
      } else {
        this.updateState({ loading: false });
      }

      return allSuccess;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return false;
    }
  }

  // Sélectionner un péage
  selectPeage(peage: Peage | null): void {
    this.updateState({ selectedPeage: peage });
  }

  // Méthodes de vérification d'unicité
  checkCodePeageExists(codPeage: string, excludeId?: number): boolean {
    return this.state.peages.some(p =>
      p.codPeage === codPeage &&
      (!excludeId || p.id !== excludeId)
    );
  }

  checkLibPeageExists(libPeage: string, excludeId?: number): boolean {
    return this.state.peages.some(p =>
      p.libPeage.toLowerCase() === libPeage.toLowerCase() &&
      (!excludeId || p.id !== excludeId)
    );
  }

  // Réinitialiser l'état du service
  resetState(): void {
    this.updateState({
      peages: [],
      loading: false,
      selectedPeage: null,
      error: null
    });
  }
}