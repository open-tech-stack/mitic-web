import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { PeageService } from "@/services/peage/peage.service";
import { LocaliteService } from "@/services/localite/localite.service";
import { ServiceFactory } from "../factory/factory.service";
import { 
  TronconState, 
  Troncon, 
  TronconLocaliteBackend, 
  TronconApiResponse, 
  TronconCreateRequest, 
  TronconUpdateRequest, 
  TronconLocaliteBackendApiResponse,
} from "@/types/troncon.types";

export class TronconService {
  private static instance: TronconService;
  private readonly endpoint = 'troncons';
  private readonly tronconLocaliteEndpoint = 'localite-troncons';
  private httpService: any;
  private errorHandler: ErrorHandlerService;
  private peageService: PeageService;
  private localiteService: LocaliteService;

  // État du service
  private state: TronconState = {
    troncons: [],
    tronconLocalites: [],
    loading: false,
    selectedTroncon: null,
    error: null
  };

  // Callbacks pour les mises à jour d'état
  private stateUpdateCallbacks: ((state: TronconState) => void)[] = [];

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
    this.peageService = ServiceFactory.createPeageService();
    this.localiteService = ServiceFactory.createLocaliteService();
  }

  public static getInstance(): TronconService {
    if (!TronconService.instance) {
      TronconService.instance = new TronconService();
    }
    return TronconService.instance;
  }

  // Méthode pour s'abonner aux changements d'état
  subscribe(callback: (state: TronconState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    callback(this.state);
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  // Mettre à jour l'état et notifier les abonnés
  private updateState(newState: Partial<TronconState>): void {
    this.state = { ...this.state, ...newState };
    this.stateUpdateCallbacks.forEach(callback => callback(this.state));
  }

  // Accesseurs
  get troncons(): Troncon[] {
    return this.state.troncons;
  }

  get tronconLocalites(): TronconLocaliteBackend[] {
    return this.state.tronconLocalites;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get selectedTroncon(): Troncon | null {
    return this.state.selectedTroncon;
  }

  get error(): string | null {
    return this.state.error;
  }

  // Computed pour les données enrichies
  get tronconsDisplay() {
    const peages = this.peageService.peages;
    const tronconLocalites = this.state.tronconLocalites;

    return this.state.troncons.map(troncon => {
      const peageGauche = peages.find(p => p.id === troncon.peagesGauche);
      const peageDroit = peages.find(p => p.id === troncon.peagesDroit);
      const libelleTroncon = `${peageGauche?.libPeage || `Péage #${troncon.peagesGauche}`} - ${peageDroit?.libPeage || `Péage #${troncon.peagesDroit}`}`;

      // Vérifier si le tronçon est associé via les données du backend
      const isLinkedToLocalite = tronconLocalites.some(tl => {
        const tronconLibelle = `${peageGauche?.libPeage} - ${peageDroit?.libPeage}`;
        return tl.troncon === tronconLibelle;
      });

      return {
        ...troncon,
        libelleTroncon,
        peageGaucheLib: peageGauche?.libPeage,
        peageDroitLib: peageDroit?.libPeage,
        peageGaucheCode: peageGauche?.codPeage,
        peageDroitCode: peageDroit?.codPeage,
        canEdit: !isLinkedToLocalite,
        canDelete: !isLinkedToLocalite
      };
    });
  }

  get tronconLocalitesDisplay() {
    return this.state.tronconLocalites.map((tl, index) => ({
      id: tl.id,
      tronconLibelle: tl.troncon,
      localiteLibelle: tl.localite,
      numero: index + 1
    }));
  }

  get tronconsDisponibles() {
    const peages = this.peageService.peages;
    
    return this.tronconsDisplay.filter(troncon => {
      const tronconLibelle = `${troncon.peageGaucheLib} - ${troncon.peageDroitLib}`;
      return !this.state.tronconLocalites.some(tl => tl.troncon === tronconLibelle);
    });
  }

  // === GESTION DES TRONÇONS ===
  async loadAllTroncons(): Promise<Troncon[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: TronconApiResponse = await this.httpService.get(this.endpoint);
      const troncons = apiResponse.data || [];

      this.updateState({
        troncons,
        loading: false
      });

      return troncons;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async createTroncon(data: TronconCreateRequest): Promise<Troncon | null> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: any = await this.httpService.post(this.endpoint, data);
      const createdTroncon = apiResponse.data || apiResponse;

      this.updateState({
        troncons: [...this.state.troncons, createdTroncon],
        loading: false
      });

      return createdTroncon;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return null;
    }
  }

  async updateTroncon(id: number, data: TronconUpdateRequest): Promise<Troncon | null> {
    this.updateState({ loading: true, error: null });
    const url = `${this.endpoint}/${id}`;

    try {
      const apiResponse: any = await this.httpService.put(url, data);
      const updatedTroncon = apiResponse.data || apiResponse;

      const updatedTroncons = this.state.troncons.map(t =>
        t.id === id ? { ...t, ...updatedTroncon } : t
      );

      this.updateState({
        troncons: updatedTroncons,
        loading: false
      });

      return updatedTroncon;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return null;
    }
  }

  async deleteTroncon(id: number): Promise<boolean> {
    this.updateState({ loading: true, error: null });
    const url = `${this.endpoint}/${id}`;

    try {
      await this.httpService.delete(url);

      const filteredTroncons = this.state.troncons.filter(t => t.id !== id);

      this.updateState({
        troncons: filteredTroncons,
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

  // === GESTION DES ASSOCIATIONS TRONÇON-LOCALITÉ (LECTURE SEULE) ===
  async loadAllTronconLocalites(): Promise<TronconLocaliteBackend[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: TronconLocaliteBackendApiResponse = await this.httpService.get(this.tronconLocaliteEndpoint);
      const tronconLocalites = apiResponse.data || [];

      this.updateState({
        tronconLocalites,
        loading: false
      });

      return tronconLocalites;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }


  // Méthodes utilitaires
  validatePeageIdExists(peageId: number): boolean {
    return this.peageService.peages.some(p => p.id === peageId);
  }

  validateTronconData(peageGaucheId: number, peageDroitId: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.validatePeageIdExists(peageGaucheId)) {
      errors.push('Le péage gauche sélectionné n\'existe pas');
    }

    if (!this.validatePeageIdExists(peageDroitId)) {
      errors.push('Le péage droit sélectionné n\'existe pas');
    }

    if (peageGaucheId === peageDroitId) {
      errors.push('Les péages gauche et droit doivent être différents');
    }

    const existingTroncon = this.state.troncons.find(t =>
      (t.peagesGauche === peageGaucheId && t.peagesDroit === peageDroitId) ||
      (t.peagesGauche === peageDroitId && t.peagesDroit === peageGaucheId)
    );

    if (existingTroncon) {
      errors.push('Ce tronçon existe déjà');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Réinitialiser l'état du service
  resetState(): void {
    this.updateState({
      troncons: [],
      tronconLocalites: [],
      loading: false,
      selectedTroncon: null,
      error: null
    });
  }
}