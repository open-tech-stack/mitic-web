// @/app/dashboard/gestion-trajets/categories/type-montant/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  BarChart2,
  Tag,
  List,
  RefreshCw,
} from "lucide-react";
import AmountTypeForm from "@/components/dashboard/gestion-trajets/categories/typeMontant/TypeMontantForm";
import AmountTypeList from "@/components/dashboard/gestion-trajets/categories/typeMontant/TypeMontantList";
import { TypeMontant } from "@/types/typeMontant.types";
import toast from "react-hot-toast";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function AmountTypePage() {
  const [amountTypes, setAmountTypes] = useState<TypeMontant[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAmountType, setSelectedAmountType] =
  useState<TypeMontant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  


  
  const typeMontantService = ServiceFactory.createTypeMontantService();
  
  const { hasPermission, hasAnyPermission } = useAuth();
  
  // Vérifications des permissions types de montant
  const canReadTypeMontant = hasPermission('READ_TYPE_MONTANT') || hasPermission('CRUD_TYPE_MONTANT');
  const canCreateTypeMontant = hasPermission('CREATE_TYPE_MONTANT') || hasPermission('CRUD_TYPE_MONTANT');
  const canUpdateTypeMontant = hasPermission('UPDATE_TYPE_MONTANT') || hasPermission('CRUD_TYPE_MONTANT');
  const canDeleteTypeMontant = hasPermission('DELETE_TYPE_MONTANT') || hasPermission('CRUD_TYPE_MONTANT');

  useEffect(() => {
    if (!canReadTypeMontant) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les types de montant");
      setLoading(false);
      return;
    }

    const unsubscribe = typeMontantService.subscribe((state) => {
      setAmountTypes(state.types);
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
  }, [canReadTypeMontant]);

  const loadTypes = async () => {
    if (!canReadTypeMontant) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les types de montant");
      return;
    }

    try {
      setRefreshing(true);
      await typeMontantService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des types de montant");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadTypes();
    toast.success("Liste des types de montant actualisée avec succès");
  };

  // Si l'utilisateur n'a aucune permission type de montant
  if (!hasAnyPermission(['READ_TYPE_MONTANT', 'CREATE_TYPE_MONTANT', 'UPDATE_TYPE_MONTANT', 'DELETE_TYPE_MONTANT', 'CRUD_TYPE_MONTANT'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  const activeCount = amountTypes.filter((at) => !at.isDelete).length;
  const stats = {
    total: amountTypes.length,
    active: activeCount,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreateTypeMontant) {
      alert("Vous n'avez pas la permission de créer un type de montant");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditRequested = (amountType: TypeMontant) => {
    if (!canUpdateTypeMontant) {
      alert("Vous n'avez pas la permission de modifier un type de montant");
      return;
    }
    setSelectedAmountType(amountType);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedAmountType(null);
  };

  const handleSuccess = () => {
    handleCancel();
  };

  const handleCreate = async (amountTypeData: Omit<TypeMontant, "id">) => {
    if (!canCreateTypeMontant) {
      alert("Vous n'avez pas la permission de créer un type de montant");
      return;
    }

    try {
      await typeMontantService.create(amountTypeData);
      toast.success("Type de montant créé avec succès");
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création du type de montant");
    }
  };

  const handleUpdate = async (amountTypeData: TypeMontant) => {
    if (!canUpdateTypeMontant) {
      alert("Vous n'avez pas la permission de modifier un type de montant");
      return;
    }

    try {
      await typeMontantService.update(amountTypeData);
      toast.success("Type de montant modifié avec succès");
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la modification du type de montant");
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteTypeMontant) {
      alert("Vous n'avez pas la permission de supprimer un type de montant");
      return;
    }

    if (confirm("Voulez-vous vraiment supprimer ce type de montant ?")) {
      try {
        await typeMontantService.delete(id);
        toast.success("Type de montant supprimé avec succès");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression du type de montant");
      }
    }
  };

  const handleRestore = async (id: number) => {
    if (!canUpdateTypeMontant) {
      alert("Vous n'avez pas la permission de restaurer un type de montant");
      return;
    }

    try {
      await typeMontantService.restore(id);
      toast.success("Type de montant restauré avec succès");
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      toast.error("Erreur lors de la restauration du type de montant");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-900 dark:text-amber-100">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="amount-type-management-pro min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <DollarSign className="w-8 h-8 mr-3" />
              Gestion des Types de Montant
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les types de montant disponibles dans le système
            </p>
          </div>

          {!showAddForm && !showEditForm && (
            <PermissionButton
              onClick={handleAdd}
              permission="CREATE_TYPE_MONTANT"
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Ajouter un type
            </PermissionButton>
          )}
        </div>
      </div>

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_TYPE_MONTANT">
        <div className="stats-section grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-8">
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
        </div>
      </PermissionGuard>

      {/* Section de la liste des types de montant */}
      {!showAddForm && !showEditForm && (
        <div className="amount-type-list-section">
          <div className="section-header flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                Liste des Types de Montant
              </h2>
            </div>
            <PermissionButton
              onClick={handleRefresh}
              permission="READ_TYPE_MONTANT"
              disabled={refreshing}
              className="btn-refresh flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Actualiser
            </PermissionButton>
          </div>

          <AmountTypeList
            amountTypes={amountTypes}
            onEditRequested={handleEditRequested}
            onDelete={handleDelete}
            onRestore={handleRestore}
            canUpdate={canUpdateTypeMontant}
            canDelete={canDeleteTypeMontant}
          />
        </div>
      )}

      {/* Modal d'ajout */}
      <PermissionGuard permission="CREATE_TYPE_MONTANT">
        <AnimatePresence>
          {showAddForm && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouveau Type de Montant
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <span className="w-5 h-5 text-amber-600 dark:text-amber-400">
                        ×
                      </span>
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AmountTypeForm
                    mode="add"
                    initialData={{ libelle: "", isDelete: false }}
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                    existingLibelles={amountTypes
                      .filter((at) => !at.isDelete)
                      .map((at) => at.libelle.toLowerCase())}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de modification */}
      <PermissionGuard permission="UPDATE_TYPE_MONTANT">
        <AnimatePresence>
          {showEditForm && selectedAmountType && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                      <span className="w-5 h-5 mr-2">✏️</span>
                      Modifier le Type de Montant
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <span className="w-5 h-5 text-amber-600 dark:text-amber-400">
                        ×
                      </span>
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AmountTypeForm
                    mode="edit"
                    initialData={selectedAmountType}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                    existingLibelles={amountTypes
                      .filter(
                        (at) => at.id !== selectedAmountType.id && !at.isDelete
                      )
                      .map((at) => at.libelle.toLowerCase())}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>
    </div>
  );
}