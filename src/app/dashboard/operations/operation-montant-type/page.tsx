// @/app/dashboard/operations/operation-montant-type/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Plus,
  BarChart2,
  Tag,
  TrendingUp,
  List,
  Edit,
} from "lucide-react";
import {
  OperationMontantType,
  DeleteOperationMontantTypeRequest,
  UpdateOperationMontantTypeRequest,
} from "@/types/operationMontantType.types";
import OperationMontantTypeForm from "@/components/dashboard/operations/operation-montant-type/OperationMontantTypeForm";
import OperationMontantTypeList from "@/components/dashboard/operations/operation-montant-type/OperationMontantTypeList";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function OperationMontantTypePage() {
  const [associations, setAssociations] = useState<OperationMontantType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAssociation, setSelectedAssociation] =
    useState<OperationMontantType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const operationMontantTypeService = ServiceFactory.createOperationMontantTypeService();

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions associations
  const canReadOperationMontantType = hasPermission('READ_OPERATION_MONTANT_TYPE') || hasPermission('CRUD_OPERATION_MONTANT_TYPE');
  const canCreateOperationMontantType = hasPermission('CREATE_OPERATION_MONTANT_TYPE') || hasPermission('CRUD_OPERATION_MONTANT_TYPE');
  const canUpdateOperationMontantType = hasPermission('UPDATE_OPERATION_MONTANT_TYPE') || hasPermission('CRUD_OPERATION_MONTANT_TYPE');
  const canDeleteOperationMontantType = hasPermission('DELETE_OPERATION_MONTANT_TYPE') || hasPermission('CRUD_OPERATION_MONTANT_TYPE');

  useEffect(() => {
    if (!canReadOperationMontantType) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les associations");
      setLoading(false);
      return;
    }

    const unsubscribe = operationMontantTypeService.subscribe((state) => {
      setAssociations(state.associations);
      setLoading(state.loading);
      setError(state.error);
    });

    operationMontantTypeService.loadAll().catch(console.error);

    return () => unsubscribe();
  }, [canReadOperationMontantType]);

  // Si l'utilisateur n'a aucune permission association
  if (!hasAnyPermission(['READ_OPERATION_MONTANT_TYPE', 'CREATE_OPERATION_MONTANT_TYPE', 'UPDATE_OPERATION_MONTANT_TYPE', 'DELETE_OPERATION_MONTANT_TYPE', 'CRUD_OPERATION_MONTANT_TYPE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Link className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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
    total: associations.length,
    uniqueOperations: new Set(associations.map((a) => a.idTypeOperation)).size,
    uniqueMontants: new Set(associations.map((a) => a.idTypeMontant)).size,
  };

  const handleAdd = () => {
    if (!canCreateOperationMontantType) {
      alert("Vous n'avez pas la permission de créer une association");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
    setSelectedAssociation(null);
  };

  const handleEditRequested = (association: OperationMontantType) => {
    if (!canUpdateOperationMontantType) {
      alert("Vous n'avez pas la permission de modifier une association");
      return;
    }
    setSelectedAssociation(association);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedAssociation(null);
  };

  const handleSuccess = () => {
    handleCancel();
  };

  const handleCreate = async (
    associationData: Omit<OperationMontantType, "id">
  ) => {
    if (!canCreateOperationMontantType) {
      alert("Vous n'avez pas la permission de créer une association");
      return;
    }

    try {
      await operationMontantTypeService.create(associationData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdate = async (
    associationData: Omit<OperationMontantType, "id">
  ) => {
    if (!canUpdateOperationMontantType) {
      alert("Vous n'avez pas la permission de modifier une association");
      return;
    }

    try {
      if (selectedAssociation) {
        const updateRequest: UpdateOperationMontantTypeRequest = {
          currentIdTypeOperation: selectedAssociation.idTypeOperation,
          currentIdTypeMontant: selectedAssociation.idTypeMontant,
          newIdTypeOperation: associationData.idTypeOperation,
          newIdTypeMontant: associationData.idTypeMontant,
        };

        await operationMontantTypeService.update(updateRequest);
        handleSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const handleDelete = async (
    deleteRequest: DeleteOperationMontantTypeRequest
  ) => {
    if (!canDeleteOperationMontantType) {
      alert("Vous n'avez pas la permission de supprimer une association");
      return;
    }

    if (confirm("Voulez-vous vraiment supprimer cette association ?")) {
      try {
        await operationMontantTypeService.delete(deleteRequest);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
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
    <div className="operation-montant-type-management-pro min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Link className="w-8 h-8 mr-3" />
              Associations Type Opération - Type Montant
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les associations entre types d'opération et types de montant
            </p>
          </div>

          {!showAddForm && !showEditForm && (
            <PermissionButton
              onClick={handleAdd}
              permission="CREATE_OPERATION_MONTANT_TYPE"
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nouvelle association
            </PermissionButton>
          )}
        </div>
      </div>

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_OPERATION_MONTANT_TYPE">
        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Total Associations
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
                  Types d'Opération
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.uniqueOperations}
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
                  Types de Montant
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.uniqueMontants}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <TrendingUp className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {!showAddForm && !showEditForm && (
        <div className="operation-montant-type-list-section">
          <div className="section-header flex items-center gap-3 mb-6">
            <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Liste des Associations
            </h2>
          </div>

          <OperationMontantTypeList
            associations={associations}
            onEditRequested={handleEditRequested}
            onDelete={handleDelete}
            canUpdate={canUpdateOperationMontantType}
            canDelete={canDeleteOperationMontantType}
          />
        </div>
      )}

      {/* Modal d'ajout */}
      <PermissionGuard permission="CREATE_OPERATION_MONTANT_TYPE">
        <AnimatePresence>
          {showAddForm && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="modal-header p-6 border-b border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvelle Association
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                    >
                      <span className="w-5 h-5 text-amber-600 dark:text-amber-400">
                        ×
                      </span>
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <OperationMontantTypeForm
                    mode="add"
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                    existingAssociations={associations}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de modification */}
      <PermissionGuard permission="UPDATE_OPERATION_MONTANT_TYPE">
        <AnimatePresence>
          {showEditForm && selectedAssociation && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="modal-header p-6 border-b border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                      <Edit className="w-5 h-5 mr-2" />
                      Modifier l'Association
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                    >
                      <span className="w-5 h-5 text-amber-600 dark:text-amber-400">
                        ×
                      </span>
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <OperationMontantTypeForm
                    mode="edit"
                    initialData={selectedAssociation}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                    existingAssociations={associations.filter(
                      (a) => a.id !== selectedAssociation.id
                    )}
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