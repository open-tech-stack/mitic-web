// @/app/dashboard/gestion-trajets/categories/tarifs/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  BarChart3,
  Tag,
  TrendingUp,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import CategorieForm from "@/components/dashboard/gestion-trajets/categories/tarifs/tarifForm";
import CategorieList from "@/components/dashboard/gestion-trajets/categories/tarifs/tarifList";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { Categorie } from "@/types/categorie.types";
import { CategorieType } from "@/types/categoryType.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function CategoriePage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [types, setTypes] = useState<CategorieType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

 

  const categorieService = ServiceFactory.createCategorieService();
  const categorieTypeService = ServiceFactory.createCategorieTypeService();
  const errorHandler = ErrorHandlerService.getInstance();
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions catégories
  const canReadCategorie = hasPermission('READ_CATEGORIE') || hasPermission('CRUD_CATEGORIE');
  const canCreateCategorie = hasPermission('CREATE_CATEGORIE') || hasPermission('CRUD_CATEGORIE');
  const canUpdateCategorie = hasPermission('UPDATE_CATEGORIE') || hasPermission('CRUD_CATEGORIE');
  const canDeleteCategorie = hasPermission('DELETE_CATEGORIE') || hasPermission('CRUD_CATEGORIE');

  // Callback pour mettre à jour l'état local quand les services changent
  const handleCategorieStateUpdate = useCallback((state: any) => {
    setCategories(state.categories || []);
    setLoading(state.loading || false);
    setError(state.error || null);
  }, []);

  const handleTypeStateUpdate = useCallback((state: any) => {
    setTypes(state.types || []);
    setServiceError(state.error || null);
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!canReadCategorie) {
        setError("Vous n'avez pas les permissions nécessaires pour voir les catégories");
        return;
      }

      try {
        setGlobalLoading(true);
        // Charger d'abord les types de catégories
        await categorieTypeService.loadAll();
        // Puis charger les catégories
        await categorieService.loadAll();
      } catch (err) {
        if (isMounted) {
          console.error("Erreur lors du chargement initial:", err);
          const appError = errorHandler.normalizeError(err);
          setError(errorHandler.getUserMessage(appError));
        }
      } finally {
        if (isMounted) {
          setGlobalLoading(false);
        }
      }
    };

    // S'abonner aux mises à jour des services seulement si on a la permission
    if (canReadCategorie) {
      const unsubscribeCategories = categorieService.subscribe(
        handleCategorieStateUpdate
      );
      const unsubscribeTypes = categorieTypeService.subscribe(
        handleTypeStateUpdate
      );

      // Charger les données initiales
      loadInitialData();

      return () => {
        isMounted = false;
        unsubscribeCategories();
        unsubscribeTypes();
      };
    }
  }, [
    categorieService,
    categorieTypeService,
    handleCategorieStateUpdate,
    handleTypeStateUpdate,
    errorHandler,
    canReadCategorie,
  ]);

  const loadCategories = async () => {
    if (!canReadCategorie) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les catégories");
      return;
    }

    try {
      setGlobalLoading(true);
      await categorieService.loadAll();
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      setError(errorHandler.getUserMessage(appError));
    } finally {
      setGlobalLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      await categorieTypeService.loadAll();
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      setServiceError(errorHandler.getUserMessage(appError));
    }
  };

  // Si l'utilisateur n'a aucune permission catégorie
  if (!hasAnyPermission(['READ_CATEGORIE', 'CREATE_CATEGORIE', 'UPDATE_CATEGORIE', 'DELETE_CATEGORIE', 'CRUD_CATEGORIE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Folder className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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
    total: categories.length,
    active: categories.length,
    coverage: categories.length > 0 ? 100 : 0,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreateCategorie) {
      alert("Vous n'avez pas la permission de créer une catégorie");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
    setSelectedCategorie(null);
    setError(null);
    categorieService.clearError();
  };

  const handleEditRequested = (categorie: Categorie) => {
    if (!canUpdateCategorie) {
      alert("Vous n'avez pas la permission de modifier une catégorie");
      return;
    }

    if (!categorie || !categorie.id) {
      setError("Impossible de modifier: données invalides");
      return;
    }

    setSelectedCategorie({ ...categorie });
    setShowEditForm(true);
    setShowAddForm(false);
    setError(null);
    categorieService.clearError();
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedCategorie(null);
    setError(null);
    categorieService.clearError();
  };

  const handleCreate = async (categorieData: Omit<Categorie, "id">) => {
    if (!canCreateCategorie) {
      alert("Vous n'avez pas la permission de créer une catégorie");
      return;
    }

    try {
      setGlobalLoading(true);
      await categorieService.create(categorieData);
      handleCancel();
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      setError(errorHandler.getUserMessage(appError));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleUpdate = (categorieData: Categorie | Omit<Categorie, "id">) => {
    if (!canUpdateCategorie) {
      alert("Vous n'avez pas la permission de modifier une catégorie");
      return;
    }

    if (!("id" in categorieData) || !categorieData.id) {
      setError("Impossible de mettre à jour: ID manquant");
      return;
    }

    (async () => {
      try {
        setGlobalLoading(true);
        await categorieService.update(categorieData as Categorie);
        handleCancel();
      } catch (err) {
        const appError = errorHandler.normalizeError(err);
        setError(errorHandler.getUserMessage(appError));
      } finally {
        setGlobalLoading(false);
      }
    })();
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteCategorie) {
      alert("Vous n'avez pas la permission de supprimer une catégorie");
      return;
    }

    if (!id) {
      setError("Impossible de supprimer: ID manquant");
      return;
    }

    if (confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
      try {
        setGlobalLoading(true);
        await categorieService.delete(id);
      } catch (err) {
        const appError = errorHandler.normalizeError(err);
        setError(errorHandler.getUserMessage(appError));
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const handleBulkDelete = async (categoriesToDelete: Categorie[]) => {
    if (!canDeleteCategorie) {
      alert("Vous n'avez pas la permission de supprimer des catégories");
      return;
    }

    if (
      confirm(
        `Voulez-vous vraiment supprimer ${categoriesToDelete.length} catégorie(s) ?`
      )
    ) {
      try {
        setGlobalLoading(true);
        for (const categorie of categoriesToDelete) {
          await categorieService.delete(categorie.id);
        }
      } catch (err) {
        const appError = errorHandler.normalizeError(err);
        setError(errorHandler.getUserMessage(appError));
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setServiceError(null);
    categorieService.clearError();
    categorieTypeService.clearError();
    loadCategories();
    loadTypes();
  };

  if (globalLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto" />
          <p className="mt-4 text-amber-600 dark:text-amber-400">
            Chargement des catégories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Overlay de chargement global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-amber-600">Traitement en cours...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Folder className="w-8 h-8 mr-3" />
              Gestion des Catégories
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les catégories de véhicules et leurs tarifs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={handleRetry}
              permission="READ_CATEGORIE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
              title="Actualiser les données"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser la liste
            </PermissionButton>

            {!showAddForm && !showEditForm && (
              <PermissionButton
                onClick={handleAdd}
                permission="CREATE_CATEGORIE"
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={globalLoading || serviceError !== null}
              >
                <Plus className="w-5 h-5" />
                Ajouter une catégorie
              </PermissionButton>
            )}
          </div>
        </div>

        {/* Affichage des erreurs */}
        {(error || serviceError) && (
          <div className="mt-6 p-4 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  {error || serviceError}
                </p>
                <PermissionButton
                  onClick={handleRetry}
                  permission="READ_CATEGORIE"
                  className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline mr-4"
                >
                  Réessayer
                </PermissionButton>
                <button
                  onClick={() => {
                    setError(null);
                    setServiceError(null);
                    categorieService.clearError();
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

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_CATEGORIE">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Total Catégories
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <BarChart3 className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Catégories Actives
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

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
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
      </div>

      {/* Section de la liste */}
      {!showAddForm && !showEditForm && (
        <CategorieList
          categories={categories}
          types={types}
          loading={loading}
          onEdit={handleEditRequested}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          canCreate={canCreateCategorie}
          canUpdate={canUpdateCategorie}
          canDelete={canDeleteCategorie}
        />
      )}

      {/* Modal de formulaire d'ajout */}
      <PermissionGuard permission="CREATE_CATEGORIE">
        <AnimatePresence>
          {showAddForm && (
            <CategorieForm
              show={true}
              categorie={{ typeCategorie: 0, nbreEssieux: 0, montant: 25 }}
              isEdit={false}
              onClose={handleCancel}
              onSubmit={handleCreate}
              types={types}
            />
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de formulaire de modification */}
      <PermissionGuard permission="UPDATE_CATEGORIE">
        <AnimatePresence>
          {showEditForm && selectedCategorie && (
            <CategorieForm
              show={true}
              categorie={selectedCategorie}
              isEdit={true}
              onClose={handleCancel}
              onSubmit={handleUpdate}
              types={types}
            />
          )}
        </AnimatePresence>
      </PermissionGuard>
    </div>
  );
}