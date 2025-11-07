// @/services/agent-caisse/agent-caisse.service.ts
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "@/services/factory/factory.service";
import {
  AgentCaisse,
  CreateAgentRequest,
  UpdateAgentRequest,
  AgentCaisseState
} from "@/types/agent.types";

export class AgentCaisseService {
  private static instance: AgentCaisseService;
  private readonly baseEndpoint = 'agentCaisse';
  private readonly createEndpoint = 'agentCaisse';
  private httpService: any;
  private errorHandler: ErrorHandlerService;

  private state: AgentCaisseState = {
    agents: [],
    loading: false,
    selectedAgent: null,
    error: null
  };

  private stateUpdateCallbacks: ((state: AgentCaisseState) => void)[] = [];

  private constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
  }

  public static getInstance(): AgentCaisseService {
    if (!AgentCaisseService.instance) {
      AgentCaisseService.instance = new AgentCaisseService();
    }
    return AgentCaisseService.instance;
  }

  subscribe(callback: (state: AgentCaisseState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    callback(this.state);
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private updateState(newState: Partial<AgentCaisseState>): void {
    this.state = { ...this.state, ...newState };
    this.stateUpdateCallbacks.forEach(callback => callback(this.state));
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  private normalizeAgentData(agentData: any): AgentCaisse {
    return {
      id: agentData.id?.toString() || '',
      username: agentData.username || '',
      nom: agentData.nom || '',
      prenom: agentData.prenom || '',
      password: agentData.password,
      nbreVente: agentData.nbreVente || 0,
      montantVente: agentData.montantVente || 0
    };
  }

  async loadAll(): Promise<AgentCaisse[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse = await this.httpService.get(this.baseEndpoint);
      let agents: AgentCaisse[] = [];

      if (apiResponse.success && apiResponse.data) {
        agents = Array.isArray(apiResponse.data)
          ? apiResponse.data.map((agent: any) => this.normalizeAgentData(agent))
          : [this.normalizeAgentData(apiResponse.data)];
      } else if (Array.isArray(apiResponse)) {
        agents = apiResponse.map((agent: any) => this.normalizeAgentData(agent));
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

  async create(agentData: CreateAgentRequest): Promise<AgentCaisse> {
    this.updateState({ loading: true, error: null });

    try {
      const preparedData = {
        username: agentData.username,
        nom: agentData.nom,
        prenom: agentData.prenom,
        password: agentData.password
      };

      const apiResponse = await this.httpService.post(this.createEndpoint, preparedData);
      let createdAgent: AgentCaisse;

      if (apiResponse.success && apiResponse.data) {
        createdAgent = this.normalizeAgentData(apiResponse.data);
      } else {
        createdAgent = this.normalizeAgentData(apiResponse);
      }

      this.updateState({
        agents: [...this.state.agents, createdAgent],
        loading: false
      });

      return createdAgent;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async update(id: string, agentData: UpdateAgentRequest): Promise<AgentCaisse> {
    this.updateState({ loading: true, error: null });

    try {
      const url = `${this.baseEndpoint}/${id}`;
      const preparedData: any = {
        username: agentData.username,
        nom: agentData.nom,
        prenom: agentData.prenom
      };

      if (agentData.password) {
        preparedData.password = agentData.password;
      }

      const apiResponse = await this.httpService.put(url, preparedData);
      let updatedAgent: AgentCaisse;

      if (apiResponse.success && apiResponse.data) {
        updatedAgent = this.normalizeAgentData(apiResponse.data);
      } else {
        updatedAgent = this.normalizeAgentData(apiResponse);
      }

      const updatedAgents = this.state.agents.map(a =>
        a.id === id ? { ...a, ...updatedAgent } : a
      );

      this.updateState({
        agents: updatedAgents,
        loading: false
      });

      return updatedAgent;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async delete(id: string): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      const url = `${this.baseEndpoint}/${id}`;
      await this.httpService.delete(url);

      const filteredAgents = this.state.agents.filter(a => a.id !== id);
      this.updateState({
        agents: filteredAgents,
        loading: false
      });
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  getAgentById(id: string): AgentCaisse | undefined {
    return this.state.agents.find(a => a.id === id);
  }

  checkUsernameExists(username: string, excludeId?: string): boolean {
    return this.state.agents.some(a =>
      a.username === username && a.id !== excludeId
    );
  }
}