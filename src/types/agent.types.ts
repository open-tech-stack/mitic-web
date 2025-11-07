// @/types/agent.types.ts
export interface AgentCaisse {
  id: string;
  username: string;
  nom: string;
  prenom: string;
  password?: string;
  nbreVente: number;
  montantVente: number;
}

export interface CreateAgentRequest {
  username: string;
  nom: string;
  prenom: string;
  password: string;
}

export interface UpdateAgentRequest {
  username?: string;
  nom?: string;
  prenom?: string;
  password?: string;
}

export interface AgentCaisseApiResponse {
  success: boolean;
  data?: AgentCaisse | AgentCaisse[];
  message?: string;
}

export interface AgentCaisseState {
  agents: AgentCaisse[];
  loading: boolean;
  selectedAgent: AgentCaisse | null;
  error: string | null;
}

// types pour l'état des caisses
export interface AgentCaisseStats {
  soldeVente: number;
  soldeGain: number;
  nbreAgents: number;
  montantTotalVente: number;
}

export interface AgentHistoryRequest {
  date: string;
}

export interface AgentCaisseFiltered {
  id: string;
  nom: string;
  prenom: string;
  nbreVente: number;
  montantVente: number;
}

export interface EtatCaisseState {
  stats: AgentCaisseStats | null;
  agents: AgentCaisseFiltered[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
}