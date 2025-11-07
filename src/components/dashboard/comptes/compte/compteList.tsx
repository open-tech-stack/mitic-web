// @/components/dashboard/comptes/compte/compteList.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  User,
  Building2,
  CreditCard,
  Wallet,
  AlertTriangle,
  RefreshCw,
  Calendar,
  BookOpen,
} from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Compte } from "@/types/compte.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface CompteListProps {
  loading: boolean;
  onEditRequested: (compte: Compte) => void;
  onDelete: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function CompteList({
  loading,
  onEditRequested,
  onDelete,
  canUpdate = false,
  canDelete = false,
}: CompteListProps) {
  const [selectedRows, setSelectedRows] = useState<Compte[]>([]);
  const [comptes, setComptes] = useState<Compte[]>([]);
  const compteService = ServiceFactory.createCompteService();

  useEffect(() => {
    const loadComptes = async () => {
      try {
        await compteService.loadAll();
      } catch (error) {
        console.error("Erreur lors du chargement des comptes:", error);
      }
    };

    const unsubscribe = compteService.subscribe((state) => {
      setComptes(state.comptes);
    });

    loadComptes();

    return unsubscribe;
  }, []);

  const handleRefresh = async () => {
    try {
      await compteService.loadAll();
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    }
  };

  // Fonctions utilitaires
  const getEntiteDisplay = (compte: Compte): string => {
    return compteService.getEntiteDisplay(compte);
  };

  const formatSolde = (solde?: number): string => {
    return compteService.formatSolde(solde);
  };

  // Afficher directement le path PCG
  const getPcgDisplay = (compte: Compte): string => {
    return (
      compte.path || 'Non défini'
    );
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  // Configuration des colonnes - MISE À JOUR
  const columns: Column[] = [
    {
      key: "index",
      label: "N°",
      sortable: false,
      render: (value, row, index) => (
        <span className="id-badge inline-flex items-center justify-center w-8 h-8 bg-amber-100/50 dark:bg-amber-900/30 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300">
          {index + 1}
        </span>
      ),
    },
    {
      key: "numeroCompte",
      label: "Numéro",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span className="font-mono text-sm font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "dateCreation",
      label: "Date Création",
      sortable: true,
      render: (value, row: Compte) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600/70 dark:text-blue-400/70" />
          <span className="text-sm text-amber-900 dark:text-amber-100">
            {formatDate(row.dateCreation)}
          </span>
        </div>
      ),
    },
    {
      key: "libelle",
      label: "Libellé",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "path",
      label: "PCG",
      sortable: true,
      render: (value, row: Compte) => (
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-600/70 dark:text-green-400/70" />
          <span className="text-sm text-amber-900 dark:text-amber-100">
            {getPcgDisplay(row)}
          </span>
        </div>
      ),
    },
    {
      key: "entite",
      label: "Entité",
      sortable: false,
      render: (value, row: Compte) => (
        <div className="flex items-center gap-2">
          {row.user ? (
            <>
              <User className="w-4 h-4 text-green-600/70 dark:text-green-400/70" />
              <span className="text-sm text-amber-900 dark:text-amber-100">
                {getEntiteDisplay(row)}
              </span>
            </>
          ) : row.codeUo ? (
            <>
              <Building2 className="w-4 h-4 text-purple-600/70 dark:text-purple-400/70" />
              <span className="text-sm text-amber-900 dark:text-amber-100">
                {getEntiteDisplay(row)}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Non défini
            </span>
          )}
        </div>
      ),
    },
    {
      key: "solde",
      label: "Solde",
      sortable: true,
      render: (value, row: Compte) => (
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span
            className={`text-sm font-medium ${
              (row.solde || 0) >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatSolde(row.solde)}
          </span>
        </div>
      ),
    },
  ];

  // Actions individuelles conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row as Compte),
      className:
        "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300",
      condition: () => canUpdate,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        if (
          confirm(
            `Voulez-vous vraiment supprimer le compte "${
              (row as Compte).libelle
            }" ?`
          )
        ) {
          onDelete((row as Compte).id);
        }
      },
      className:
        "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-300",
      condition: () => canDelete,
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: [],
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: Compte[]) => {
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="compte-list-container-pro">
      <PermissionGuard permission="READ_COMPTE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des comptes</p>
        </div>
      }>
        {/* Informations sur la sélection */}
        {selectedRows.length > 0 && (
          <div className="selection-info mb-4 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {selectedRows.length} compte{selectedRows.length > 1 ? "s" : ""}{" "}
                sélectionné{selectedRows.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              Comptes sélectionnés :{" "}
              {selectedRows.map((row) => row.libelle).join(", ")}
            </div>
          </div>
        )}

        {/* Tableau des données */}
        <DataTable
          data={comptes}
          columns={columns}
          config={tableConfig}
          loading={loading}
          onSelectionChange={handleSelectionChange}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />

        {/* État vide */}
        {!loading && comptes.length === 0 && (
          <div className="empty-state text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
              Aucun compte trouvé
            </h3>
            <p className="text-amber-600/70 dark:text-amber-400/70">
              Commencez par ajouter votre premier compte.
            </p>
          </div>
        )}
      </PermissionGuard>
    </div>
  );
}