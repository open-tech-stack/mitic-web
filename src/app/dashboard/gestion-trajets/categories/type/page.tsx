// @/app/dashboard/gestion-trajets/categories/type/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart2,
  Tag,
  TrendingUp,
  List,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw
} from "lucide-react";
import CategorieTypeList from "@/components/dashboard/gestion-trajets/categories/type/CategorieTypeList";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { CategorieType } from "@/types/categoryType.types";
import toast from "react-hot-toast";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function CategorieTypePage() {
  const [types, setTypes] = useState<CategorieType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

 

  const categorieTypeService = ServiceFactory.createCategorieTypeService();
  const errorHandler = ErrorHandlerService.getInstance();
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions types de catégorie
  const canReadCategoryType = hasPermission('READ_CATEGORY_TYPE') || hasPermission('CRUD_CATEGORY_TYPE');
  const canCreateCategoryType = hasPermission('CREATE_CATEGORY_TYPE') || hasPermission('CRUD_CATEGORY_TYPE');
  const canUpdateCategoryType = hasPermission('UPDATE_CATEGORY_TYPE') || hasPermission('CRUD_CATEGORY_TYPE');
  const canDeleteCategoryType = hasPermission('DELETE_CATEGORY_TYPE') || hasPermission('CRUD_CATEGORY_TYPE');

  const handleStateUpdate = useCallback((state: any) => {
    setTypes(state.types || []);
    setLoading(state.loading || false);
    setError(state.error || null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!canReadCategoryType) {
        setError("Vous n'avez pas les permissions nécessaires pour voir les types de catégorie");
        return;
      }

      try {
        await categorieTypeService.loadAll();
      } catch (err) {
        if (isMounted) {
          console.error("Erreur lors du chargement initial:", err);
        }
      }
    };

    if (canReadCategoryType) {
      const unsubscribe = categorieTypeService.subscribe(handleStateUpdate);
      loadInitialData();

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [categorieTypeService, handleStateUpdate, canReadCategoryType]);

  const loadTypes = async () => {
    if (!canReadCategoryType) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les types de catégorie");
      return;
    }

    try {
      setRefreshing(true);
      await categorieTypeService.loadAll();
      toast.success("Liste des types de catégorie actualisée avec succès");
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
      await loadTypes();
    } finally {
      setGlobalLoading(false);
    }
  };

  // Si l'utilisateur n'a aucune permission type de catégorie
  if (!hasAnyPermission(['READ_CATEGORY_TYPE', 'CREATE_CATEGORY_TYPE', 'UPDATE_CATEGORY_TYPE', 'DELETE_CATEGORY_TYPE', 'CRUD_CATEGORY_TYPE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Handlers simplifiés - seulement pour l'affichage
  const handleEditRequested = (type: CategorieType) => {
    if (!canUpdateCategoryType) {
      toast.error("Vous n'avez pas la permission de modifier les types de catégorie");
      return;
    }
    toast.error("La modification des types de catégorie est désactivée.");
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteCategoryType) {
      toast.error("Vous n'avez pas la permission de supprimer les types de catégorie");
      return;
    }
    toast.error("La suppression des types de catégorie est désactivée.");
  };

  const handleRetry = () => {
    setError(null);
    categorieTypeService.clearError();
    handleRefresh();
  };

  // Gérer les erreurs globales avec toast
  useEffect(() => {
    if (error && !globalLoading) {
      toast.error(error);
    }
  }, [error, globalLoading]);

  if (globalLoading && types.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto" />
          <p className="mt-4 text-amber-600 dark:text-amber-400">
            Chargement des types de catégorie...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="type-management-pro min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Overlay de chargement global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-amber-600">Actualisation en cours...</span>
          </div>
        </div>
      )}

      {/* Header avec titre */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Eye className="w-8 h-8 mr-3" />
              Types de Catégorie
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Visualisation des types de catégories de véhicules
            </p>
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
                permission="READ_CATEGORY_TYPE"
                className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline mr-4"
              >
                Réessayer
              </PermissionButton>
              <button
                onClick={() => {
                  setError(null);
                  categorieTypeService.clearError();
                }}
                className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_CATEGORY_TYPE">
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
      <div className="type-list-section">
        <div className="section-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Liste des Types de Catégorie
            </h2>
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            )}
          </div>
          <PermissionButton
            onClick={handleRefresh}
            permission="READ_CATEGORY_TYPE"
            disabled={refreshing || globalLoading}
            className="btn-refresh flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </PermissionButton>
        </div>

        <PermissionGuard permission="READ_CATEGORY_TYPE" fallback={
          <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Vous n'avez pas la permission de voir la liste des types de catégorie</p>
          </div>
        }>
          <CategorieTypeList
            types={types}
            onEditRequested={handleEditRequested}
            onDelete={handleDelete}
            loading={loading}
          />
        </PermissionGuard>
      </div>
    </div>
  );
}