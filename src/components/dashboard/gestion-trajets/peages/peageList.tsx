// @/components/dashboard/gestion-trajets/peages/peageList.tsx
"use client";

import { useState } from "react";
import { Route, MapPin, Edit, Trash2 } from "lucide-react";
import DataTable, { Column, TableAction, TableConfig } from "@/components/ui/DataTable";
import { Peage } from "@/types/peage.types";

interface ListPeageProps {
  peages: Peage[];
  loading?: boolean;
  onEdit: (peage: Peage) => void;
  onDelete: (peageId: number) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ListPeage({
  peages,
  loading = false,
  onEdit,
  onDelete,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: ListPeageProps) {
  const [selectedPeages, setSelectedPeages] = useState<Peage[]>([]);

  const columns: Column[] = [
    {
      key: "codPeage",
      label: "Code",
      sortable: true,
      width: "100px",
      align: "center",
      render: (value) => (
        <span className="inline-flex items-center justify-center w-12 h-8 bg-amber-100/50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-lg font-mono font-semibold">
          {value}
        </span>
      ),
    },
    {
      key: "libPeage",
      label: "Libellé",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <Route className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
          <span className="font-medium text-amber-900 dark:text-amber-100">{value}</span>
        </div>
      ),
    },
    {
      key: "libLoc",
      label: "Localité",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
          <span className="text-amber-900 dark:text-amber-100">{value}</span>
        </div>
      ),
    },
  ];

  // Actions pour chaque ligne - conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEdit(row),
      className: "text-amber-600/70 hover:text-amber-700 dark:hover:text-amber-300",
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le péage "${row.libPeage}" ?`)) {
          onDelete(row.id);
        }
      },
      className: "text-red-600/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (row) => canDelete
    },
  ];

  // Actions groupées - conditionnées par les permissions
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (rows) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${rows.length} péage(s) ?`)) {
          rows.forEach((row: Peage) => {
            if (row.id !== undefined) {
              onDelete(row.id);
            }
          });
        }
      },
      className: "text-red-600/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (rows: Peage[]) => canDelete && rows.length > 0
    },
  ];

  // Configuration du tableau
  const config: TableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions,
    bulkActions,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30">
      <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 flex items-center">
              <Route className="w-5 h-5 mr-2" />
              Liste des péages
            </h2>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
              {peages.length} péage(s) au total
              {selectedPeages.length > 0 && ` • ${selectedPeages.length} sélectionné(s)`}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        data={peages}
        columns={columns}
        config={config}
        loading={loading}
        onSelectionChange={setSelectedPeages}
      />
    </div>
  );
}