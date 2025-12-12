"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, BarChart2, Phone, List, CheckCircle, XCircle, Info, Eye, RefreshCw, User, IdCard, UserCheck } from "lucide-react";
import ClientList from "@/components/dashboard/clients/ClientList";
import ClientForm from "@/components/dashboard/clients/ClientForm";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";
import { ClientService } from "@/services/clients/client.service";
import { Client } from "@/types/client.types";

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions client
  const canReadClient = hasPermission('READ_CLIENT') || hasPermission('CRUD_CLIENT');
  const canCreateClient = hasPermission('CREATE_CLIENT') || hasPermission('CRUD_CLIENT');
  const canUpdateClient = hasPermission('UPDATE_CLIENT') || hasPermission('CRUD_CLIENT');
  const canDeleteClient = hasPermission('DELETE_CLIENT') || hasPermission('CRUD_CLIENT');

  const clientService = ClientService.getInstance();

  useEffect(() => {
    if (canReadClient) {
      // S'abonner aux mises à jour du service client
      const unsubscribeClient = clientService.subscribe((state) => {
        setClients(state.clients);
        setLoading(state.loading);
        setError(state.error);
      });

      // Charger les données initiales client
      loadClients();

      return () => unsubscribeClient();
    }
  }, [canReadClient]);

  const loadClients = async () => {
    if (!canReadClient) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les clients");
      return;
    }

    try {
      await clientService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    }
  };

  const handleRefresh = async () => {
    await loadClients();
  };

  const stats = {
    total: clients.length,
    abonnes: clients.filter(c => c.abonne).length,
    ordinaires: clients.filter(c => !c.abonne).length,
    avecCNIBValide: clients.filter(c => c.numeroCNIB && c.numeroCNIB.startsWith('B')).length,
  };

  // Handlers
  const handleAdd = () => {
    if (!canCreateClient) {
      alert("Vous n'avez pas la permission de créer un client");
      return;
    }
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleEditRequested = (client: Client) => {
    if (!canUpdateClient) {
      alert("Vous n'avez pas la permission de modifier un client");
      return;
    }
    setSelectedClient(client);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setSelectedClient(null);
    clientService.clearError();
  };

  const handleSuccess = () => {
    handleCancel();
  };

  const handleCreate = async (clientData: any) => {
    if (!canCreateClient) {
      alert("Vous n'avez pas la permission de créer un client");
      return;
    }

    try {
      await clientService.create(clientData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdate = async (clientData: Client) => {
    if (!canUpdateClient) {
      alert("Vous n'avez pas la permission de modifier un client");
      return;
    }

    try {
      await clientService.update(clientData);
      handleSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDeleteClient) {
      alert("Vous n'avez pas la permission de supprimer un client");
      return;
    }

    try {
      await clientService.delete(id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Si l'utilisateur n'a aucune permission client
  if (!hasAnyPermission(['READ_CLIENT', 'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT', 'CRUD_CLIENT'])) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
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

  if (loading && clients.length === 0 && canReadClient) {
    return (
      <div className="min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-900 dark:text-blue-100">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-management-pro min-h-screen bg-blue-50/30 dark:bg-blue-950/10 p-6">
      {/* Header avec titre et boutons */}
      <div className="page-header mb-8">
        <div className="header-content flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Gestion des Clients
            </h1>
            <p className="text-blue-600/70 dark:text-blue-400/70 mt-2">
              Gérez les clients du système (abonnés et ordinaires).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Actualiser */}
            <PermissionGuard permission="READ_CLIENT">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                title="Actualiser la liste"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
            </PermissionGuard>

            {/* Bouton Nouveau Client */}
            {!showAddForm && !showEditForm && (
              <PermissionButton
                onClick={handleAdd}
                permission="CREATE_CLIENT"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nouveau Client
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
      <PermissionGuard permission="READ_CLIENT">
        <div className="stats-section grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <BarChart2 className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm">Abonnés</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.abonnes}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <UserCheck className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl p-6 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600/70 dark:text-orange-400/70 text-sm">Clients Ordinaires</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.ordinaires}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-200/30 dark:bg-orange-700/30">
                <User className="w-6 h-6 text-orange-700 dark:text-orange-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl p-6 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600/70 dark:text-purple-400/70 text-sm">CNIB Valides</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.avecCNIBValide}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-200/30 dark:bg-purple-700/30">
                <IdCard className="w-6 h-6 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Section de la liste des clients - seulement si on peut lire */}
      <PermissionGuard permission="READ_CLIENT" fallback={
        <div className="text-center py-12 text-blue-600/70 dark:text-blue-400/70">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des clients</p>
        </div>
      }>
        {!showAddForm && !showEditForm && (
          <div className="client-list-section">
            <div className="section-header flex items-center gap-3 mb-6">
              <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Liste des Clients
              </h2>
            </div>

            <ClientList
              clients={clients}
              onEditRequested={handleEditRequested}
              onDelete={handleDelete}
              canUpdate={canUpdateClient}
              canDelete={canDeleteClient}
            />
          </div>
        )}
      </PermissionGuard>

      {/* Modal d'ajout avec permission */}
      <PermissionGuard permission="CREATE_CLIENT">
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
                <div className="modal-header p-6 border-b border-blue-200/30 dark:border-blue-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouveau Client
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <ClientForm
                    mode="add"
                    initialData={{
                      nom: '',
                      prenom: '',
                      localite: '',
                      localiteId: 0,
                      userId: 0,
                      numeroTelephone: '+226',
                      sexe: '',
                      numeroCNIB: 'B',
                      email: '',
                      nomPersonneAContacter: '',
                      prenomPersonneAContacter: '',
                      numeroPersonneAContacter: '',
                      username: '',
                      password: '',
                      abonne: false,
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
      <PermissionGuard permission="UPDATE_CLIENT">
        <AnimatePresence>
          {showEditForm && selectedClient && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-blue-200/30 dark:border-blue-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Modifier le Client
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                </div>

                <div className="modal-content p-6">
                  <ClientForm
                    mode="edit"
                    initialData={selectedClient}
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