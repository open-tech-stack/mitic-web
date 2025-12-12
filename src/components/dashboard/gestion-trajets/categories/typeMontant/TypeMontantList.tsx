// @/components/dashboard/gestion-trajets/categories/typeMontant/TypeMontantList.tsx

"use client";

import { useState } from "react";
import { Edit, Trash2, Calculator } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { TypeMontant } from "@/types/typeMontant.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface AmountTypeListProps {
  amountTypes: TypeMontant[];
  onEditRequested: (amountType: TypeMontant) => void;
  onDelete: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function AmountTypeList({
  amountTypes,
  onEditRequested,
  onDelete,
  canUpdate = false,
  canDelete = false,
}: AmountTypeListProps) {
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
      key: "calculable",
      label: "Calculable",
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value
            ? "bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            : "bg-gray-100/50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
          }`}>
          {value ? "Oui" : "Non"}
        </span>
      ),
    },
    {
      key: "formule",
      label: "Formule",
      sortable: false,
      render: (value, row) => (
        <div className="max-w-xs">
          {row.calculable ? (
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              <span className="font-mono text-sm truncate" title={value}>
                {value || "-"}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
    }
  ];

  // Configuration des actions individuelles
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70",
      condition: () => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row.id),
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: () => canDelete
    },
  ];

  // Actions groupées pour la sélection multiple
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (selectedRows) => {
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} élément(s) ?`)) {
          selectedRows.forEach((row: TypeMontant) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: () => canDelete
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete || canUpdate,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: bulkActions,
  };

  return (
    <div className="amount-type-list-container-pro">
      <PermissionGuard permission="READ_TYPE_MONTANT" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des types de montant</p>
        </div>
      }>
        <DataTable
          data={amountTypes}
          columns={columns}
          config={tableConfig}
          onSelectionChange={setSelectedRows}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />
      </PermissionGuard>
    </div>
  );
}