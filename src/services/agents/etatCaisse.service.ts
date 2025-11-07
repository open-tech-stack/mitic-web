// @/services/etat-caisse/etat-caisse.service.ts
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "@/services/factory/factory.service";
import {
  AgentCaisseStats,
  AgentCaisseFiltered,
  AgentHistoryRequest,
  EtatCaisseState
} from "@/types/agent.types";

export class EtatCaisseService {
  private static instance: EtatCaisseService;
  private readonly statsEndpoint = 'compteAgent';
  private readonly filteredEndpoint = 'agentCaisse/statistique';
  private httpService: any;
  private errorHandler: ErrorHandlerService;

  private state: EtatCaisseState = {
    stats: null,
    agents: [],
    loading: false,
    error: null,
    selectedDate: new Date().toISOString().split('T')[0] // Date du jour par défaut
  };

  private stateUpdateCallbacks: ((state: EtatCaisseState) => void)[] = [];

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
  }

  public static getInstance(): EtatCaisseService {
    if (!EtatCaisseService.instance) {
      EtatCaisseService.instance = new EtatCaisseService();
    }
    return EtatCaisseService.instance;
  }

  subscribe(callback: (state: EtatCaisseState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    callback(this.state);
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private updateState(newState: Partial<EtatCaisseState>): void {
    this.state = { ...this.state, ...newState };
    this.stateUpdateCallbacks.forEach(callback => callback(this.state));
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  private normalizeStatsData(statsData: any): AgentCaisseStats {
    return {
      soldeVente: statsData.soldeVente || 0,
      soldeGain: statsData.soldeGain || 0,
      nbreAgents: statsData.nbreAgents || 0,
      montantTotalVente: statsData.montantTotalVente || 0
    };
  }

  private normalizeAgentFilteredData(agentData: any): AgentCaisseFiltered {
    return {
      id: agentData.id?.toString() || '',
      nom: agentData.nom || '',
      prenom: agentData.prenom || '',
      nbreVente: agentData.nbreVente || 0,
      montantVente: agentData.montantVente || 0
    };
  }

  async loadStats(): Promise<AgentCaisseStats> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse = await this.httpService.get(this.statsEndpoint);
      let stats: AgentCaisseStats;

      if (apiResponse.success && apiResponse.data) {
        stats = this.normalizeStatsData(apiResponse.data);
      } else {
        stats = this.normalizeStatsData(apiResponse);
      }

      this.updateState({ stats, loading: false });
      return stats;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async loadAgentsByDate(date: string): Promise<AgentCaisseFiltered[]> {
    this.updateState({ loading: true, error: null, selectedDate: date });

    try {
      const requestData: AgentHistoryRequest = { date };
      
      // Envoyer la date au backend
      const apiResponse = await this.httpService.post(this.filteredEndpoint, requestData);
      let agents: AgentCaisseFiltered[] = [];

      if (apiResponse.success && apiResponse.data) {
        agents = Array.isArray(apiResponse.data)
          ? apiResponse.data.map((agent: any) => this.normalizeAgentFilteredData(agent))
          : [this.normalizeAgentFilteredData(apiResponse.data)];
      } else if (Array.isArray(apiResponse)) {
        agents = apiResponse.map((agent: any) => this.normalizeAgentFilteredData(agent));
      }

      this.updateState({ agents, loading: false });
      return agents;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async loadTodayAgents(): Promise<AgentCaisseFiltered[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.loadAgentsByDate(today);
  }

  async loadYesterdayAgents(): Promise<AgentCaisseFiltered[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return this.loadAgentsByDate(yesterdayStr);
  }

  getCurrentDate(): string {
    return this.state.selectedDate;
  }

  formatDateForDisplay(date: string): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isDateValid(date: string): boolean {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  }
}