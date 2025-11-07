// @/app/dashboard/gestion-trajets/localites/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Plus,
  RefreshCw,
  Cloud,
  Navigation,
  BarChart3,
} from "lucide-react";
import ListLocalite from "@/components/dashboard/gestion-trajets/localites/listLocalite";
import LocaliteForm, {
  LocaliteData,
} from "@/components/dashboard/gestion-trajets/localites/localiteForm";
import { LocaliteService } from "@/services/localite/localite.service";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function LocalitePage() {
  const [localites, setLocalites] = useState<LocaliteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localiteToEdit, setLocaliteToEdit] = useState<LocaliteData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

 

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions localités
  const canReadLocalite =
    hasPermission("READ_LOCALITE") || hasPermission("CRUD_LOCALITE");
  const canCreateLocalite =
    hasPermission("CREATE_LOCALITE") || hasPermission("CRUD_LOCALITE");
  const canUpdateLocalite =
    hasPermission("UPDATE_LOCALITE") || hasPermission("CRUD_LOCALITE");
  const canDeleteLocalite =
    hasPermission("DELETE_LOCALITE") || hasPermission("CRUD_LOCALITE");

  const localiteService = LocaliteService.getInstance();
  const errorHandler = ErrorHandlerService.getInstance();

  // Charger les données
  useEffect(() => {
    if (canReadLocalite) {
      loadLocalites();

      // S'abonner aux mises à jour du service
      const unsubscribe = localiteService.subscribe((state) => {
        setLocalites(state.localites);
        setLoading(state.loading);
        setError(state.error);
      });

      return () => unsubscribe();
    }
  }, [canReadLocalite]);

  const loadLocalites = async () => {
    if (!canReadLocalite) {
      setError(
        "Vous n'avez pas les permissions nécessaires pour voir les localités"
      );
      return;
    }

    try {
      await localiteService.loadAllLocalites();
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleRefresh = () => {
    loadLocalites();
  };

  const handleAddLocalite = async (localiteData: LocaliteData) => {
    if (!canCreateLocalite) {
      alert("Vous n'avez pas la permission de créer une localité");
      return;
    }

    try {
      await localiteService.createLocalite(localiteData);
      setShowAddModal(false);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleUpdateLocalite = async (localiteData: LocaliteData) => {
    if (!localiteToEdit?.id || !canUpdateLocalite) {
      alert("Vous n'avez pas la permission de modifier une localité");
      return;
    }

    try {
      await localiteService.updateLocalite(localiteToEdit.id, localiteData);
      setShowEditModal(false);
      setLocaliteToEdit(null);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleDeleteLocalite = async (localiteId: string) => {
    if (!canDeleteLocalite) {
      alert("Vous n'avez pas la permission de supprimer une localité");
      return;
    }

    try {
      await localiteService.deleteLocalite(Number(localiteId));
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleEditLocalite = (localite: LocaliteData) => {
    if (!canUpdateLocalite) {
      alert("Vous n'avez pas la permission de modifier les localités");
      return;
    }
    setLocaliteToEdit(localite);
    setShowEditModal(true);
  };

  // Si l'utilisateur n'a aucune permission localité
  if (
    !hasAnyPermission([
      "READ_LOCALITE",
      "CREATE_LOCALITE",
      "UPDATE_LOCALITE",
      "DELETE_LOCALITE",
      "CRUD_LOCALITE",
    ])
  ) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  const stats = localiteService.stats;

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <MapPin className="w-8 h-8 mr-3" />
              Gestion des Localités
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les localités réelles et virtuelles de votre système
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={handleRefresh}
              disabled={loading}
              permission="READ_LOCALITE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </PermissionButton>

            <PermissionButton
              onClick={() => setShowAddModal(true)}
              permission="CREATE_LOCALITE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle localité</span>
            </PermissionButton>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_LOCALITE">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <BarChart3 className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Localités réelles
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.reelles}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Navigation className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Localités virtuelles
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.virtuelles}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Cloud className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Code max
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {localites.length > 0
                      ? Math.max(
                          ...localites.map((l) => parseInt(l.codeLoc, 10))
                        )
                          .toString()
                          .padStart(3, "0")
                      : "000"}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <span className="w-5 h-5 bg-blue-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Liste des localités - seulement si on peut lire */}
      <PermissionGuard
        permission="READ_LOCALITE"
        fallback={
          <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Vous n'avez pas la permission de voir la liste des localités</p>
          </div>
        }
      >
        <ListLocalite
          localites={localites}
          loading={loading}
          onEdit={handleEditLocalite}
          onDelete={handleDeleteLocalite}
          canCreate={canCreateLocalite}
          canUpdate={canUpdateLocalite}
          canDelete={canDeleteLocalite}
        />
      </PermissionGuard>

      {/* Modals avec permissions */}
      <PermissionGuard permission="CREATE_LOCALITE">
        {showAddModal && (
          <LocaliteForm
            onSubmit={handleAddLocalite}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </PermissionGuard>

      <PermissionGuard permission="UPDATE_LOCALITE">
        {showEditModal && localiteToEdit && (
          <LocaliteForm
            localiteData={localiteToEdit}
            onSubmit={handleUpdateLocalite}
            onCancel={() => {
              setShowEditModal(false);
              setLocaliteToEdit(null);
            }}
          />
        )}
      </PermissionGuard>
    </div>
  );
}
