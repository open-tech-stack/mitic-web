// @/app/dashboard/gestion-trajets/troncons/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Route, Link, RefreshCw } from "lucide-react";
import TronconManagement from "@/components/dashboard/gestion-trajets/troncons/TronconManagement";
import TronconLocaliteManagement from "@/components/dashboard/gestion-trajets/troncons/TronconLocaliteManagement";
import { TronconService } from "@/services/troncon/troncon.service";
import { PeageService } from "@/services/peage/peage.service";
import { LocaliteService } from "@/services/localite/localite.service";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { Troncon, TronconLocaliteBackend } from "@/types/troncon.types";
import { Peage } from "@/types/peage.types";
import { Localite } from "@/types/localite.types";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function TronconPage() {
  const [activeTab, setActiveTab] = useState<"troncons" | "associations">("troncons");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tronconService = TronconService.getInstance();
  const peageService = PeageService.getInstance();
  const localiteService = LocaliteService.getInstance();
  const errorHandler = ErrorHandlerService.getInstance();
  const { hasPermission, hasAnyPermission } = useAuth();

  const [troncons, setTroncons] = useState<Troncon[]>([]);
  const [tronconLocalites, setTronconLocalites] = useState<TronconLocaliteBackend[]>([]);
  const [peages, setPeages] = useState<Peage[]>([]);
  const [localites, setLocalites] = useState<Localite[]>([]);



  // Vérifications des permissions tronçons
  const canReadTroncon = hasPermission('READ_TRONCON') || hasPermission('CRUD_TRONCON');
  const canCreateTroncon = hasPermission('CREATE_TRONCON') || hasPermission('CRUD_TRONCON');
  const canUpdateTroncon = hasPermission('UPDATE_TRONCON') || hasPermission('CRUD_TRONCON');
  const canDeleteTroncon = hasPermission('DELETE_TRONCON') || hasPermission('CRUD_TRONCON');
  const canReadAssociations = hasPermission('READ_TRONCON') || hasPermission('CRUD_TRONCON');

  // Charger les données
  useEffect(() => {
    if (canReadTroncon || canReadAssociations) {
      loadAllData();
      
      const unsubscribeTroncon = tronconService.subscribe((state) => {
        setTroncons(state.troncons);
        setTronconLocalites(state.tronconLocalites);
        setLoading(state.loading);
        setError(state.error);
      });

      const unsubscribePeage = peageService.subscribe((state) => {
        setPeages(state.peages);
      });

      const unsubscribeLocalite = localiteService.subscribe((state) => {
        setLocalites(state.localites);
      });

      return () => {
        unsubscribeTroncon();
        unsubscribePeage();
        unsubscribeLocalite();
      };
    }
  }, [canReadTroncon, canReadAssociations]);

  const loadAllData = async () => {
    if (!canReadTroncon && !canReadAssociations) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les tronçons");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        peageService.loadAllPeages(),
        localiteService.loadAllLocalites(),
        tronconService.loadAllTroncons(),
        tronconService.loadAllTronconLocalites()
      ]);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    loadAllData();
  };

  const handleTronconCreate = async (data: Omit<Troncon, "id" | "codLoc">) => {
    if (!canCreateTroncon) {
      alert("Vous n'avez pas la permission de créer un tronçon");
      return;
    }

    try {
      await tronconService.createTroncon(data);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleTronconUpdate = async (id: number, data: Partial<Troncon>) => {
    if (!canUpdateTroncon) {
      alert("Vous n'avez pas la permission de modifier un tronçon");
      return;
    }

    try {
      await tronconService.updateTroncon(id, data);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleTronconDelete = async (id: number) => {
    if (!canDeleteTroncon) {
      alert("Vous n'avez pas la permission de supprimer un tronçon");
      return;
    }

    try {
      await tronconService.deleteTroncon(id);
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  const handleTronconDeleteMultiple = async (ids: number[]) => {
    if (!canDeleteTroncon) {
      alert("Vous n'avez pas la permission de supprimer des tronçons");
      return;
    }

    try {
      await Promise.all(ids.map(id => tronconService.deleteTroncon(id)));
    } catch (error: any) {
      const appError = errorHandler.normalizeError(error);
      setError(errorHandler.getUserMessage(appError));
    }
  };

  // Si l'utilisateur n'a aucune permission tronçon
  if (!hasAnyPermission(['READ_TRONCON', 'CREATE_TRONCON', 'UPDATE_TRONCON', 'DELETE_TRONCON', 'CRUD_TRONCON'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Route className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Calculer les statistiques
  const stats = {
    troncons: troncons.length,
    associations: tronconLocalites.length,
    tronconsLibres: troncons.filter(t => {
      const peageGauche = peages.find(p => p.id === t.peagesGauche);
      const peageDroit = peages.find(p => p.id === t.peagesDroit);
      const tronconLibelle = `${peageGauche?.libPeage} - ${peageDroit?.libPeage}`;
      return !tronconLocalites.some(tl => tl.troncon === tronconLibelle);
    }).length,
  };

  // Utiliser les données enrichies du service
  const tronconLocalitesDisplay = tronconService.tronconLocalitesDisplay;

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Route className="w-8 h-8 mr-3" />
              Gestion des Tronçons
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les tronçons de péage et leurs associations avec les localités virtuelles
            </p>
          </div>
          
          <div className="header-actions">
            {loading ? (
              <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full"></div>
            ) : (
              <PermissionButton
                onClick={handleRefreshData}
                permission="READ_TRONCON"
                className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </PermissionButton>
            )}
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/30 border border-red-200/30 dark:border-red-700/30 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_TRONCON">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Tronçons
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.troncons}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Route className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Associations
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.associations}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Link className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Tronçons libres
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.tronconsLibres}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Route className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-amber-200/30 dark:border-amber-700/30">
          <PermissionGuard permission="READ_TRONCON">
            <button
              onClick={() => setActiveTab("troncons")}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === "troncons"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
              }`}
            >
              <Route className="w-4 h-4 inline mr-2" />
              Tronçons
              {stats.troncons > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.troncons}
                </span>
              )}
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission="READ_TRONCON">
            <button
              onClick={() => setActiveTab("associations")}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === "associations"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
              }`}
            >
              <Link className="w-4 h-4 inline mr-2" />
              Associations
              {stats.associations > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.associations}
                </span>
              )}
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "troncons" && (
            <PermissionGuard permission="READ_TRONCON" fallback={
              <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
                <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'avez pas la permission de voir la liste des tronçons</p>
              </div>
            }>
              <div className="tab-content">
                <TronconManagement
                  troncons={troncons}
                  peages={peages}
                  loading={loading}
                  onTronconCreate={handleTronconCreate}
                  onTronconUpdate={handleTronconUpdate}
                  onTronconDelete={handleTronconDelete}
                  onTronconDeleteMultiple={handleTronconDeleteMultiple}
                  canCreate={canCreateTroncon}
                  canUpdate={canUpdateTroncon}
                  canDelete={canDeleteTroncon}
                />
              </div>
            </PermissionGuard>
          )}

          {activeTab === "associations" && (
            <PermissionGuard permission="READ_TRONCON" fallback={
              <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
                <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'avez pas la permission de voir les associations</p>
              </div>
            }>
              <div className="tab-content">
                <TronconLocaliteManagement
                  associations={tronconLocalitesDisplay}
                  loading={loading}
                />
              </div>
            </PermissionGuard>
          )}
        </motion.div>
      </div>
    </div>
  );
}