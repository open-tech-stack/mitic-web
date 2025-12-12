"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, BarChart2, DollarSign, Users, List, CheckCircle, XCircle, Info, Clock, RefreshCw } from "lucide-react";
import AbonnementList from "@/components/dashboard/abonnements/AbonnementList";
import AbonnementForm from "@/components/dashboard/abonnements/AbonnementForm";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";
import { AbonnementService } from "@/services/abonnements/abonnement.service";
import { ClientService } from "@/services/clients/client.service";
import { PeageService } from "@/services/peage/peage.service";
import { Client } from "@/types/client.types";
import { Abonnement } from "@/types/abonnement.types";
import { Peage } from "@/types/peage.types";
import { AbonnementTarif } from "@/types/period-tarif.types";
import { AbonnementTarifService } from "@/services/period-tarif/period-tarif.service";

export default function AbonnementPage() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [peages, setPeages] = useState<Peage[]>([]);
  const [tarifsAbonnement, setTarifsAbonnement] = useState<AbonnementTarif[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions abonnement
  const canReadAbonnement = hasPermission('READ_ABONNEMENT') || hasPermission('CRUD_ABONNEMENT');
  const canCreateAbonnement = hasPermission('CREATE_ABONNEMENT') || hasPermission('CRUD_ABONNEMENT');
  const canUpdateAbonnement = hasPermission('UPDATE_ABONNEMENT') || hasPermission('CRUD_ABONNEMENT');
  const canDeleteAbonnement = hasPermission('DELETE_ABONNEMENT') || hasPermission('CRUD_ABONNEMENT');

  const abonnementService = AbonnementService.getInstance();
  const clientService = ClientService.getInstance();
  const peageService = PeageService.getInstance();
  const tarifAbonnementService = AbonnementTarifService.getInstance();

  useEffect(() => {
    if (canReadAbonnement) {
      // S'abonner aux mises à jour des services
      const unsubscribeAbonnement = abonnementService.subscribe((state) => {
        setAbonnements(state.abonnements);
        setLoading(state.loading);
        setError(state.error);
      });

      // Charger les données initiales
      loadInitialData();

      return () => unsubscribeAbonnement();
    }
  }, [canReadAbonnement]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadAbonnements(),
        loadClients(),
        loadPeages(),
        loadTarifsAbonnement()
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const loadAbonnements = async () => {
    if (!canReadAbonnement) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les abonnements");
      return;
    }

    try {
      await abonnementService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement des abonnements:", error);
    }
  };

  const loadClients = async () => {
    try {
      const clientsData = await clientService.loadAll();
      setClients(clientsData);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    }
  };

  const loadPeages = async () => {
    try {
      const peagesData = await peageService.loadAllPeages(); // ← Correction ici
      setPeages(peagesData);
    } catch (error) {
      console.error("Erreur lors du chargement des péages:", error);
    }
  };

  const loadTarifsAbonnement = async () => {
    try {
      const tarifsData = await tarifAbonnementService.loadAll();
      setTarifsAbonnement(tarifsData);
    } catch (error) {
      console.error("Erreur lors du chargement des tarifs d'abonnement:", error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await loadInitialData();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeAbonnements = abonnements.filter(a => a.actif);
  const inactiveAbonnements = abonnements.filter(a => !a.actif);
  const totalAmount = abonnements.reduce((sum, a) => sum + (a.montant || 0), 0);

  const stats = {
    total: abonnements.length,
    active: activeAbonnements.length,
    inactive: inactiveAbonnements.length,
    totalAmount: totalAmount,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreateAbonnement) {
      alert("Vous n'avez pas la permission de créer un abonnement");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditRequested = (abonnement: Abonnement) => {
    if (!canUpdateAbonnement) {
      alert("Vous n'avez pas la permission de modifier un abonnement");
      return;
    }
    setSelectedAbonnement(abonnement);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedAbonnement(null);
    abonnementService.clearError();
  };

  const handleSuccess = () => {
    handleCancel();
  };

  const handleCreate = async (abonnementData: any) => {
    if (!canCreateAbonnement) {
      alert("Vous n'avez pas la permission de créer un abonnement");
      return;
    }

    try {
      await abonnementService.create(abonnementData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdate = async (abonnementData: Abonnement) => {
    if (!canUpdateAbonnement) {
      alert("Vous n'avez pas la permission de modifier un abonnement");
      return;
    }

    try {
      await abonnementService.update(abonnementData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteAbonnement) {
      alert("Vous n'avez pas la permission de supprimer un abonnement");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?")) {
      try {
        await abonnementService.delete(id);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  // Si l'utilisateur n'a aucune permission abonnement
  if (!hasAnyPermission(['READ_ABONNEMENT', 'CREATE_ABONNEMENT', 'UPDATE_ABONNEMENT', 'DELETE_ABONNEMENT', 'CRUD_ABONNEMENT'])) {
    return (
      <div className="min-h-screen bg-purple-50/30 dark:bg-purple-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-purple-600/70 dark:text-purple-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  if (loading && abonnements.length === 0 && canReadAbonnement) {
    return (
      <div className="min-h-screen bg-purple-50/30 dark:bg-purple-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-900 dark:text-purple-100">Chargement des abonnements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="abonnement-management-pro min-h-screen bg-purple-50/30 dark:bg-purple-950/10 p-6">
      {/* Header avec titre et boutons */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100 flex items-center">
              <Calendar className="w-8 h-8 mr-3" />
              Gestion des Abonnements
            </h1>
            <p className="text-purple-600/70 dark:text-purple-400/70 mt-2">
              Gérez les abonnements des clients avec leurs péages et tarifs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Actualiser */}
            <PermissionGuard permission="READ_ABONNEMENT">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Actualiser la liste"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </PermissionGuard>

            {/* Bouton Nouvel Abonnement */}
            {!showAddForm && !showEditForm && (
              <PermissionButton
                onClick={handleAdd}
                permission="CREATE_ABONNEMENT"
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nouvel Abonnement
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
      <PermissionGuard permission="READ_ABONNEMENT">
        <div className="stats-section grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl p-6 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600/70 dark:text-purple-400/70 text-sm">Total Abonnements</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-200/30 dark:bg-purple-700/30">
                <BarChart2 className="w-6 h-6 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm">Abonnements Actifs</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <CheckCircle className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl p-6 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600/70 dark:text-orange-400/70 text-sm">Abonnements Inactifs</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.inactive}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-200/30 dark:bg-orange-700/30">
                <XCircle className="w-6 h-6 text-orange-700 dark:text-orange-300" />
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
                <DollarSign className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Section de la liste des abonnements - seulement si on peut lire */}
      <PermissionGuard permission="READ_ABONNEMENT" fallback={
        <div className="text-center py-12 text-purple-600/70 dark:text-purple-400/70">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des abonnements</p>
        </div>
      }>
        {!showAddForm && !showEditForm && (
          <div className="abonnement-list-section">
            <div className="section-header flex items-center gap-3 mb-6">
              <List className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                Liste des Abonnements
              </h2>
            </div>

            <AbonnementList
              abonnements={abonnements}
              onEditRequested={handleEditRequested}
              onDelete={handleDelete}
              onRefresh={handleRefresh}
              canUpdate={canUpdateAbonnement}
              canDelete={canDeleteAbonnement}
            />
          </div>
        )}
      </PermissionGuard>

      {/* Modal d'ajout avec permission */}
      <PermissionGuard permission="CREATE_ABONNEMENT">
        <AnimatePresence>
          {showAddForm && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-purple-200/30 dark:border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvel Abonnement
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AbonnementForm
                    mode="add"
                    initialData={{
                      abonneId: 0,
                      peage: 0,
                      tarifId: 0,
                      dateDebut: new Date().toISOString().split('T')[0],
                      abonneImmatriculation: ""
                    }}
                    onSubmit={handleCreate}
                    onCancel={handleCancel}
                    clients={clients}
                    peages={peages}
                    tarifsAbonnement={tarifsAbonnement}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      {/* Modal de modification avec permission */}
      <PermissionGuard permission="UPDATE_ABONNEMENT">
        <AnimatePresence>
          {showEditForm && selectedAbonnement && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-purple-200/30 dark:border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Modifier l'Abonnement
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <AbonnementForm
                    mode="edit"
                    initialData={selectedAbonnement}
                    onSubmit={handleUpdate}
                    onCancel={handleCancel}
                    clients={clients}
                    peages={peages}
                    tarifsAbonnement={tarifsAbonnement}
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