"use client";

import { useState } from "react";
import { Edit, Trash2, RefreshCw, Upload, Plus } from "lucide-react";
import DataTable, {
  Column,
  TableAction,
  TableConfig,
} from "@/components/ui/DataTable";
import { OrganizationalUnit } from "@/types/uo.types";

interface ListUOProps {
  data: OrganizationalUnit[];
  loading?: boolean;
  onEdit: (unit: OrganizationalUnit) => void;
  onDelete: (unit: OrganizationalUnit) => void;
  onRefresh: () => void;
  onAddUnit: () => void;
  onImport: () => void;
  onSelectionChange?: (selectedUnits: OrganizationalUnit[]) => void;
  onBulkDelete?: (units: OrganizationalUnit[]) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ListUO({
  data,
  onEdit,
  onDelete,
  onAddUnit,
  onSelectionChange,
  onBulkDelete,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: ListUOProps) {
  const [selectedUnits, setSelectedUnits] = useState<OrganizationalUnit[]>([]);

  // Configuration des colonnes pour le tableau
  const uoColumns: Column[] = [
    {
      key: "codeUo",
      label: "Code UO",
      sortable: true,
      visible: true,
      width: "120px",
      render: (value, row) => (
        <div className="font-mono font-semibold text-amber-900 dark:text-amber-100">
          {value}
          {row.parent === null && (
            <span className="ml-1 text-amber-500">★</span>
          )}
        </div>
      ),
    },
    {
      key: "libUo",
      label: "Libellé",
      sortable: true,
      visible: true,
      render: (value, row) => (
        <div className="font-medium text-amber-900 dark:text-amber-100">
          {value}
          {row.parent === null && (
            <span className="ml-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
              Racine
            </span>
          )}
        </div>
      ),
    },
    {
      key: "parent",
      label: "Parent",
      sortable: true,
      visible: true,
      render: (value) => value || "—",
    },
    {
      key: "enfants",
      label: "Sous-unités",
      sortable: true,
      visible: true,
      align: "center",
      render: (value) => (
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
          {Array.isArray(value) ? value.length : 0}
        </span>
      ),
    },
  ];

  // Actions pour chaque ligne
  const rowActions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEdit(row),
      className:
        "text-amber-600 hover:text-amber-700 dark:hover:text-amber-400",
      condition: (row) =>
        canUpdate && (!row.enfants || row.enfants.length === 0),
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row),
      className: "text-red-600 hover:text-red-700 dark:hover:text-red-400",
      condition: (row) =>
        canDelete && (!row.enfants || row.enfants.length === 0),
    },
  ];

  // Actions groupées
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (rows) => onBulkDelete && onBulkDelete(rows),
      className:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30",
      condition: (rows: OrganizationalUnit[]) =>
        canDelete &&
        rows.every(
          (row: OrganizationalUnit) => !row.enfants || row.enfants.length === 0
        ),
    },
  ];

  // Configuration du tableau
  const tableConfig: TableConfig = {
    selectable: canDelete,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: rowActions,
    bulkActions: bulkActions,
  };

  // Gestion de la sélection
  const handleSelectionChange = (selectedRows: any[]) => {
    setSelectedUnits(selectedRows);
    onSelectionChange && onSelectionChange(selectedRows);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30">
      <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Liste des unités organisationnelles
            </h2>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
              {data.length} unité(s) au total
              {selectedUnits.length > 0 &&
                ` • ${selectedUnits.length} sélectionné(s)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <button
                onClick={onAddUnit}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle unité</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        columns={uoColumns}
        config={tableConfig}
        // loading={loading}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
