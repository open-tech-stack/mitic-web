// components/dashboard/caissiers/listCaissier.tsx
"use client";

import { useState } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  User,
  Lock,
  LockOpen,
  RefreshCw,
} from "lucide-react";
import { Caisse } from "@/types/caissier.types";
import DataTable, {
  Column,
  TableAction,
  TableConfig,
} from "@/components/ui/DataTable";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

interface CaisseListProps {
  caisses: Caisse[];
  onToggleState: (idCaisse: number, newState: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  canUpdate?: boolean;
  canClose?: boolean;
}

export default function CaisseList({
  caisses,
  onToggleState,
  onRefresh,
  loading = false,
  canUpdate = false,
  canClose = false,
}: CaisseListProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState<Caisse | null>(null);
  const [targetState, setTargetState] = useState<string>("");

  // Fonction pour calculer et formater la différence montantPhysique - montantTheorique
  const formatDifference = (caisse: Caisse) => {
    const difference = caisse.montantPhysique - caisse.montantTheorique;
    const absoluteValue = Math.abs(difference);
    const isPerte = difference < 0;
    const isExcedent = difference > 0;
    const isEgal = difference === 0;

    return {
      value: absoluteValue,
      isPerte,
      isExcedent,
      isEgal,
      formatted: `${absoluteValue.toFixed(2)} F ${isPerte ? "(Perte)" : isExcedent ? "(Excédent)" : ""}`
    };
  };

  const handleStateChangeRequest = (caisse: Caisse, newState: string) => {
    if (newState === "FERME") {
      if (!canClose) {
        alert("Vous n'avez pas la permission de fermer les caisses");
        return;
      }
      setSelectedCaisse(caisse);
      setTargetState(newState);
      setShowConfirmModal(true);
    } else {
      if (!canUpdate) {
        alert("Vous n'avez pas la permission de modifier l'état des caisses");
        return;
      }
      onToggleState(caisse.idCaisse, newState);
    }
  };

  const confirmStateChange = () => {
    if (selectedCaisse) {
      onToggleState(selectedCaisse.idCaisse, targetState);
    }
    setShowConfirmModal(false);
    setSelectedCaisse(null);
    setTargetState("");
  };

  // Définition des colonnes pour le DataTable
  const columns: Column[] = [
    {
      key: "nom",
      label: "Nom",
      sortable: true,
      visible: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-700 dark:to-amber-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-amber-700 dark:text-amber-200" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {row.nom} {row.prenom}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "montantTheorique",
      label: "Montant théorique",
      sortable: true,
      visible: true,
      render: (value) => `${parseFloat(value).toFixed(2)} F`,
      align: "right",
    },
    {
      key: "montantPhysique",
      label: "Montant physique",
      sortable: true,
      visible: true,
      render: (value) => `${parseFloat(value).toFixed(2)} F`,
      align: "right",
    },
    {
      key: "difference",
      label: "Perte/Excédent",
      sortable: true,
      visible: true,
      render: (value, row) => {
        const diff = formatDifference(row);
        
        return (
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              diff.isPerte
                ? "bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200/50 dark:border-red-700/50"
                : diff.isExcedent
                ? "bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50"
                : "bg-gray-100/80 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50"
            }`}
          >
            {diff.isPerte ? (
              <TrendingDown className="w-3 h-3 mr-1" />
            ) : diff.isExcedent ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : null}
            {diff.formatted}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "etatCompte",
      label: "État",
      sortable: true,
      visible: true,
      render: (value) => {
        // Affichage direct des états sans normalisation
        return (
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
              value === "OUVERT"
                ? "bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-700/50"
                : value === "FERME"
                ? "bg-gray-100/80 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/50"
                : value === "INSTANCE_FERMETURE"
                ? "bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-700/50"
                : "bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50"
            }`}
          >
            {value === "OUVERT" && (
              <>
                <LockOpen className="w-3 h-3 mr-1" />
                Ouvert
              </>
            )}
            {value === "FERME" && (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Fermé
              </>
            )}
            {value === "INSTANCE_FERMETURE" && (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Instance fermeture
              </>
            )}
            {value === "INITIAL" && (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Initial
              </>
            )}
          </span>
        );
      },
      align: "center",
    },
  ];

  // Actions pour le tableau - SEULEMENT pour les caisses en instance de fermeture et si on a les permissions
  const actions: TableAction[] = [
    {
      icon: Lock,
      label: "Fermer la caisse",
      onClick: (row) => handleStateChangeRequest(row, "FERME"),
      condition: (row) => row.etatCompte === "INSTANCE_FERMETURE" && canClose,
      className: "text-green-600 hover:text-green-700",
    },
  ];

  // Configuration du tableau
  const tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
  };

  // Bouton d'actualisation personnalisé
  const RefreshButton = () => (
    <PermissionButton
      onClick={onRefresh}
      permission="READ_CAISSE"
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      <span>Actualiser</span>
    </PermissionButton>
  );

  if (loading && caisses.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/40 dark:border-amber-700/40">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-amber-200 dark:border-amber-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Chargement des caisses...
          </span>
        </div>
      </div>
    );
  }

  if (caisses.length === 0) {
    return (
      <div className="text-center p-12 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 rounded-2xl shadow-lg border border-amber-200/40 dark:border-amber-700/40">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-200/50 dark:bg-amber-700/30 rounded-full mb-4">
          <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
          Aucune caisse
        </h3>
        <p className="text-amber-600/70 dark:text-amber-400/70 max-w-md mx-auto">
          Aucune caisse n'a été trouvée pour le moment.
        </p>
        <div className="mt-6">
          <RefreshButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PermissionGuard permission="READ_CAISSE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des caisses</p>
        </div>
      }>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
            Liste des Caisses
          </h2>
          <RefreshButton />
        </div>

        <DataTable
          data={caisses}
          columns={columns}
          config={tableConfig}
          loading={loading}
          className="border border-amber-200/40 dark:border-amber-700/40"
        />

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmStateChange}
          title="Confirmer la fermeture"
          message={`Voulez-vous vraiment fermer la caisse de ${selectedCaisse?.nom} ${selectedCaisse?.prenom} ?`}
          confirmText="Fermer"
          cancelText="Annuler"
          type="warning"
        />
      </PermissionGuard>
    </div>
  );
}