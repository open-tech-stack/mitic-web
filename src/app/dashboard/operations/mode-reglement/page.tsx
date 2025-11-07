// @/app/dashboard/operations/mode-reglement/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  BarChart2,
  Tag,
  TrendingUp,
  List,
  RefreshCw,
} from "lucide-react";
import ModeReglementList from "@/components/dashboard/operations/mode-reglement/ModeReglementList";
import { ModeReglement } from "@/types/modeReglement.types";
import toast from "react-hot-toast";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function ModeReglementPage() {
  const [modes, setModes] = useState<ModeReglement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  

  
  const modeReglementService = ServiceFactory.createModeReglementService();
  
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions modes de règlement
  const canReadModeReglement = hasPermission('READ_MODE_REGLEMENT') || hasPermission('CRUD_MODE_REGLEMENT');

  const loadModes = async () => {
    if (!canReadModeReglement) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les modes de règlement");
      return;
    }

    try {
      setRefreshing(true);
      await modeReglementService.loadAll();
      toast.success("Liste actualisée avec succès");
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors de l'actualisation de la liste");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canReadModeReglement) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les modes de règlement");
      setLoading(false);
      return;
    }

    const unsubscribe = modeReglementService.subscribe((state) => {
      setModes(state.modes);
      setLoading(state.loading);
      setError(state.error);
      
      // Gérer les erreurs avec toast
      if (state.error) {
        toast.error(state.error);
      }
    });

    // Charger les données initiales
    loadModes().catch(console.error);

    return () => unsubscribe();
  }, [canReadModeReglement]);

  // Si l'utilisateur n'a aucune permission mode de règlement
  if (!hasAnyPermission(['READ_MODE_REGLEMENT', 'CREATE_MODE_REGLEMENT', 'UPDATE_MODE_REGLEMENT', 'DELETE_MODE_REGLEMENT', 'CRUD_MODE_REGLEMENT'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    total: modes.length,
    active: modes.length,
    coverage: modes.length > 0 ? 100 : 0,
  };

  return (
    <div className="mode-reglement-management-pro min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <CreditCard className="w-8 h-8 mr-3" />
              Gestion des Modes de Règlement
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les différents modes de règlement disponibles dans le
              système
            </p>
          </div>
        </div>
      </div>

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_MODE_REGLEMENT">
        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Total Modes
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <BarChart2 className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Modes Actifs
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <Tag className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Couverture Active
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.coverage}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <TrendingUp className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Section de la liste des modes */}
      <div className="mode-reglement-list-section">
        <div className="section-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Liste des Modes de Règlement
            </h2>
          </div>
          <PermissionButton
            onClick={loadModes}
            permission="READ_MODE_REGLEMENT"
            disabled={refreshing}
            className="btn-refresh flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </PermissionButton>
        </div>

        <ModeReglementList modes={modes} />
      </div>
    </div>
  );
}