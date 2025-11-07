// @/app/agentCaisse/etat/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AgentCaisseStats, AgentCaisseFiltered } from "@/types/agent.types";
import toast from "react-hot-toast";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";
import { ErrorHandlerService } from "@/services/core/error-handler.service";

export default function EtatPage() {
  const [stats, setStats] = useState<AgentCaisseStats | null>(null);
  const [agents, setAgents] = useState<AgentCaisseFiltered[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  

  const etatCaisseService = ServiceFactory.createEtatCaisseService();
  const errorHandler = ErrorHandlerService.getInstance();
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions
  const canReadAgent =
    hasPermission("READ_AGENT_CAISSE") || hasPermission("CRUD_AGENT_CAISSE");
    hasPermission("READ_DASHBOARD") || hasPermission("CRUD_AGENT_CAISSE")

  const handleStateUpdate = useCallback((state: any) => {
    setStats(state.stats || null);
    setAgents(state.agents || []);
    setLoading(state.loading || false);
    setError(state.error || null);
    setSelectedDate(
      state.selectedDate || new Date().toISOString().split("T")[0]
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!canReadAgent) {
        setError(
          "Vous n'avez pas les permissions nécessaires pour voir l'état des caisses"
        );
        setLoading(false);
        return;
      }

      try {
        await etatCaisseService.loadStats();
        await etatCaisseService.loadTodayAgents();
      } catch (err) {
        if (isMounted) {
          console.error("Erreur lors du chargement initial:", err);
        }
      }
    };

    if (canReadAgent) {
      const unsubscribe = etatCaisseService.subscribe(handleStateUpdate);
      loadInitialData();

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [etatCaisseService, handleStateUpdate, canReadAgent]);

  const loadStats = async () => {
    if (!canReadAgent) return;

    try {
      await etatCaisseService.loadStats();
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      const errorMessage = errorHandler.getUserMessage(appError);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const loadAgentsByDate = async (date: string) => {
    if (!canReadAgent) return;

    try {
      await etatCaisseService.loadAgentsByDate(date);
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      const errorMessage = errorHandler.getUserMessage(appError);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRefresh = async () => {
    try {
      setGlobalLoading(true);
      await loadStats();
      await loadAgentsByDate(selectedDate);
      toast.success("Données actualisées avec succès");
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleTodayClick = async () => {
    try {
      setRefreshing(true);
      await etatCaisseService.loadTodayAgents();
    } finally {
      setRefreshing(false);
    }
  };

  const handleYesterdayClick = async () => {
    try {
      setRefreshing(true);
      await etatCaisseService.loadYesterdayAgents();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    if (!etatCaisseService.isDateValid(date)) {
      toast.error("La date ne peut pas être dans le futur");
      return;
    }

    try {
      setRefreshing(true);
      await loadAgentsByDate(date);
      setShowDatePicker(false);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    etatCaisseService.clearError();
    handleRefresh();
  };

  // Si l'utilisateur n'a aucune permission
  if (!hasAnyPermission(["READ_AGENT_CAISSE", "READ_AGENT_CRUD"])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            section.
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(amount);
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  const isToday = selectedDate === getTodayDate();
  const isYesterday = selectedDate === getYesterdayDate();

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Overlay de chargement global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-amber-600">Actualisation en cours...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <CreditCard className="w-8 h-8 mr-3" />
              État des Caisses Agents
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Aperçu des statistiques et performances des agents caissiers
            </p>
            
          </div>

          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={handleRefresh}
              permission="READ_AGENT_CAISSE"
              disabled={refreshing || globalLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </PermissionButton>
          </div>
        </div>

       

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-4 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl">
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
                    etatCaisseService.clearError();
                  }}
                  className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        <PermissionGuard permission="READ_DASHBOARD">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600/70 dark:text-green-400/70 text-sm">
                    Solde de Vente
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats ? formatCurrency(stats.soldeVente) : "..."}
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                    Solde disponible
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                  <Wallet className="w-6 h-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                    Solde de Gain
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats ? formatCurrency(stats.soldeGain) : "..."}
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    Bénéfices
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                  <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl p-6 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600/70 dark:text-purple-400/70 text-sm">
                    Total Agents
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats ? stats.nbreAgents : "..."}
                  </p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                    Agents actifs
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-200/30 dark:bg-purple-700/30">
                  <Users className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Montant Total Ventes
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats ? formatCurrency(stats.montantTotalVente) : "..."}
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Chiffre d'affaires
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <BarChart3 className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>

         {/* Sélecteur de date */}
        <div className="flex items-center gap-3 mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
          <span className="text-amber-900 dark:text-amber-100 font-medium">
            Période :
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTodayClick}
              disabled={refreshing || isToday}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isToday
                  ? "bg-amber-500 text-white"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 dark:text-amber-100"
              } disabled:opacity-50`}
            >
              Aujourd'hui
            </button>

            <button
              onClick={handleYesterdayClick}
              disabled={refreshing || isYesterday}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isYesterday
                  ? "bg-amber-500 text-white"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 dark:text-amber-100"
              } disabled:opacity-50`}
            >
              Hier
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 dark:text-amber-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                Choisir une date
              </button>

              {showDatePicker && (
                <div className="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-gray-800 border border-amber-200/30 dark:border-amber-700/30 rounded-xl shadow-lg p-4">
                  <input
                    type="date"
                    value={selectedDate}
                    max={getTodayDate()}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-full mt-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Liste des performances par agent */}
      <PermissionGuard permission="READ_AGENT_CAISSE">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30">
          <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Performances par Agent Caissier
            </h2>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
              Données du {etatCaisseService.formatDateForDisplay(selectedDate)}
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Aucune donnée disponible pour cette date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full">
                        <span className="text-amber-900 dark:text-amber-100 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                          {agent.nom} {agent.prenom}
                        </h3>
                        <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                          {agent.nbreVente} ventes
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        {formatCurrency(agent.montantVente)}
                      </p>
                      <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                        Montant total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
}
