// @/app/dashboard/comptes/compte/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Edit,
  List,
  User,
  Building2,
  Wallet,
  RefreshCw,
} from "lucide-react";
import CompteList from "@/components/dashboard/comptes/compte/compteList";
import CompteForm from "@/components/dashboard/comptes/compte/compteForm";
import { Compte, CompteCreateData } from "@/types/compte.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function ComptesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompte, setSelectedCompte] = useState<Compte | null>(null);
  const [loading, setLoading] = useState(false);
  const [comptes, setComptes] = useState<Compte[]>([]);

  const compteService = ServiceFactory.createCompteService();
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions comptes
  const canReadCompte = hasPermission('READ_COMPTE') || hasPermission('CRUD_COMPTE');
  const canCreateCompte = hasPermission('CREATE_COMPTE') || hasPermission('CRUD_COMPTE');
  const canUpdateCompte = hasPermission('UPDATE_COMPTE') || hasPermission('CRUD_COMPTE');
  const canDeleteCompte = hasPermission('DELETE_COMPTE') || hasPermission('CRUD_COMPTE');

  useEffect(() => {
    if (!canReadCompte) return;

    // S'abonner aux changements d'état du service
    const unsubscribe = compteService.subscribe((state) => {
      setComptes(state.comptes);
      setLoading(state.loading);
    });

    // Charger les comptes au montage
    loadComptes();

    return unsubscribe;
  }, [canReadCompte]);

  const loadComptes = async () => {
    if (!canReadCompte) return;

    try {
      await compteService.loadAll();
    } catch (error) {
      console.error("Erreur lors du chargement des comptes:", error);
    }
  };

  // Si l'utilisateur n'a aucune permission compte
  if (!hasAnyPermission(['READ_COMPTE', 'CREATE_COMPTE', 'UPDATE_COMPTE', 'DELETE_COMPTE', 'CRUD_COMPTE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Calcul du solde total
  const soldeTotal = comptes.reduce(
    (total, compte) => total + (compte.solde || 0),
    0
  );

  // Statistiques
  const stats = {
    total: comptes.length,
    organisationnels: comptes.filter((c) => c.typeCompte === 1).length,
    departementaux: comptes.filter((c) => c.typeCompte === 2).length,
    personnels: comptes.filter((c) => c.typeCompte === 3).length,
  };

  // 🔥 CORRECTION SIMPLIFIÉE: Fermeture IMMÉDIATE du formulaire
  const handleAddCompte = async (compteData: CompteCreateData) => {
    if (!canCreateCompte) {
      alert("Vous n'avez pas la permission de créer un compte");
      return;
    }

    try {
      // Fermer IMMÉDIATEMENT le modal
      setShowAddModal(false);

      // Lancer la création en arrière-plan
      await compteService.create(compteData);

      // L'actualisation se fait automatiquement via le service (loadAll appelé dans create)
    } catch (error) {
      console.error("Erreur lors de l'ajout du compte:", error);
      // Le modal est déjà fermé, l'erreur sera affichée via le service
    }
  };

  const handleUpdateCompte = async (compteData: Compte | CompteCreateData) => {
    if (!canUpdateCompte) {
      alert("Vous n'avez pas la permission de modifier un compte");
      return;
    }

    try {
      // Fermer IMMÉDIATEMENT le modal
      setShowEditModal(false);
      setSelectedCompte(null);

      if ('id' in compteData) {
        // Lancer la modification en arrière-plan
        await compteService.update(compteData as Compte);
      }
    } catch (error) {
      console.error("Erreur lors de la modification du compte:", error);
    }
  };

  const handleDeleteCompte = async (id: number) => {
    if (!canDeleteCompte) {
      alert("Vous n'avez pas la permission de supprimer un compte");
      return;
    }

    try {
      await compteService.delete(id);
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
    }
  };

  const handleEditRequested = (compte: Compte) => {
    if (!canUpdateCompte) {
      alert("Vous n'avez pas la permission de modifier un compte");
      return;
    }

    setSelectedCompte(compte);
    setShowEditModal(true);
  };

  const handleRefresh = async () => {
    await loadComptes();
  };

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <CreditCard className="w-8 h-8 mr-3" />
              Gestion des Comptes
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les comptes organisationnels et personnels de votre entreprise
            </p>
          </div>
        </div>

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_COMPTE">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Total</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <CreditCard className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Organisationnels</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.organisationnels}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Personnels</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.personnels}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <User className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Solde Total</p>
                  <p className={`text-2xl font-bold ${soldeTotal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                    }).format(soldeTotal)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Wallet className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Contrôles */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors">
              <List className="w-4 h-4" />
              <span>Liste des comptes</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={handleRefresh}
              permission="READ_COMPTE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </PermissionButton>
            <PermissionButton
              onClick={() => setShowAddModal(true)}
              permission="CREATE_COMPTE"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau compte</span>
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Liste des comptes */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CompteList
            loading={loading}
            onEditRequested={handleEditRequested}
            onDelete={handleDeleteCompte}
            canUpdate={canUpdateCompte}
            canDelete={canDeleteCompte}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <PermissionGuard permission="CREATE_COMPTE">
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                    <Plus className="w-6 h-6 mr-2" />
                    Nouveau Compte
                  </h2>
                  <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Ajouter un nouveau compte à votre organisation
                  </p>
                </div>

                <CompteForm
                  onSubmit={handleAddCompte}
                  onCancel={() => setShowAddModal(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PermissionGuard>

      <PermissionGuard permission="UPDATE_COMPTE">
        <AnimatePresence>
          {showEditModal && selectedCompte && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                    <Edit className="w-6 h-6 mr-2" />
                    Modifier le Compte
                  </h2>
                  <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Modifier les informations du compte
                  </p>
                </div>

                <CompteForm
                  compte={selectedCompte}
                  onSubmit={handleUpdateCompte}
                  onCancel={() => setShowEditModal(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PermissionGuard>
    </div>
  );
}