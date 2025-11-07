// @/app/dashboard/agents/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  List,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import React from "react";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import {
  AgentCaisse,
  CreateAgentRequest,
  UpdateAgentRequest,
} from "@/types/agent.types";
import toast from "react-hot-toast";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";
import AgentForm from "@/components/dashboard/agents/AgentForm";
import AgentList from "@/components/dashboard/agents/listAgents";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentCaisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentCaisse | null>(null);


  const agentService = ServiceFactory.createAgentCaisseService();
  const errorHandler = ErrorHandlerService.getInstance();



  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions agents caissiers
  const canReadAgent =
    hasPermission("READ_AGENT_CAISSE") || hasPermission("CRUD_AGENT_CAISSE");
  const canCreateAgent =
    hasPermission("CREATE_AGENT_CAISSE") || hasPermission("CRUD_AGENT_CAISSE");
  const canUpdateAgent =
    hasPermission("UPDATE_AGENT_CAISSE") || hasPermission("CRUD_AGENT_CAISSE");
  const canDeleteAgent =
    hasPermission("DELETE_AGENT_CAISSE") || hasPermission("CRUD_AGENT_CAISSE");

  const handleStateUpdate = useCallback((state: any) => {
    setAgents(state.agents || []);
    setLoading(state.loading || false);
    setError(state.error || null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!canReadAgent) {
        setError(
          "Vous n'avez pas les permissions nécessaires pour voir les agents caissiers"
        );
        setLoading(false);
        return;
      }

      try {
        await agentService.loadAll();
      } catch (err) {
        if (isMounted) {
          console.error("Erreur lors du chargement initial:", err);
        }
      }
    };

    if (canReadAgent) {
      const unsubscribe = agentService.subscribe(handleStateUpdate);
      loadInitialData();

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [agentService, handleStateUpdate, canReadAgent]);

  const loadAgents = async () => {
    if (!canReadAgent) {
      setError(
        "Vous n'avez pas les permissions nécessaires pour voir les agents caissiers"
      );
      return;
    }

    try {
      setRefreshing(true);
      await agentService.loadAll();
      toast.success("Liste des agents actualisée avec succès");
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      const errorMessage = errorHandler.getUserMessage(appError);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setGlobalLoading(true);
      await loadAgents();
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleCreateAgent = async (
    agentData: CreateAgentRequest | UpdateAgentRequest
  ): Promise<void> => {
    try {
      // S'assurer que les champs requis sont présents pour la création
      const createData: CreateAgentRequest = {
        username: agentData.username!,
        nom: agentData.nom!,
        prenom: agentData.prenom!,
        password: agentData.password!,
      };

      await agentService.create(createData);
      setShowForm(false);
      toast.success("Agent créé avec succès");
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      const errorMessage = errorHandler.getUserMessage(appError);
      toast.error(errorMessage);
    }
  };

  const handleUpdateAgent = async (
    agentData: CreateAgentRequest | UpdateAgentRequest
  ): Promise<void> => {
    if (!editingAgent) return;

    try {
      // Pour la mise à jour, on peut utiliser directement agentData car tous les champs sont optionnels
      await agentService.update(
        editingAgent.id,
        agentData as UpdateAgentRequest
      );
      setEditingAgent(null);
      toast.success("Agent modifié avec succès");
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      const errorMessage = errorHandler.getUserMessage(appError);
      toast.error(errorMessage);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) {
      try {
        await agentService.delete(id);
        toast.success("Agent supprimé avec succès");
      } catch (err) {
        const appError = errorHandler.normalizeError(err);
        const errorMessage = errorHandler.getUserMessage(appError);
        toast.error(errorMessage);
      }
    }
  };

  const handleEditAgent = (agent: AgentCaisse) => {
    setEditingAgent(agent);
    setShowForm(false);
  };

  // Si l'utilisateur n'a aucune permission agent caissier
  if (
    !hasAnyPermission([
      "READ_AGENT_CAISSE",
      "CREATE_AGENT_CAISSE",
      "UPDATE_AGENT_CAISSE",
      "DELETE_AGENT_CAISSE",
      "CRUD_AGENT_CAISSE",
    ])
  ) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-blue-600/70 dark:text-blue-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            section.
          </p>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    setError(null);
    agentService.clearError();
    handleRefresh();
  };

  // Gérer les erreurs globales avec toast
  useEffect(() => {
    if (error && !globalLoading) {
      toast.error(error);
    }
  }, [error, globalLoading]);

  const stats = {
    total: agents.length,
    totalVentes: agents.reduce((sum, agent) => sum + agent.montantVente, 0),
    totalTransactions: agents.reduce((sum, agent) => sum + agent.nbreVente, 0),
  };

  if (globalLoading && agents.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-blue-600 dark:text-blue-400">
            Chargement des agents caissiers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-management-pro min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6">
      {/* Overlay de chargement global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-blue-600">Actualisation en cours...</span>
          </div>
        </div>
      )}

      {/* Header avec titre */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
              <User className="w-8 h-8 mr-3" />
              Agents Caissiers
            </h1>
            <p className="text-blue-600/70 dark:text-blue-400/70 mt-2">
              Gestion des agents caissiers du système
            </p>
          </div>

          <div className="flex gap-3">
            <PermissionButton
              onClick={handleRefresh}
              permission="READ_AGENT_CAISSE"
              disabled={refreshing || globalLoading}
              className="btn-refresh flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </PermissionButton>

            <PermissionButton
              onClick={() => setShowForm(true)}
              permission="CREATE_AGENT_CAISSE"
              className="btn-create flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvel Agent
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-6 p-4 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
              <PermissionButton
                onClick={handleRetry}
                permission="READ_AGENT_CAISSE"
                className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline mr-4"
              >
                Réessayer
              </PermissionButton>
              <button
                onClick={() => {
                  setError(null);
                  agentService.clearError();
                }}
                className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section des statistiques */}
      <PermissionGuard permission="READ_AGENT_CAISSE">
        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                  Total Agents
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <Users className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                  Total Ventes
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalVentes.toLocaleString()} FCFA
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <BarChart3 className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Formulaire de création/édition */}
      {(showForm || editingAgent) && (
        <div className="mb-8">
          <AgentForm
            agent={editingAgent}
            onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent}
            onCancel={() => {
              setShowForm(false);
              setEditingAgent(null);
            }}
            loading={loading}
          />
        </div>
      )}

      {/* Section de la liste des agents */}
      <div className="agent-list-section">
        <div className="section-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Liste des Agents Caissiers
            </h2>
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>
        </div>

        <AgentList
          agents={agents}
          loading={loading}
          onEdit={handleEditAgent}
          onDelete={handleDeleteAgent}
          canUpdate={canUpdateAgent}
          canDelete={canDeleteAgent}
        />
      </div>
    </div>
  );
}
