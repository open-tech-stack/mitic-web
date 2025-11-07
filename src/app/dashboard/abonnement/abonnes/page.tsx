"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, BarChart2, Phone, Car, List, CheckCircle, XCircle, Info, Eye, RefreshCw, User, IdCard } from "lucide-react";
import AbonneList from "@/components/dashboard/abonnes/AbonneList";
import AbonneForm from "@/components/dashboard/abonnes/AbonneForm";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";
import { AbonneService } from "@/services/abonnes/abonne.service";
import { Abonne } from "@/types/abonne.types";

export default function AbonnePage() {
  const [abonnes, setAbonnes] = useState<Abonne[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAbonne, setSelectedAbonne] = useState<Abonne | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions abonné
  const canReadAbonne = hasPermission('READ_ABONNE') || hasPermission('CRUD_ABONNE');
  const canCreateAbonne = hasPermission('CREATE_ABONNE') || hasPermission('CRUD_ABONNE');
  const canUpdateAbonne = hasPermission('UPDATE_ABONNE') || hasPermission('CRUD_ABONNE');
  const canDeleteAbonne = hasPermission('DELETE_ABONNE') || hasPermission('CRUD_ABONNE');

  const abonneService = AbonneService.getInstance();

  useEffect(() => {
    if (canReadAbonne) {
      // S'abonner aux mises à jour du service abonné
      const unsubscribeAbonne = abonneService.subscribe((state) => {
        setAbonnes(state.abonnes);
        setLoading(state.loading);
        setError(state.error);
      });

      // Charger les données initiales abonné
      loadAbonnes();

      return () => unsubscribeAbonne();
    }
  }, [canReadAbonne]);

  const loadAbonnes = async () => {
    if (!canReadAbonne) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les abonnés");
      return;
    }

    try {
      await abonneService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement des abonnés:", error);
    }
  };

  const handleRefresh = async () => {
    await loadAbonnes();
  };

  const stats = {
    total: abonnes.length,
    withValidCnib: abonnes.filter(a => a.cnib && a.cnib.startsWith('B')).length,
    withImmatriculation: abonnes.filter(a => a.immatriculation && a.immatriculation.trim() !== '').length,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreateAbonne) {
      alert("Vous n'avez pas la permission de créer un abonné");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditRequested = (abonne: Abonne) => {
    if (!canUpdateAbonne) {
      alert("Vous n'avez pas la permission de modifier un abonné");
      return;
    }
    setSelectedAbonne(abonne);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedAbonne(null);
    abonneService.clearError();
  };

  const handleSuccess = () => {
    handleCancel();
  };

  const handleCreate = async (abonneData: any) => {
    if (!canCreateAbonne) {
      alert("Vous n'avez pas la permission de créer un abonné");
      return;
    }

    try {
      await abonneService.create(abonneData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdate = async (abonneData: Abonne) => {
    if (!canUpdateAbonne) {
      alert("Vous n'avez pas la permission de modifier un abonné");
      return;
    }

    try {
      await abonneService.update(abonneData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteAbonne) {
      alert("Vous n'avez pas la permission de supprimer un abonné");
      return;
    }

    try {
      await abonneService.delete(id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Si l'utilisateur n'a aucune permission abonné
  if (!hasAnyPermission(['READ_ABONNE', 'CREATE_ABONNE', 'UPDATE_ABONNE', 'DELETE_ABONNE', 'CRUD_ABONNE'])) {
    return (
      <div className="min-h-screen bg-green-50/30 dark:bg-green-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-green-600/70 dark:text-green-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  if (loading && abonnes.length === 0 && canReadAbonne) {
    return (
      <div className="min-h-screen bg-green-50/30 dark:bg-green-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-900 dark:text-green-100">Chargement des abonnés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="abonne-management-pro min-h-screen bg-green-50/30 dark:bg-green-950/10 p-6">
      {/* Header avec titre et boutons */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-900 dark:text-green-100 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Gestion des Abonnés
            </h1>
            <p className="text-green-600/70 dark:text-green-400/70 mt-2">
              Gérez les abonnés du système avec leurs informations personnelles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Actualiser */}
            <PermissionGuard permission="READ_ABONNE">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                title="Actualiser la liste"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
            </PermissionGuard>

            {/* Bouton Nouvel Abonné */}
            {!showAddForm && !showEditForm && (
              <PermissionButton
                onClick={handleAdd}
                permission="CREATE_ABONNE"
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nouvel Abonné
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

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_ABONNE">
        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm">Total Abonnés</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <BarChart2 className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm">CNIB Valides</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.withValidCnib}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <IdCard className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm">Avec Immatriculation</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.withImmatriculation}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <Car className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Section de la liste des abonnés - seulement si on peut lire */}
      <PermissionGuard permission="READ_ABONNE" fallback={
        <div className="text-center py-12 text-green-600/70 dark:text-green-400/70">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des abonnés</p>
        </div>
      }>
        {!showAddForm && !showEditForm && (
          <div className="abonne-list-section">
            <div className="section-header flex items-center gap-3 mb-6">
              <List className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
                Liste des Abonnés
              </h2>
            </div>

            <AbonneList
              abonnes={abonnes}
              onEditRequested={handleEditRequested}
              onDelete={handleDelete}
              canUpdate={canUpdateAbonne}
              canDelete={canDeleteAbonne}
            />
          </div>
        )}
      </PermissionGuard>

      {/* Modal d'ajout avec permission */}
      <PermissionGuard permission="CREATE_ABONNE">
        <AnimatePresence>
          {showAddForm && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-green-200/30 dark:border-green-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-green-900 dark:text-green-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvel Abonné
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AbonneForm
                    mode="add"
                    initialData={{
                      nom: '',
                      prenom: '',
                      cnib: 'B',
                      nbreTel: '+226',
                      immatriculation: ''
                    }}
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de modification avec permission */}
      <PermissionGuard permission="UPDATE_ABONNE">
        <AnimatePresence>
          {showEditForm && selectedAbonne && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-green-200/30 dark:border-green-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-green-900 dark:text-green-100 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Modifier l'Abonné
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AbonneForm
                    mode="edit"
                    initialData={selectedAbonne}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
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