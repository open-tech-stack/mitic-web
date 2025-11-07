import { IHttpService } from '@/types/auth.types';
import { ErrorHandlerService, AppError } from '@/services/core/error-handler.service';
import {
  OperationHistorique,
  HistoriqueCompteApiResponse,
  HistoriqueCompteState,
  HistoriqueFilters,
  HistoriqueCompteValidator,
} from '@/types/historiqueCompte.types';
import { ServiceFactory } from '@/services/factory/factory.service';

export class HistoriqueCompteService {
  private static instance: HistoriqueCompteService;
  private httpService: IHttpService;
  private errorHandler: ErrorHandlerService;
  private apiEndpoint = 'ecritures/historique';

  private state: HistoriqueCompteState = {
    operations: [],
    loading: false,
    error: null,
    filters: {
      numeroCompte: '',
      dateDebut: '',
      dateFin: ''
    },
    soldeFinal: 0
  };

  private subscribers: Array<(state: HistoriqueCompteState) => void> = [];

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
  }

  public static getInstance(): HistoriqueCompteService {
    if (!HistoriqueCompteService.instance) {
      HistoriqueCompteService.instance = new HistoriqueCompteService();
    }
    return HistoriqueCompteService.instance;
  }

  /**
   * Obtient l'état actuel
   */
  public getState(): HistoriqueCompteState {
    return { ...this.state };
  }

  /**
   * Souscrire aux changements d'état
   */
  public subscribe(callback: (state: HistoriqueCompteState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.getState());
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Notifie tous les abonnés du changement d'état
   */
  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach(callback => callback(currentState));
  }

  /**
   * Met à jour l'état de manière immuable
   */
  private setState(
    updater: HistoriqueCompteState | ((prevState: HistoriqueCompteState) => HistoriqueCompteState)
  ): void {
    if (typeof updater === 'function') {
      this.state = (updater as (prev: HistoriqueCompteState) => HistoriqueCompteState)(this.state);
    } else {
      this.state = updater;
    }
    this.notifySubscribers();
  }

  /**
   * Gère les erreurs et met à jour l'état
   */
  private handleError(error: any, context: string): AppError {
    const normalizedError = this.errorHandler.normalizeError(error);
    this.setState(prev => ({
      ...prev,
      loading: false,
      error: this.errorHandler.getUserMessage(normalizedError)
    }));
    this.errorHandler.logError(normalizedError, `HistoriqueCompteService - ${context}`);
    return normalizedError;
  }

  /**
   * Charge l'historique d'un compte avec filtres
   */
  public async loadHistorique(filters: HistoriqueFilters): Promise<OperationHistorique[]> {
    const errors = HistoriqueCompteValidator.validateFilters(filters);
    if (errors.length > 0) {
      const error = new Error(errors.join(', ')) as any;
      error.type = 'VALIDATION_ERROR';
      throw error;
    }

    this.setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      filters
    }));

    try {
      const requestData = {
        numeroCompte: filters.numeroCompte,
        dateDebut: filters.dateDebut,
        dateFin: filters.dateFin
      };

      console.log('📤 ENVOI AU BACKEND - HistoriqueCompteService:', {
        endpoint: this.apiEndpoint,
        data: requestData,
        timestamp: new Date().toISOString()
      });

      const response = await this.httpService.post<HistoriqueCompteApiResponse>(
        this.apiEndpoint,
        requestData
      );

      console.log('📥 RÉPONSE DU BACKEND - HistoriqueCompteService:', {
        success: response.success,
        message: response.message,
        data: response.data,
        timestamp: new Date().toISOString()
      });

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors du chargement de l\'historique');
      }

      // Traitement correct des données selon les logs
      let operations: any[] = [];
      let soldeFinal: number = 0;

      // D'après vos logs, response.data est un Array(1) avec un seul objet
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Traiter TOUS les éléments du tableau
        operations = response.data.map((item, index) => ({
          id: index + 1,
          date: item.date || item.dateDebut || '',
          sens: item.sens || 'DEBIT',
          montant: item.montant || 0,
          typeOp: item.typeOp || 'Opération',
          solde: item.soldeFinal || item.solde || 0,
          numeroCompte: item.numeroCompte,
          dateDebut: item.dateDebut,
          dateFin: item.dateFin
        }));

        // Le solde final est celui du dernier élément
        const lastItem = response.data[response.data.length - 1];
        soldeFinal = lastItem.soldeFinal || lastItem.solde || 0;
      }

      console.log('🔧 TRAITEMENT DES DONNÉES - HistoriqueCompteService:', {
        operationsCount: operations.length,
        soldeFinal: soldeFinal,
        operationsSample: operations.slice(0, 3)
      });

      this.setState(prev => ({
        ...prev,
        operations,
        soldeFinal,
        loading: false
      }));

      return operations;
    } catch (error) {
      console.error('❌ ERREUR - HistoriqueCompteService:', {
        error: error,
        filters: filters,
        timestamp: new Date().toISOString()
      });
      this.handleError(error, 'loadHistorique');
      throw error;
    }
  }

  /**
   * Réinitialise l'état d'erreur
   */
  public clearError(): void {
    this.setState(prev => ({ ...prev, error: null }));
  }

  /**
   * Réinitialise les filtres et les données
   */
  public reset(): void {
    this.setState({
      operations: [],
      loading: false,
      error: null,
      filters: {
        numeroCompte: '',
        dateDebut: '',
        dateFin: ''
      },
      soldeFinal: 0
    });
  }

  /**
   * Formate le montant pour l'affichage (toujours positif)
   */
  public formatMontant(montant: number): string {
    const montantAbsolu = Math.abs(montant);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montantAbsolu);
  }

  /**
   * Formate le solde pour l'affichage (avec signe)
   */
  public formatSolde(solde: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(solde);
  }

  /**
   * Formate la date pour l'affichage
   */
  public formatDate(dateString: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateString));
    } catch (error) {
      console.error('Erreur de formatage de date:', dateString, error);
      return dateString;
    }
  }

  /**
   * Détermine l'affichage du sens basé sur le solde final
   */
  public getSensAffichage(soldeFinal: number): { sens: string; classe: string } {
    if (soldeFinal >= 0) {
      return { sens: 'DEBIT', classe: 'text-green-600 dark:text-green-400' };
    } else {
      return { sens: 'CREDIT', classe: 'text-red-600 dark:text-red-400' };
    }
  }

  /**
   * Vérifie si les filtres sont valides pour une recherche automatique
   */
  public canAutoSearch(filters: HistoriqueFilters): boolean {
    return !!filters.numeroCompte && !!filters.dateDebut && !!filters.dateFin;
  }

  // Getters
  public get operations(): OperationHistorique[] {
    return [...this.state.operations];
  }

  public get loading(): boolean {
    return this.state.loading;
  }

  public get error(): string | null {
    return this.state.error;
  }

  public get filters(): HistoriqueFilters {
    return { ...this.state.filters };
  }

  public get soldeFinal(): number {
    return this.state.soldeFinal;
  }
}