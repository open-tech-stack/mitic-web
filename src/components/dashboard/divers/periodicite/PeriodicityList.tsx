// @/components/dashboard/divers/periodicite/PeriodicityList.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState } from "react";
import { Edit, Trash2, Badge, Settings, Info, X, CheckSquare, Square, CheckCircle, XCircle } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Periodicite } from "@/types/periodicity.types";

interface PeriodicityListProps {
  periodicities: Periodicite[];
  onEditRequested: (periodicity: Periodicite) => void;
  onDelete: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function PeriodicityList({ 
  periodicities, 
  onEditRequested, 
  onDelete,
  canUpdate = false,
  canDelete = false 
}: PeriodicityListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Configuration des colonnes pour DataTable
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
      key: "libelle",
      label: "Libellé",
      sortable: true,
    },
    {
      key: "actif",
      label: "Statut",
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        }`}>
          {value ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Actif
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              Inactif
            </>
          )}
        </span>
      ),
    },
  ];

  // Configuration des actions individuelles - conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70",
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row.id),
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: (row) => canDelete && !row.actif // Empêcher la suppression de la période active
    },
  ];

  // Actions groupées pour la sélection multiple - conditionnées par les permissions
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (selectedRows) => {
        // Vérifier qu'aucune période active n'est sélectionnée
        const hasActive = selectedRows.some((row: Periodicite) => row.actif);
        if (hasActive) {
          alert("Impossible de supprimer une période active. Désactivez-la d'abord.");
          return;
        }
        
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} élément(s) ?`)) {
          selectedRows.forEach((row: Periodicite) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: (rows: Periodicite[]) => canDelete && rows.length > 0
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 5,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: bulkActions,
  };

  return (
    <div className="periodicity-list-container-pro">
      <DataTable
        data={periodicities}
        columns={columns}
        config={tableConfig}
        onSelectionChange={setSelectedRows}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
      />
    </div>
  );
}