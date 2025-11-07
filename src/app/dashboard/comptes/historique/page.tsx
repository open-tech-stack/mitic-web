// @/app/dashboard/comptes/historique/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Calendar,
  RefreshCw,
  Download,
  FileText,
  Zap,
  Search
} from "lucide-react";
import HistoriqueFilters from "@/components/dashboard/comptes/historique/historiqueFilters";
import HistoriqueList from "@/components/dashboard/comptes/historique/historiqueList";
import { HistoriqueFilters as HistoriqueFiltersType } from "@/types/historiqueCompte.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function HistoriqueComptePage() {
  const [loading, setLoading] = useState(false);
  const [operations, setOperations] = useState<any[]>([]);
  const [soldeFinal, setSoldeFinal] = useState(0);
  const [filters, setFilters] = useState<HistoriqueFiltersType>({
    numeroCompte: '',
    dateDebut: '',
    dateFin: ''
  });
  const [autoSearch, setAutoSearch] = useState(false);



  const historiqueService = ServiceFactory.createHistoriqueCompteService();
  const { hasPermission } = useAuth();

  // Vérification de la permission historique
  const canReadHistorique = hasPermission('READ_HISTORIQUE');

  useEffect(() => {
    if (!canReadHistorique) return;

    // S'abonner aux changements d'état du service
    const unsubscribe = historiqueService.subscribe((state) => {
      console.log('🔄 MISE À JOUR DE L\'ÉTAT - HistoriquePage:', {
        operationsCount: state.operations.length,
        soldeFinal: state.soldeFinal,
        loading: state.loading,
        filters: state.filters
      });
      
      setOperations(state.operations);
      setSoldeFinal(state.soldeFinal);
      setLoading(state.loading);
      setFilters(state.filters);
    });

    return unsubscribe;
  }, [canReadHistorique]);

  const handleFiltersChange = async (newFilters: HistoriqueFiltersType) => {
    if (!canReadHistorique) {
      alert("Vous n'avez pas la permission de consulter l'historique");
      return;
    }

    try {
      console.log('🎯 DÉBUT RECHERCHE - HistoriquePage:', newFilters);
      await historiqueService.loadHistorique(newFilters);
      console.log('✅ RECHERCHE TERMINÉE - HistoriquePage');
    } catch (error) {
      console.error("❌ ERREUR RECHERCHE - HistoriquePage:", error);
    }
  };

  const handleRefresh = async () => {
    if (!canReadHistorique) {
      alert("Vous n'avez pas la permission de consulter l'historique");
      return;
    }

    if (historiqueService.canAutoSearch(filters)) {
      try {
        console.log('🔄 ACTUALISATION MANUELLE - HistoriquePage');
        await historiqueService.loadHistorique(filters);
      } catch (error) {
        console.error("❌ ERREUR ACTUALISATION - HistoriquePage:", error);
      }
    }
  };

  const handleExport = () => {
    if (!canReadHistorique) {
      alert("Vous n'avez pas la permission d'exporter l'historique");
      return;
    }

    console.log('📊 EXPORT DES DONNÉES - HistoriquePage:', {
      operationsCount: operations.length,
      soldeFinal: soldeFinal,
      filters: filters
    });
    // Fonction d'export à implémenter
  };

  // Si l'utilisateur n'a pas la permission historique
  if (!canReadHistorique) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <History className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  const hasData = operations.length > 0;
  const hasFilters = historiqueService.canAutoSearch(filters);

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <History className="w-8 h-8 mr-3" />
              Historique des Comptes
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Consultez l'historique des opérations de vos comptes
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasData && (
              <PermissionButton
                onClick={handleExport}
                permission="READ_HISTORIQUE"
                className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </PermissionButton>
            )}
            
            <PermissionButton
              onClick={handleRefresh}
              permission="READ_HISTORIQUE"
              disabled={loading || !hasFilters}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </PermissionButton>
          </div>
        </div>

        {/* Indicateur de période */}
        {hasData && (
          <div className="mt-4 p-3 bg-amber-100/30 dark:bg-amber-900/20 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Calendar className="w-4 h-4" />
              <span>
                Période du {historiqueService.formatDate(filters.dateDebut)} au {historiqueService.formatDate(filters.dateFin)}
                {" • "}Compte: {filters.numeroCompte}
                {" • "}Opérations: {operations.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <PermissionGuard permission="READ_HISTORIQUE">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HistoriqueFilters 
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </motion.div>
      </PermissionGuard>

      {/* Liste de l'historique */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <HistoriqueList
            loading={loading}
            operations={operations}
            soldeFinal={soldeFinal}
          />
        </motion.div>
      )}

      {/* État initial (avant recherche) */}
      {!hasFilters && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-search-state text-center py-20"
        >
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-amber-900 dark:text-amber-100 mb-3">
            Rechercher l'historique d'un compte
          </h3>
          <p className="text-amber-600/70 dark:text-amber-400/70 max-w-md mx-auto">
            Veuillez saisir le numéro de compte et la période pour consulter l'historique des opérations.
          </p>
        </motion.div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Chargement des données...</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}