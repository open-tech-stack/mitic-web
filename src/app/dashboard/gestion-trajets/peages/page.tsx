// @/app/dashboard/gestion-trajets/peages/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Route,
  Plus,
  RefreshCw,
  MapPin,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import ListPeage from "@/components/dashboard/gestion-trajets/peages/peageList";
import PeageForm from "@/components/dashboard/gestion-trajets/peages/peageForm";
import { PeageService } from "@/services/peage/peage.service";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { LocaliteService } from "@/services/localite/localite.service";
import {
  Peage,
  PeageCreateRequest,
  PeageUpdateRequest,
} from "@/types/peage.types";
import { Localite } from "@/types/localite.types";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function PeagePage() {
  const [peages, setPeages] = useState<Peage[]>([]);
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [peageToEdit, setPeageToEdit] = useState<Peage | null>(null);
  const [error, setError] = useState<string | null>(null);


  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions péages
  const canReadPeage = hasPermission('READ_PEAGE') || hasPermission('CRUD_PEAGE');
  const canCreatePeage = hasPermission('CREATE_PEAGE') || hasPermission('CRUD_PEAGE');
  const canUpdatePeage = hasPermission('UPDATE_PEAGE') || hasPermission('CRUD_PEAGE');
  const canDeletePeage = hasPermission('DELETE_PEAGE') || hasPermission('CRUD_PEAGE');

  const peageService = PeageService.getInstance();
  const localiteService = LocaliteService.getInstance();
  const errorHandler = ErrorHandlerService.getInstance();

  useEffect(() => {
    if (canReadPeage) {
      loadAllData();

      const unsubscribePeage = peageService.subscribe((state) => {
        setPeages(state.peages);
        setLoading(state.loading);
        setError(state.error);
      });

      const unsubscribeLocalite = localiteService.subscribe((state) => {
        setLocalites(state.localites);
      });

      return () => {
        unsubscribePeage();
        unsubscribeLocalite();
      };
    }
  }, [canReadPeage]);

  const loadAllData = async () => {
    if (!canReadPeage) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les péages");
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        localiteService.loadAllLocalites(),
        peageService.loadAllPeages(),
      ]);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAllData();
  };

  // 🔥 CORRECTION : Accepter PeageCreateRequest
  const handleAddPeage = async (peageData: PeageCreateRequest) => {
    if (!canCreatePeage) {
      alert("Vous n'avez pas la permission de créer un péage");
      return;
    }

    try {
      await peageService.createPeage(peageData);
      setShowAddModal(false);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  // 🔥 CORRECTION : Accepter PeageUpdateRequest
  const handleUpdatePeage = async (peageData: PeageUpdateRequest) => {
    if (!peageToEdit?.id || !canUpdatePeage) {
      alert("Vous n'avez pas la permission de modifier un péage");
      return;
    }

    try {
      await peageService.updatePeage(peageToEdit.id, peageData);
      setShowEditModal(false);
      setPeageToEdit(null);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleDeletePeage = async (peageId: number) => {
    if (!canDeletePeage) {
      alert("Vous n'avez pas la permission de supprimer un péage");
      return;
    }

    try {
      await peageService.deletePeage(peageId);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleEditPeage = (peage: Peage) => {
    if (!canUpdatePeage) {
      alert("Vous n'avez pas la permission de modifier les péages");
      return;
    }
    setPeageToEdit(peage);
    setShowEditModal(true);
  };

  // Si l'utilisateur n'a aucune permission péage
  if (!hasAnyPermission(['READ_PEAGE', 'CREATE_PEAGE', 'UPDATE_PEAGE', 'DELETE_PEAGE', 'CRUD_PEAGE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Route className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  const stats = peageService.stats;

  const getPhysicalLocalites = () => {
    return localites.filter((l) => !l.virtuel);
  };

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Route className="w-8 h-8 mr-3" />
              Gestion des Péages
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les péages et leur association avec les localités
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={handleRefresh}
              disabled={loading}
              permission="READ_PEAGE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </PermissionButton>

            <PermissionButton
              onClick={() => setShowAddModal(true)}
              permission="CREATE_PEAGE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau péage</span>
            </PermissionButton>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_PEAGE">
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
                    Localités couvertes
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {Object.keys(stats.parLocalite).length}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <MapPin className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Max par localité
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {Object.values(stats.parLocalite).length > 0
                      ? Math.max(...Object.values(stats.parLocalite))
                      : 0}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <TrendingUp className="w-5 h-5 text-amber-700 dark:text-amber-300" />
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
                    {peages.length > 0
                      ? Math.max(...peages.map((p) => parseInt(p.codPeage, 10)))
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

      {/* Liste des péages - seulement si on peut lire */}
      <PermissionGuard permission="READ_PEAGE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des péages</p>
        </div>
      }>
        <ListPeage
          peages={peages}
          loading={loading}
          onEdit={handleEditPeage}
          onDelete={handleDeletePeage}
          canCreate={canCreatePeage}
          canUpdate={canUpdatePeage}
          canDelete={canDeletePeage}
        />
      </PermissionGuard>

      {/* Modals avec permissions */}
      <PermissionGuard permission="CREATE_PEAGE">
        {showAddModal && (
          <PeageForm
            localites={getPhysicalLocalites()}
            onSubmit={(data) => {
              void handleAddPeage(data as PeageCreateRequest);
            }}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </PermissionGuard>

      <PermissionGuard permission="UPDATE_PEAGE">
        {showEditModal && peageToEdit && (
          <PeageForm
            localites={getPhysicalLocalites()}
            peageData={peageToEdit}
            onSubmit={(data) => {
              void handleUpdatePeage(data as PeageUpdateRequest);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setPeageToEdit(null);
            }}
          />
        )}
      </PermissionGuard>
    </div>
  );
}