// @/app/dashboard/divers/uo/page.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  TreePine,
  List,
  Star,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import AddUO from "@/components/dashboard/divers/uo/addUo";
import TreeUO from "@/components/dashboard/divers/uo/treeUo";
import UpdateUO from "@/components/dashboard/divers/uo/updateUo";
import ListUO from "@/components/dashboard/divers/uo/listUo";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";
import {
  OrganizationalUnit,
  CreateUoRequest,
  UpdateUoRequest,
} from "@/types/uo.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

enum ViewMode {
  LIST = "list",
  TREE = "tree",
}

export default function UOPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(
    null
  );
  const [unitsToDelete, setUnitsToDelete] = useState<OrganizationalUnit[]>([]);
  const [parentForNewUnit, setParentForNewUnit] =
    useState<OrganizationalUnit | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<OrganizationalUnit[]>([]);
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  

  const uoService = useMemo(() => ServiceFactory.createUoService(), []);
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions
  const canReadUO = hasPermission('READ_UO') || hasPermission('CRUD_UO');
  const canCreateUO = hasPermission('CREATE_UO') || hasPermission('CRUD_UO');
  const canUpdateUO = hasPermission('UPDATE_UO') || hasPermission('CRUD_UO');
  const canDeleteUO = hasPermission('DELETE_UO') || hasPermission('CRUD_UO');

  // Chargement initial des données - seulement si l'utilisateur peut lire
  useEffect(() => {
    if (canReadUO) {
      loadData();
    }
  }, [uoService, canReadUO]);

  const loadData = async () => {
    if (!canReadUO) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les unités organisationnelles");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await uoService.loadAll();
      if (result.success) {
        setUnits(uoService.getUnits());
      } else {
        setError(result.error?.message || "Erreur lors du chargement");
      }
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Erreur loadData:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Souscription aux changements d'état
  useEffect(() => {
    if (!canReadUO) return;

    const unsubscribe = uoService.subscribe((state) => {
      setUnits(state.units);
      setIsLoading(state.isLoading);
      setError(state.error);
    });

    return unsubscribe;
  }, [uoService, canReadUO]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = async () => {
    if (!canReadUO) {
      toast.error("Vous n'avez pas la permission de rafraîchir les données");
      return;
    }

    await loadData();
    toast.success("Liste actualisée");
  };

  const handleAddUnit = async (
    newUnitData: Omit<
      OrganizationalUnit,
      "enfants" | "compte" | "usersAssocies"
    >
  ) => {
    if (!canCreateUO) {
      toast.error("Vous n'avez pas la permission de créer une unité");
      return;
    }

    const createRequest: CreateUoRequest = {
      codeUo: newUnitData.codeUo,
      libUo: newUnitData.libUo,
      parent: newUnitData.parent,
    };

    try {
      const result = await uoService.create(createRequest);

      if (result.success) {
        setShowAddModal(false);
        setParentForNewUnit(null);
        toast.success("Unité créée avec succès");
      } else {
        toast.error(result.error?.message || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleUpdateUnit = async (updatedUnitData: OrganizationalUnit) => {
    if (!canUpdateUO) {
      toast.error("Vous n'avez pas la permission de modifier cette unité");
      return;
    }

    const updateRequest: UpdateUoRequest = {
      codeUo: updatedUnitData.codeUo,
      libUo: updatedUnitData.libUo,
      parent: updatedUnitData.parent,
    };

    try {
      const result = await uoService.update(
        updatedUnitData.codeUo,
        updateRequest
      );

      if (result.success) {
        setShowEditModal(false);
        setSelectedUnit(null);
        toast.success("Unité modifiée avec succès");
      } else {
        toast.error(result.error?.message || "Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteUnit = async (unit: OrganizationalUnit) => {
    if (!canDeleteUO) {
      toast.error("Vous n'avez pas la permission de supprimer cette unité");
      return;
    }

    try {
      const result = await uoService.delete(unit.codeUo);

      if (result.success) {
        setShowDeleteModal(false);
        setUnitsToDelete([]);
        toast.success("Unité supprimée avec succès");
      } else {
        toast.error(result.error?.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkDelete = async (unitsToDelete: OrganizationalUnit[]) => {
    if (!canDeleteUO) {
      toast.error("Vous n'avez pas la permission de supprimer des unités");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const unit of unitsToDelete) {
      try {
        const result = await uoService.delete(unit.codeUo);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setSelectedUnits([]);
    setShowDeleteModal(false);

    if (successCount > 0) {
      toast.success(`${successCount} unité(s) supprimée(s)`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} unité(s) n'ont pas pu être supprimées`);
    }
  };

  const handleAddChildUnit = (parent: OrganizationalUnit) => {
    if (!canCreateUO) {
      toast.error("Vous n'avez pas la permission d'ajouter une sous-unité");
      return;
    }
    setParentForNewUnit(parent);
    setShowAddModal(true);
  };

  // Si l'utilisateur n'a aucune permission UO
  if (!hasAnyPermission(['READ_UO', 'CREATE_UO', 'UPDATE_UO', 'DELETE_UO', 'CRUD_UO'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Statistiques - seulement si on peut lire
  const stats = useMemo(() => {
    if (!canReadUO) return { total: 0, racines: 0, enfants: 0 };
    
    const rootUnits = units.filter((u) => !u.parent);
    return {
      total: units.length,
      racines: rootUnits.length,
      enfants: units.filter((u) => u.parent !== null).length,
    };
  }, [units, canReadUO]);

  const availableParents = useMemo(() => {
    return canReadUO ? uoService.getAvailableParents(selectedUnit?.codeUo) : [];
  }, [uoService, selectedUnit, canReadUO]);

  const allAvailableParents = useMemo(() => {
    return canReadUO ? uoService.getAvailableParents() : [];
  }, [uoService, canReadUO]);

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Building2 className="w-8 h-8 mr-3" />
              Unités Organisationnelles
            </h1>
            <div className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez la structure hiérarchique de votre organisation
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Problème de connexion - Certaines fonctionnalités peuvent être
                  limitées
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_UO">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Total
                  </div>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.total}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Unités racines
                  </div>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.racines}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Star className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Sous-unités
                  </div>
                  <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.enfants}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Users className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Contrôles de vue */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PermissionGuard permission="READ_UO">
              <button
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  viewMode === ViewMode.LIST
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                }`}
              >
                <List className="w-4 h-4" />
                <span>Liste</span>
              </button>

              <button
                onClick={() => setViewMode(ViewMode.TREE)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  viewMode === ViewMode.TREE
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                }`}
              >
                <TreePine className="w-4 h-4" />
                <span>Arborescence</span>
              </button>
            </PermissionGuard>
          </div>

          <div className="flex items-center gap-2">
            <PermissionButton
              onClick={() => setShowAddModal(true)}
              permission="CREATE_UO"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              <span>Nouvelle unité</span>
            </PermissionButton>

            <PermissionButton
              onClick={handleRefresh}
              disabled={isLoading}
              permission="READ_UO"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Actualiser</span>
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Contenu principal - seulement si on peut lire */}
      <PermissionGuard permission="READ_UO" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir les unités organisationnelles</p>
        </div>
      }>
        <div className="mb-8">
          <AnimatePresence mode="wait">
            {viewMode === ViewMode.LIST ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ListUO
                  data={units}
                  loading={isLoading}
                  onEdit={(unit) => {
                    setSelectedUnit(unit);
                    setShowEditModal(true);
                  }}
                  onDelete={(unit) => {
                    setUnitsToDelete([unit]);
                    setShowDeleteModal(true);
                  }}
                  onRefresh={handleRefresh}
                  onAddUnit={() => setShowAddModal(true)}
                  onImport={() => {
                    toast("Fonctionnalité d'import en cours de développement");
                  }}
                  onSelectionChange={setSelectedUnits}
                  onBulkDelete={(units) => {
                    setUnitsToDelete(units);
                    setShowDeleteModal(true);
                  }}
                  canCreate={canCreateUO}
                  canUpdate={canUpdateUO}
                  canDelete={canDeleteUO}
                />
              </motion.div>
            ) : (
              <motion.div
                key="tree-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TreeUO
                  units={units}
                  onEdit={(unit) => {
                    setSelectedUnit(unit);
                    setShowEditModal(true);
                  }}
                  onDelete={(unit) => {
                    setUnitsToDelete([unit]);
                    setShowDeleteModal(true);
                  }}
                  onAddChild={handleAddChildUnit}
                  canCreate={canCreateUO}
                  canUpdate={canUpdateUO}
                  canDelete={canDeleteUO}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PermissionGuard>

      {/* Modals avec permissions */}
      <PermissionGuard permission="CREATE_UO">
        <AddUO
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setParentForNewUnit(null);
          }}
          onAdd={handleAddUnit}
          parentUnit={parentForNewUnit || undefined}
          availableParents={allAvailableParents}
        />
      </PermissionGuard>

      <PermissionGuard permission="UPDATE_UO">
        <UpdateUO
          unit={selectedUnit}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
          }}
          onUpdate={handleUpdateUnit}
          availableParents={availableParents}
        />
      </PermissionGuard>

      <PermissionGuard permission="DELETE_UO">
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (unitsToDelete.length === 1) {
              handleDeleteUnit(unitsToDelete[0]);
            } else {
              handleBulkDelete(unitsToDelete);
            }
          }}
          title="Confirmer la suppression"
          message={
            unitsToDelete.length === 1
              ? `Êtes-vous sûr de vouloir supprimer l'unité "${unitsToDelete[0]?.libUo}" ? Cette action est irréversible.`
              : `Êtes-vous sûr de vouloir supprimer ${unitsToDelete.length} unités organisationnelles ? Cette action est irréversible.`
          }
          confirmText="Supprimer"
          type="delete"
        />
      </PermissionGuard>
    </div>
  );
}