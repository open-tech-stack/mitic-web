import { IHttpService } from '@/types/auth.types';
import { ErrorHandlerService, AppError } from '@/services/core/error-handler.service';
import {
  Compte,
  CompteApiResponse,
  CompteState,
  CompteValidator,
  CompteCreateData
} from '@/types/compte.types';
import { CompteTypeService } from '../type/typeCompte.service';
import { ServiceFactory } from '@/services/factory/factory.service';
import { Pcg } from '@/types/pcg.types';

export class CompteService {
  private static instance: CompteService;
  private httpService: IHttpService;
  private errorHandler: ErrorHandlerService;
  private typeService: CompteTypeService;
  private apiEndpoint = 'comptes';
  private pcgService: any;

  private state: CompteState = {
    comptes: [],
    loading: false,
    error: null,
    selectedCompte: null
  };

  private subscribers: Array<(state: CompteState) => void> = [];

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
    this.typeService = ServiceFactory.createCompteTypeService();
    this.pcgService = ServiceFactory.createPcgService();
  }

  public static getInstance(): CompteService {
    if (!CompteService.instance) {
      CompteService.instance = new CompteService();
    }
    return CompteService.instance;
  }

  public getState(): CompteState {
    return { ...this.state };
  }

  public subscribe(callback: (state: CompteState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.getState());
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach(callback => callback(currentState));
  }

  private setState(updater: (prevState: CompteState) => CompteState): void {
    this.state = updater(this.state);
    this.notifySubscribers();
  }

  private handleError(error: any, context: string): AppError {
    const normalizedError = this.errorHandler.normalizeError(error);
    this.setState(prev => ({
      ...prev,
      loading: false,
      error: this.errorHandler.getUserMessage(normalizedError)
    }));
    this.errorHandler.logError(normalizedError, `CompteService - ${context}`);
    return normalizedError;
  }

  /**
   * Charge tous les comptes
   */
  public async loadAll(): Promise<Compte[]> {
    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await this.httpService.get<CompteApiResponse>(this.apiEndpoint);

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors du chargement des comptes');
      }

      const comptes = response.data || [];
      this.setState(prev => ({
        ...prev,
        comptes,
        loading: false
      }));

      return comptes;
    } catch (error) {
      this.handleError(error, 'loadAll');
      throw error;
    }
  }

  /**
   * Crée un nouveau compte
   */
  public async create(compteData: CompteCreateData): Promise<void> {
    // Validation en mode création
    const errors = CompteValidator.validate(compteData, false);
    if (errors.length > 0) {
      const error = new Error(errors.join(', ')) as any;
      error.type = 'VALIDATION_ERROR';
      throw error;
    }

    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const apiData = {
        numeroCompte: compteData.numeroCompte,
        libelle: compteData.libelle,
        dateCreation: compteData.dateCreation,
        user: compteData.user,
        nom: compteData.nom,
        prenom: compteData.prenom,
        numPerteProfits: compteData.numPerteProfits,
        codeUo: compteData.codeUo,
        pcgNumero: compteData.pcgNumero,
        path: compteData.path,
        pcgNumeroPerteProfits: compteData.pcgNumeroPerteProfits,
        libelleUo: compteData.libelleUo,
        typeCompte: compteData.typeCompte
      };

      console.log('📤 [CompteService] Données envoyées pour création:', apiData);

      const response = await this.httpService.post<CompteApiResponse>(
        this.apiEndpoint,
        apiData
      );

      console.log('✅ [CompteService] Réponse création:', response);

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la création du compte');
      }

      // Recharger la liste après création
      await this.loadAll();

    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  /**
   * Met à jour un compte existant
   */
  public async update(compte: Compte): Promise<void> {
    if (!compte.id) {
      const error = new Error('ID manquant pour la modification') as any;
      error.type = 'VALIDATION_ERROR';
      throw error;
    }

    // Validation en mode édition
    const errors = CompteValidator.validate(compte, true);
    if (errors.length > 0) {
      const error = new Error(errors.join(', ')) as any;
      error.type = 'VALIDATION_ERROR';
      throw error;
    }

    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const apiData = {
        ...compte,
        path: compte.path,
        pcgNumeroPerteProfits: compte.pcgNumeroPerteProfits
      };

      const response = await this.httpService.put<CompteApiResponse>(
        `${this.apiEndpoint}/${compte.id}`,
        apiData
      );

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la mise à jour du compte');
      }

      await this.loadAll();

    } catch (error) {
      this.handleError(error, 'update');
      throw error;
    }
  }

  /**
   * Supprime un compte
   */
  public async delete(id: number): Promise<void> {
    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await this.httpService.delete<CompteApiResponse>(
        `${this.apiEndpoint}/${id}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression du compte');
      }

      this.setState(prev => ({
        ...prev,
        comptes: prev.comptes.filter(c => c.id !== id),
        loading: false
      }));
    } catch (error) {
      this.handleError(error, 'delete');
      throw error;
    }
  }

  /**
   * Charge les PCG disponibles
   */
  public async getAvailablePcgs(): Promise<Pcg[]> {
    try {
      await this.pcgService.loadAll();
      const allPcgs = this.pcgService.getComptesFlat();

      const sortedPcgs = [...allPcgs].sort((a, b) => a.path.localeCompare(b.path));

      return sortedPcgs.map((pcg: Pcg) => ({
        ...pcg,
        display: `${pcg.path} - ${pcg.libelle}`
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des PCG:', error);
      return [];
    }
  }

  // Méthodes utilitaires
  public getTypeLibelle(typeId: number): string {
    const type = this.typeService.getById(typeId);
    return type?.libelle || 'Type inconnu';
  }

  public getEntiteDisplay(compte: Compte): string {
    if (compte.user && compte.nom && compte.prenom) {
      return `${compte.nom} ${compte.prenom}`;
    } else if (compte.codeUo && compte.libelleUo) {
      return compte.libelleUo;
    }
    return 'Non défini';
  }

  // 🔥 NOUVELLES MÉTHODES: Gestion des comptes avec gain
  public isCompteAvecGain(typeCompte: number): boolean {
    return this.isCompteCaisse(typeCompte) || this.isCompteAgent(typeCompte);
  }

  public isCompteCaisse(typeCompte: number): boolean {
    const type = this.typeService.getById(typeCompte);
    return type?.libelle?.toLowerCase().includes('caisse') || false;
  }

  public isCompteAgent(typeCompte: number): boolean {
    const type = this.typeService.getById(typeCompte);
    return type?.libelle?.toLowerCase().includes('agent') || false;
  }

  public formatSolde(solde?: number): string {
    if (solde === undefined || solde === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(solde);
  }

  // Getters
  public get comptes(): Compte[] {
    return [...this.state.comptes];
  }

  public get loading(): boolean {
    return this.state.loading;
  }

  public get error(): string | null {
    return this.state.error;
  }

  public get selectedCompte(): Compte | null {
    return this.state.selectedCompte;
  }

  public selectCompte(compte: Compte | null): void {
    this.setState(prev => ({ ...prev, selectedCompte: compte }));
  }

  public clearError(): void {
    this.setState(prev => ({ ...prev, error: null }));
  }

  public getById(id: number): Compte | undefined {
    return this.state.comptes.find(c => c.id === id);
  }
}