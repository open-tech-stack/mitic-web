"use client";

import { useState } from "react";
import { Edit, Trash2, Calendar, DollarSign, Car, Axe, RefreshCw } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { AbonnementTarif } from "@/types/period-tarif.types";

interface AbonnementTarifListProps {
  tarifs: AbonnementTarif[];
  onEditRequested: (tarif: AbonnementTarif) => void;
  onDelete: (id: number) => void;
  onRefresh?: () => void; // Nouvelle prop pour l'actualisation
  canUpdate?: boolean;
  canDelete?: boolean;
  loading?: boolean; // Nouvelle prop pour l'état de chargement
}

export default function AbonnementTarifList({
  tarifs,
  onEditRequested,
  onDelete,
  onRefresh,
  canUpdate = false,
  canDelete = false,
  loading = false
}: AbonnementTarifListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Configuration des colonnes pour DataTable
  const columns: Column[] = [
    {
      key: "index",
      label: "N°",
      sortable: false,
      render: (value, row, index) => (
        <span className="id-badge inline-flex items-center justify-center w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
          {index + 1}
        </span>
      ),
    },
    {
      key: "libelle",
      label: "Type de Véhicule",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-blue-600" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "nbreEssieux",
      label: "Nombre d'Essieux",
      sortable: true,
      render: (value, row) => (
        value ? (
          <div className="flex items-center gap-2">
            <Axe className="w-4 h-4 text-orange-600" />
            <span>{value}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: "periodelibelle",
      label: "Périodicité",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-green-600" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold">{value?.toLocaleString('fr-FR')} F</span>
        </div>
      ),
    },
  ];

  // Configuration des actions individuelles - conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors text-blue-600/70 dark:text-blue-400/70",
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row.id),
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: (row) => canDelete
    },
  ];

  // Actions groupées pour la sélection multiple - conditionnées par les permissions
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (selectedRows) => {
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} élément(s) ?`)) {
          selectedRows.forEach((row: AbonnementTarif) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: (rows: AbonnementTarif[]) => canDelete && rows.length > 0
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete,
    pagination: true,
    searchable: true,
    pageSize: 5,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: bulkActions,
  };

  return (
    <div className="abonnement-tarif-list-container-pro">
      {/* Header avec bouton d'actualisation */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
          {tarifs.length} tarif(s) trouvé(s)
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        )}
      </div>

      <DataTable
        data={tarifs}
        columns={columns}
        config={tableConfig}
        onSelectionChange={setSelectedRows}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-200/30 dark:border-blue-700/30"
      />
    </div>
  );
}