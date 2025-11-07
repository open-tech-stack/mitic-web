// @/app/dashboard/operations/type-operation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Receipt, BarChart2, Tag, TrendingUp, List, RefreshCw } from "lucide-react";
import OperationTypeList from "@/components/dashboard/operations/type/OperationTypeList";
import { TypeOperation } from "@/types/typeOperation.types";
import toast from "react-hot-toast";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function OperationTypePage() {
  const [types, setTypes] = useState<TypeOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  const typeOperationService = ServiceFactory.createTypeOperationService();

  const { hasPermission, hasAnyPermission } = useAuth();
  
  // Vérifications des permissions types d'opération
  const canReadTypeOperation = hasPermission('READ_TYPE_OPERATION') || hasPermission('CRUD_TYPE_OPERATION');

  const loadTypes = async () => {
    if (!canReadTypeOperation) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les types d'opération");
      return;
    }

    try {
      setRefreshing(true);
      await typeOperationService.loadAll();
      toast.success("Liste des types d'opération actualisée avec succès");
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors de l'actualisation de la liste");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canReadTypeOperation) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les types d'opération");
      setLoading(false);
      return;
    }

    const unsubscribe = typeOperationService.subscribe((state) => {
      setTypes(state.types);
      setLoading(state.loading);
      setError(state.error);
      
      // Gérer les erreurs avec toast
      if (state.error) {
        toast.error(state.error);
      }
    });

    // Charger les données initiales
    loadTypes().catch(console.error);

    return () => unsubscribe();
  }, [canReadTypeOperation]);

  // Si l'utilisateur n'a aucune permission type d'opération
  if (!hasAnyPermission(['READ_TYPE_OPERATION', 'CREATE_TYPE_OPERATION', 'UPDATE_TYPE_OPERATION', 'DELETE_TYPE_OPERATION', 'CRUD_TYPE_OPERATION'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Receipt className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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
    total: types.length,
    active: types.length,
    coverage: types.length > 0 ? 100 : 0,
  };

  return (
    <div className="operation-type-management-pro min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Receipt className="w-8 h-8 mr-3" />
              Gestion des Types d'Opération
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les types d'opérations disponibles dans le système
            </p>
          </div>
        </div>
      </div>

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_TYPE_OPERATION">
        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Total Types
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
                  Types Actifs
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

      {/* Section de la liste des types */}
      <div className="operation-type-list-section">
        <div className="section-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Liste des types d'opérations
            </h2>
          </div>
          <PermissionButton
            onClick={loadTypes}
            permission="READ_TYPE_OPERATION"
            disabled={refreshing}
            className="btn-refresh flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </PermissionButton>
        </div>
        <OperationTypeList types={types} />
      </div>
    </div>
  );
}