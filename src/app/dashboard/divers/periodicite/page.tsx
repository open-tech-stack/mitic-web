// @/app/dashboard/divers/periodicite/page.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, BarChart2, Tag, TrendingUp, List, CheckCircle, XCircle, Info } from "lucide-react";
import PeriodicityList from "@/components/dashboard/divers/periodicite/PeriodicityList";
import PeriodicityForm from "@/components/dashboard/divers/periodicite/PeriodicityForm";
import { PeriodiciteService } from "@/services/periodicity/periodicity.service";
import { Periodicite } from "@/types/periodicity.types";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function PeriodicityPage() {
  const [periodicites, setPeriodicites] = useState<Periodicite[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<Periodicite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions périodicité
  const canReadPeriodicity = hasPermission('READ_PERIODICITE') || hasPermission('CRUD_PERIODICITE');
  const canCreatePeriodicity = hasPermission('CREATE_PERIODICITE') || hasPermission('CRUD_PERIODICITE');
  const canUpdatePeriodicity = hasPermission('UPDATE_PERIODICITE') || hasPermission('CRUD_PERIODICITE');
  const canDeletePeriodicity = hasPermission('DELETE_PERIODICITE') || hasPermission('CRUD_PERIODICITE');

  const periodiciteService = PeriodiciteService.getInstance();

  useEffect(() => {
    if (canReadPeriodicity) {
      // S'abonner aux mises à jour du service
      const unsubscribe = periodiciteService.subscribe((state) => {
        setPeriodicites(state.periodicites);
        setLoading(state.loading);
        setError(state.error);
      });

      // Charger les données initiales
      loadPeriodicites();

      return () => unsubscribe();
    }
  }, [canReadPeriodicity]);

  const loadPeriodicites = async () => {
    if (!canReadPeriodicity) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les périodicités");
      return;
    }

    try {
      await periodiciteService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement des périodicités:", error);
    }
  };

  const activeCount = periodicites.filter(p => p.actif).length;
  const stats = {
    total: periodicites.length,
    active: activeCount,
    coverage: periodicites.length > 0 ? Math.round((activeCount / periodicites.length) * 100) : 0,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreatePeriodicity) {
      alert("Vous n'avez pas la permission de créer une périodicité");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditRequested = (periodicity: Periodicite) => {
    if (!canUpdatePeriodicity) {
      alert("Vous n'avez pas la permission de modifier une périodicité");
      return;
    }
    setSelectedPeriodicity(periodicity);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedPeriodicity(null);
    periodiciteService.clearError();
  };

  const handleSuccess = () => {
    handleCancel();
  };

  const handleCreate = async (periodicityData: Omit<Periodicite, 'id'>) => {
    if (!canCreatePeriodicity) {
      alert("Vous n'avez pas la permission de créer une périodicité");
      return;
    }

    try {
      await periodiciteService.create(periodicityData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdate = async (periodicityData: Periodicite) => {
    if (!canUpdatePeriodicity) {
      alert("Vous n'avez pas la permission de modifier une périodicité");
      return;
    }

    try {
      await periodiciteService.update(periodicityData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDeletePeriodicity) {
      alert("Vous n'avez pas la permission de supprimer une périodicité");
      return;
    }

    try {
      await periodiciteService.delete(id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Si l'utilisateur n'a aucune permission périodicité
  if (!hasAnyPermission(['READ_PERIODICITE', 'CREATE_PERIODICITE', 'UPDATE_PERIODICITE', 'DELETE_PERIODICITE', 'CRUD_PERIODICITE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  if (loading && periodicites.length === 0 && canReadPeriodicity) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-900 dark:text-amber-100">Chargement des périodicités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="periodicity-management-pro min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Calendar className="w-8 h-8 mr-3" />
              Gestion des Périodicités
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les périodicités disponibles dans le système. Une seule période peut être active à la fois.
            </p>
          </div>
          
          {!showAddForm && !showEditForm && (
            <PermissionButton
              onClick={handleAdd}
              permission="CREATE_PERIODICITE"
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Ajouter une périodicité
            </PermissionButton>
          )}
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

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_PERIODICITE">
        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Total Périodicités</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <BarChart2 className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Périodicités Actives</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.active}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <CheckCircle className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Taux d'Activation</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.coverage}%</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <TrendingUp className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Avertissement sur la règle métier */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            <strong>Règle métier :</strong> Une seule période peut être active à la fois. 
            L'activation d'une nouvelle période désactivera automatiquement les autres.
          </p>
        </div>
      </div>

      {/* Section de la liste des périodicités - seulement si on peut lire */}
      <PermissionGuard permission="READ_PERIODICITE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des périodicités</p>
        </div>
      }>
        {!showAddForm && !showEditForm && (
          <div className="periodicity-list-section">
            <div className="section-header flex items-center gap-3 mb-6">
              <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
                Liste des Périodicités
              </h2>
            </div>
            
            <PeriodicityList
              periodicities={periodicites}
              onEditRequested={handleEditRequested}
              onDelete={handleDelete}
              canUpdate={canUpdatePeriodicity}
              canDelete={canDeletePeriodicity}
            />
          </div>
        )}
      </PermissionGuard>

      {/* Modal d'ajout avec permission */}
      <PermissionGuard permission="CREATE_PERIODICITE">
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
                      Nouvelle Périodicité
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <span className="w-5 h-5 text-amber-600 dark:text-amber-400">×</span>
                    </button>
                  </div>
                </div>
                
                <div className="modal-content p-6">
                  <PeriodicityForm
                    mode="add"
                    initialData={{ libelle: '', actif: false }}
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                    hasActivePeriodicity={periodicites.some(p => p.actif)}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de modification avec permission */}
      <PermissionGuard permission="UPDATE_PERIODICITE">
        <AnimatePresence>
          {showEditForm && selectedPeriodicity && (
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
                      Modifier la Périodicité
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <span className="w-5 h-5 text-amber-600 dark:text-amber-400">×</span>
                    </button>
                  </div>
                </div>
                
                <div className="modal-content p-6">
                  <PeriodicityForm
                    mode="edit"
                    initialData={selectedPeriodicity}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                    hasActivePeriodicity={periodicites.some(p => p.actif && p.id !== selectedPeriodicity.id)}
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