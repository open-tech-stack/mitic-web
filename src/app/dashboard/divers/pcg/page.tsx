// @/app/dashboard/divers/pcg/page.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calculator,
  TreePine,
  List,
  Star,
  RefreshCw,
  AlertTriangle,
  Hash,
} from "lucide-react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";
import { Pcg, CreatePcgRequest, UpdatePcgRequest } from "@/types/pcg.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import AddPcg from "@/components/dashboard/divers/pcg/pcgAdd";
import ListPcg from "@/components/dashboard/divers/pcg/pcgList";
import TreePcg from "@/components/dashboard/divers/pcg/pcgTree";
import UpdatePcg from "@/components/dashboard/divers/pcg/pcgUpdate";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

enum ViewMode {
  LIST = "list",
  TREE = "tree",
}

export default function PcgPage() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompte, setSelectedCompte] = useState<Pcg | null>(null);
  const [comptesToDelete, setComptesToDelete] = useState<Pcg[]>([]);
  const [parentForNewCompte, setParentForNewCompte] = useState<Pcg | null>(
    null
  );
  const [selectedComptes, setSelectedComptes] = useState<Pcg[]>([]);
  const [comptes, setComptes] = useState<Pcg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const pcgService = useMemo(() => ServiceFactory.createPcgService(), []);
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions PCG
  const canReadPCG = hasPermission('READ_PCG') || hasPermission('CRUD_PCG');
  const canCreatePCG = hasPermission('CREATE_PCG') || hasPermission('CRUD_PCG');
  const canUpdatePCG = hasPermission('UPDATE_PCG') || hasPermission('CRUD_PCG');
  const canDeletePCG = hasPermission('DELETE_PCG') || hasPermission('CRUD_PCG');

  // Chargement initial des données - seulement si l'utilisateur peut lire
  useEffect(() => {
    if (canReadPCG) {
      loadData();
    }
  }, [pcgService, canReadPCG]);

  const loadData = async () => {
    if (!canReadPCG) {
      setError("Vous n'avez pas les permissions nécessaires pour voir le plan comptable");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await pcgService.loadAll();
      if (result.success) {
        setComptes(pcgService.getComptes());
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
    if (!canReadPCG) return;

    const unsubscribe = pcgService.subscribe((state) => {
      setComptes(state.comptes);
      setIsLoading(state.isLoading);
      setError(state.error);
    });

    return unsubscribe;
  }, [pcgService, canReadPCG]);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = async () => {
    if (!canReadPCG) {
      toast.error("Vous n'avez pas la permission de rafraîchir les données");
      return;
    }

    await loadData();
    toast.success("Plan comptable actualisé");
  };

  const handleAddCompte = async (
    newCompteData: Omit<Pcg, "sousComptes" | "path">
  ) => {
    if (!canCreatePCG) {
      toast.error("Vous n'avez pas la permission de créer un compte");
      return;
    }

    console.log("🔍 Données envoyées pour création:", newCompteData);

    const createRequest: CreatePcgRequest = {
      numeroCompte: newCompteData.numeroCompte,
      libelle: newCompteData.libelle,
      classe: newCompteData.classe,
    };

    try {
      const result = await pcgService.create(createRequest);

      if (result.success) {
        setShowAddModal(false);
        setParentForNewCompte(null);
        toast.success("Compte créé avec succès");
      } else {
        toast.error(result.error?.message || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleUpdateCompte = async (updatedCompteData: Pcg) => {
    if (!canUpdatePCG) {
      toast.error("Vous n'avez pas la permission de modifier ce compte");
      return;
    }

    const updateRequest: UpdatePcgRequest = {
      numeroCompte: updatedCompteData.numeroCompte,
      libelle: updatedCompteData.libelle,
      classe: updatedCompteData.classe,
    };

    try {
      const result = await pcgService.update(
        updatedCompteData.numeroCompte,
        updateRequest
      );

      if (result.success) {
        setShowEditModal(false);
        setSelectedCompte(null);
        toast.success("Compte modifié avec succès");
      } else {
        toast.error(result.error?.message || "Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteCompte = async (compte: Pcg) => {
    if (!canDeletePCG) {
      toast.error("Vous n'avez pas la permission de supprimer ce compte");
      return;
    }

    try {
      const result = await pcgService.delete(compte.numeroCompte);

      if (result.success) {
        setShowDeleteModal(false);
        setComptesToDelete([]);
        toast.success("Compte supprimé avec succès");
      } else {
        toast.error(result.error?.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleBulkDelete = async (comptesToDelete: Pcg[]) => {
    if (!canDeletePCG) {
      toast.error("Vous n'avez pas la permission de supprimer des comptes");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const compte of comptesToDelete) {
      try {
        const result = await pcgService.delete(compte.numeroCompte);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setSelectedComptes([]);
    setShowDeleteModal(false);

    if (successCount > 0) {
      toast.success(`${successCount} compte(s) supprimé(s)`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} compte(s) n'ont pas pu être supprimés`);
    }
  };

  const handleAddChildCompte = (parent: Pcg) => {
    if (!canCreatePCG) {
      toast.error("Vous n'avez pas la permission d'ajouter un sous-compte");
      return;
    }
    setParentForNewCompte(parent);
    setShowAddModal(true);
  };

  // Si l'utilisateur n'a aucune permission PCG
  if (!hasAnyPermission(['READ_PCG', 'CREATE_PCG', 'UPDATE_PCG', 'DELETE_PCG', 'CRUD_PCG'])) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-blue-600/70 dark:text-blue-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder au plan comptable.
          </p>
        </div>
      </div>
    );
  }

  // Statistiques - seulement si on peut lire
  const stats = useMemo(() => {
    if (!canReadPCG) return { total: 0, racines: 0, enfants: 0, avecClasse: 0 };
    
    const rootComptes = comptes.filter((c) => !c.parent);
    const comptesAvecClasse = comptes.filter(
      (c) => c.classe && c.classe.trim() !== ""
    );

    return {
      total: comptes.length,
      racines: rootComptes.length,
      enfants: comptes.filter((c) => c.parent !== null).length,
      avecClasse: comptesAvecClasse.length,
    };
  }, [comptes, canReadPCG]);

  const availableParents = useMemo(() => {
    return canReadPCG ? pcgService.getAvailableParents(selectedCompte?.numeroCompte) : [];
  }, [pcgService, selectedCompte, canReadPCG]);

  const allAvailableParents = useMemo(() => {
    return canReadPCG ? pcgService.getAvailableParents() : [];
  }, [pcgService, canReadPCG]);

  return (
    <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
              <BookOpen className="w-8 h-8 mr-3" />
              Plan Comptable Général
            </h1>
            <div className="text-blue-600/70 dark:text-blue-400/70 mt-2">
              Gérez la structure comptable de votre organisation
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
        <PermissionGuard permission="READ_PCG">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                    Total
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.total}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                  <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                    Comptes racines
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.racines}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                  <Star className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                    Sous-comptes
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.enfants}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                  <Calculator className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-4 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600/70 dark:text-green-400/70 text-sm">
                    Avec classe
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.avecClasse}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                  <Hash className="w-5 h-5 text-green-700 dark:text-green-300" />
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
            <PermissionGuard permission="READ_PCG">
              <button
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  viewMode === ViewMode.LIST
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200/50 dark:hover:bg-blue-800/30"
                }`}
              >
                <List className="w-4 h-4" />
                <span>Liste</span>
              </button>

              <button
                onClick={() => setViewMode(ViewMode.TREE)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  viewMode === ViewMode.TREE
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200/50 dark:hover:bg-blue-800/30"
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
              permission="CREATE_PCG"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <span>Nouveau compte</span>
            </PermissionButton>

            <PermissionButton
              onClick={handleRefresh}
              disabled={isLoading}
              permission="READ_PCG"
              className="flex items-center gap-2 px-4 py-2 bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200/30 dark:border-blue-700/30 rounded-xl hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors disabled:opacity-50"
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
      <PermissionGuard permission="READ_PCG" fallback={
        <div className="text-center py-12 text-blue-600/70 dark:text-blue-400/70">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir le plan comptable</p>
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
                <ListPcg
                  data={comptes}
                  loading={isLoading}
                  onEdit={(compte) => {
                    setSelectedCompte(compte);
                    setShowEditModal(true);
                  }}
                  onDelete={(compte) => {
                    setComptesToDelete([compte]);
                    setShowDeleteModal(true);
                  }}
                  onRefresh={handleRefresh}
                  onAddCompte={() => setShowAddModal(true)}
                  onImport={() => {
                    toast("Fonctionnalité d'import en cours de développement");
                  }}
                  onSelectionChange={setSelectedComptes}
                  onBulkDelete={(comptes) => {
                    setComptesToDelete(comptes);
                    setShowDeleteModal(true);
                  }}
                  canCreate={canCreatePCG}
                  canUpdate={canUpdatePCG}
                  canDelete={canDeletePCG}
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
                <TreePcg
                  comptes={comptes}
                  onEdit={(compte) => {
                    setSelectedCompte(compte);
                    setShowEditModal(true);
                  }}
                  onDelete={(compte) => {
                    setComptesToDelete([compte]);
                    setShowDeleteModal(true);
                  }}
                  onAddChild={handleAddChildCompte}
                  canCreate={canCreatePCG}
                  canUpdate={canUpdatePCG}
                  canDelete={canDeletePCG}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PermissionGuard>

      {/* Modals avec permissions */}
      <PermissionGuard permission="CREATE_PCG">
        <AddPcg
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setParentForNewCompte(null);
          }}
          onAdd={handleAddCompte}
          parentCompte={parentForNewCompte || undefined}
          availableParents={allAvailableParents}
        />
      </PermissionGuard>

      <PermissionGuard permission="UPDATE_PCG">
        <UpdatePcg
          compte={selectedCompte}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompte(null);
          }}
          onUpdate={handleUpdateCompte}
          availableParents={availableParents}
        />
      </PermissionGuard>

      <PermissionGuard permission="DELETE_PCG">
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (comptesToDelete.length === 1) {
              handleDeleteCompte(comptesToDelete[0]);
            } else {
              handleBulkDelete(comptesToDelete);
            }
          }}
          title="Confirmer la suppression"
          message={
            comptesToDelete.length === 1
              ? `Êtes-vous sûr de vouloir supprimer le compte "${comptesToDelete[0]?.libelle}" ? Cette action est irréversible.`
              : `Êtes-vous sûr de vouloir supprimer ${comptesToDelete.length} comptes ? Cette action est irréversible.`
          }
          confirmText="Supprimer"
          type="delete"
        />
      </PermissionGuard>
    </div>
  );
}