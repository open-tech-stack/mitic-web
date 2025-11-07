// app/dashboard/caisse-management/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Lock,
  LockOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import CaisseList from "@/components/dashboard/caissiers/listCaissier";
import { Caisse } from "@/types/caissier.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function CaisseManagementPage() {
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 
  const caisseService = ServiceFactory.createCaisseService();
  const errorHandler = ErrorHandlerService.getInstance();
  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions caisses
  const canReadCaisse = hasPermission('READ_CAISSE') || hasPermission('CRUD_CAISSE');
  const canUpdateCaisse = hasPermission('UPDATE_CAISSE') || hasPermission('CRUD_CAISSE');
  const canCloseCaisse = hasPermission('CLOSE_CAISSE') || hasPermission('CRUD_CAISSE');

  // Callback pour mettre à jour l'état local quand le service change
  const handleStateUpdate = useCallback((state: any) => {
    setCaisses(state.caisses || []);
    setLoading(state.loading || false);
    setError(state.error || null);
  }, []);

  // Charger les caisses au montage du composant
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (!canReadCaisse) {
        setError("Vous n'avez pas les permissions nécessaires pour voir les caisses");
        setLoading(false);
        return;
      }

      try {
        await caisseService.loadAll();
      } catch (err) {
        if (isMounted) {
          console.error("Erreur lors du chargement initial:", err);
        }
      }
    };

    // S'abonner aux mises à jour du service seulement si on a la permission
    if (canReadCaisse) {
      const unsubscribe = caisseService.subscribe(handleStateUpdate);
      loadInitialData();

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [caisseService, handleStateUpdate, canReadCaisse]);

  const loadCaisses = async () => {
    if (!canReadCaisse) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les caisses");
      return;
    }

    try {
      setGlobalLoading(true);
      await caisseService.loadAll();
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      setError(errorHandler.getUserMessage(appError));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleToggleState = async (idCaisse: number, newState: string) => {
    if (newState === "FERME" && !canCloseCaisse) {
      alert("Vous n'avez pas la permission de fermer les caisses");
      return;
    }

    if (!canUpdateCaisse) {
      alert("Vous n'avez pas la permission de modifier l'état des caisses");
      return;
    }

    try {
      setGlobalLoading(true);
      
      // Trouver la caisse pour récupérer ses montants actuels
      const caisse = caisses.find(c => c.idCaisse === idCaisse);
      
      if (!caisse) {
        throw new Error('Caisse non trouvée');
      }
      
      // Appeler le service avec les montants existants
      await caisseService.updateStateCaisse(
        idCaisse, 
        caisse.montantPhysique, 
        caisse.montantTheorique
      );
    } catch (err) {
      const appError = errorHandler.normalizeError(err);
      setError(errorHandler.getUserMessage(appError));
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    caisseService.clearError();
    loadCaisses();
  };

  // Si l'utilisateur n'a aucune permission caisse
  if (!hasAnyPermission(['READ_CAISSE', 'UPDATE_CAISSE', 'CLOSE_CAISSE', 'CRUD_CAISSE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Calcul des statistiques avec les états corrects
  const stats = {
    total: caisses.length,
    ouvert: caisses.filter((c) => c.etatCompte === "OUVERT").length,
    ferme: caisses.filter((c) => c.etatCompte === "FERME").length,
    instance: caisses.filter((c) => c.etatCompte === "INSTANCE_FERMETURE").length,
    initial: caisses.filter((c) => c.etatCompte === "INITIAL").length
  };

  if (globalLoading && caisses.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto" />
          <p className="mt-4 text-amber-600 dark:text-amber-400">
            Chargement des caisses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="caisse-management min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Overlay de chargement global */}
      {globalLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-amber-600">Traitement en cours...</span>
          </div>
        </div>
      )}

      {/* Header avec titre */}
      <div className="page-header mb-8">
        <div className="header-content">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
            <Wallet className="w-8 h-8 mr-3" />
            Gestion des Caisses
          </h1>
          <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
            Gérez les caisses des caissiers secondaires
          </p>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-6 p-4 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
              <PermissionButton
                onClick={handleRetry}
                permission="READ_CAISSE"
                className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
              >
                Réessayer
              </PermissionButton>
            </div>
          </div>
        </div>
      )}

      {/* Section des statistiques - seulement si on peut lire */}
      <PermissionGuard permission="READ_CAISSE">
        <div className="stats-section grid grid-cols-1 md:grid-cols-5 gap-4 mt-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Total Caisses
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <Wallet className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl p-6 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 dark:text-green-400/70 text-sm">
                  Caisses Ouvertes
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {stats.ouvert}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <LockOpen className="w-6 h-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl p-6 backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                  État Initial
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.initial}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-200/30 dark:bg-blue-700/30">
                <Lock className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  En Instance
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {stats.instance}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <Lock className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20 rounded-2xl p-6 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600/70 dark:text-gray-400/70 text-sm">
                  Caisses Fermées
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.ferme}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-200/30 dark:bg-gray-700/30">
                <Lock className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Section de la liste des caisses */}
      <div className="caisse-list-section">
        <CaisseList
          caisses={caisses}
          onToggleState={handleToggleState}
          onRefresh={loadCaisses}
          loading={loading}
          canUpdate={canUpdateCaisse}
          canClose={canCloseCaisse} 
        />
      </div>
    </div>
  );
}