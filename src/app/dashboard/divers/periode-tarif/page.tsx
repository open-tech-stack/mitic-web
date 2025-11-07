"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, BarChart2, Tag, TrendingUp, List, XCircle, DollarSign, Car, Truck, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";
import { AbonnementTarifService } from "@/services/period-tarif/period-tarif.service";
import { AbonnementTarif, CreationInfo, AbonnementTarifValidator } from "@/types/period-tarif.types";
import AbonnementTarifList from "@/components/dashboard/divers/period-tarif/AbonnementTarifList";
import AbonnementTarifForm from "@/components/dashboard/divers/period-tarif/AbonnementTarifForm";

export default function AbonnementTarifPage() {
  const [tarifs, setTarifs] = useState<AbonnementTarif[]>([]);
  const [creationInfo, setCreationInfo] = useState<CreationInfo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTarif, setSelectedTarif] = useState<AbonnementTarif | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions
  const canReadTarif = hasPermission('READ_ABONNEMENT_TARIF') || hasPermission('CRUD_ABONNEMENT_TARIF');
  const canCreateTarif = hasPermission('CREATE_ABONNEMENT_TARIF') || hasPermission('CRUD_ABONNEMENT_TARIF');
  const canUpdateTarif = hasPermission('UPDATE_ABONNEMENT_TARIF') || hasPermission('CRUD_ABONNEMENT_TARIF');
  const canDeleteTarif = hasPermission('DELETE_ABONNEMENT_TARIF') || hasPermission('CRUD_ABONNEMENT_TARIF');

  const tarifService = AbonnementTarifService.getInstance();

  useEffect(() => {
    if (canReadTarif) {
      // S'abonner aux mises à jour du service
      const unsubscribeTarif = tarifService.subscribe((state) => {
        setTarifs(state.tarifs);
        setCreationInfo(state.creationInfo);
        setLoading(state.loading);
        setError(state.error);
      });

      // Charger les données initiales
      loadCreationInfo();
      loadTarifs();

      return () => unsubscribeTarif();
    }
  }, [canReadTarif]);

  const loadTarifs = async () => {
    if (!canReadTarif) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les tarifs d'abonnement");
      return;
    }

    try {
      await tarifService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs d'abonnement:", error);
      setError("Erreur lors du chargement des tarifs");
    }
  };

  const loadCreationInfo = async () => {
    try {
      await tarifService.loadCreationInfo();
    } catch (error) {
      console.error("Erreur lors du chargement des informations de création:", error);
    }
  };

  // NOUVELLE FONCTION : Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTarifs();
      await loadCreationInfo(); // Recharger aussi les infos de création au cas où
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const poidsLourdsCount = tarifs.filter(t =>
    AbonnementTarifValidator.isPoidsLourd(t.libelle)
  ).length;

  const totalAmount = tarifs.reduce((sum, t) => sum + t.montant, 0);
  const averageAmount = tarifs.length > 0 ? totalAmount / tarifs.length : 0;

  const stats = {
    total: tarifs.length,
    poidsLourds: poidsLourdsCount,
    totalAmount: totalAmount,
    averageAmount: averageAmount,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreateTarif) {
      alert("Vous n'avez pas la permission de créer un tarif d'abonnement");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditRequested = (tarif: AbonnementTarif) => {
    if (!canUpdateTarif) {
      alert("Vous n'avez pas la permission de modifier un tarif d'abonnement");
      return;
    }
    setSelectedTarif(tarif);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedTarif(null);
    tarifService.clearError();
  };

  const handleSuccess = () => {
    handleCancel();
    // Recharger les données après succès
    handleRefresh();
  };

  const handleCreate = async (tarifData: any) => {
    if (!canCreateTarif) {
      alert("Vous n'avez pas la permission de créer un tarif d'abonnement");
      return;
    }

    try {
      await tarifService.create(tarifData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdate = async (tarifData: any) => {
    if (!canUpdateTarif) {
      alert("Vous n'avez pas la permission de modifier un tarif d'abonnement");
      return;
    }

    try {
      if (selectedTarif) {
        await tarifService.update({
          ...tarifData,
          id: selectedTarif.id
        });
        handleSuccess(); // Cette fonction appelle maintenant handleRefresh
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteTarif) {
      alert("Vous n'avez pas la permission de supprimer un tarif d'abonnement");
      return;
    }

    try {
      await tarifService.delete(id);
      // Recharger les données après suppression
      handleRefresh();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Si l'utilisateur n'a aucune permission
  if (!hasAnyPermission(['READ_ABONNEMENT_TARIF', 'CREATE_ABONNEMENT_TARIF', 'UPDATE_ABONNEMENT_TARIF', 'DELETE_ABONNEMENT_TARIF', 'CRUD_ABONNEMENT_TARIF'])) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-blue-600/70 dark:text-blue-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  if (loading && tarifs.length === 0 && canReadTarif) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-900 dark:text-blue-100">Chargement des tarifs d'abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="abonnement-tarif-management-pro min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
              <DollarSign className="w-8 h-8 mr-3" />
              Gestion des Tarifs d'Abonnement
            </h1>
            <p className="text-blue-600/70 dark:text-blue-400/70 mt-2">
              Configurez les tarifs d'abonnement par type de véhicule et périodicité.
            </p>
          </div>

          <div className="flex gap-3">
            {/* Bouton d'actualisation */}
            {!showAddForm && !showEditForm && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-3 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            )}

            {/* Bouton d'ajout */}
            {!showAddForm && !showEditForm && (
              <PermissionButton
                onClick={handleAdd}
                permission="CREATE_ABONNEMENT_TARIF"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nouveau Tarif
              </PermissionButton>
            )}
          </div>
        </div>
      </div>

      {/* Affichage des erreurs globales */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Section des statistiques */}
      <PermissionGuard permission="READ_ABONNEMENT_TARIF">
        <div className="stats-section grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">Total Tarifs</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <BarChart2 className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">Poids Lourds</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.poidsLourds}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <Truck className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">Montant Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalAmount.toLocaleString('fr-FR')} F
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">Moyenne</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.averageAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <Tag className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Section de la liste des tarifs */}
      <PermissionGuard permission="READ_ABONNEMENT_TARIF" fallback={
        <div className="text-center py-12 text-blue-600/70 dark:text-blue-400/70">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des tarifs d'abonnement</p>
        </div>
      }>
        {!showAddForm && !showEditForm && (
          <div className="tarif-list-section">
            <div className="section-header flex items-center gap-3 mb-6">
              <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Liste des Tarifs d'Abonnement
              </h2>
            </div>

            <AbonnementTarifList
              tarifs={tarifs}
              onEditRequested={handleEditRequested}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
              canUpdate={canUpdateTarif}
              canDelete={canDeleteTarif}
              loading={refreshing}
            />
          </div>
        )}
      </PermissionGuard>

      {/* Modal d'ajout */}
      <PermissionGuard permission="CREATE_ABONNEMENT_TARIF">
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
                <div className="modal-header p-6 border-b border-blue-200/30 dark:border-blue-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouveau Tarif
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <span className="w-5 h-5 text-blue-600 dark:text-blue-400">×</span>
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AbonnementTarifForm
                    mode="add"
                    initialData={{ type: '', nombre_essieux: undefined, periodicite: '', montant: 0 }}
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                    creationInfo={creationInfo}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de modification */}
      <PermissionGuard permission="UPDATE_ABONNEMENT_TARIF">
        <AnimatePresence>
          {showEditForm && selectedTarif && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-blue-200/30 dark:border-blue-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
                      <span className="w-5 h-5 mr-2">✏️</span>
                      Modifier le Tarif
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <span className="w-5 h-5 text-blue-600 dark:text-blue-400">×</span>
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AbonnementTarifForm
                    mode="edit"
                    initialData={selectedTarif}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                    creationInfo={creationInfo}
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