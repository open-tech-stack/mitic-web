// @/components/dashboard/gestion-trajets/categories/typeMontant/TypeMontantList.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, RotateCcw, DollarSign } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { TypeMontant } from "@/types/typeMontant.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface AmountTypeListProps {
  amountTypes: TypeMontant[];
  onEditRequested: (amountType: TypeMontant) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function AmountTypeList({ 
  amountTypes, 
  onEditRequested, 
  onDelete, 
  onRestore,
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
    }
  ];

  // Configuration des actions individuelles
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70",
      condition: (row) => !row.isDelete && canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row.id),
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: (row) => !row.isDelete && canDelete
    },
    {
      icon: RotateCcw,
      label: "Restaurer",
      onClick: (row) => onRestore(row.id),
      className: "p-2 rounded-lg hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors text-green-600/70 dark:text-green-400/70",
      condition: (row) => row.isDelete && canUpdate
    },
  ];

  // Actions groupées pour la sélection multiple
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (selectedRows) => {
        // Vérifier qu'aucun élément déjà supprimé n'est sélectionné
        const hasDeleted = selectedRows.some((row: TypeMontant) => row.isDelete);
        if (hasDeleted) {
          alert("Certains éléments sont déjà supprimés.");
          return;
        }
        
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} élément(s) ?`)) {
          selectedRows.forEach((row: TypeMontant) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: () => canDelete
    },
    {
      icon: RotateCcw,
      label: "Restaurer la sélection",
      onClick: (selectedRows) => {
        // Vérifier qu'aucun élément non supprimé n'est sélectionné
        const hasNotDeleted = selectedRows.some((row: TypeMontant) => !row.isDelete);
        if (hasNotDeleted) {
          alert("Certains éléments ne sont pas supprimés.");
          return;
        }
        
        if (confirm(`Voulez-vous vraiment restaurer ${selectedRows.length} élément(s) ?`)) {
          selectedRows.forEach((row: TypeMontant) => onRestore(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-green-100/70 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200/70 dark:hover:bg-green-800/40 transition-colors",
      condition: () => canUpdate
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete || canUpdate, // seulement si on peut supprimer ou restaurer
    pagination: true,
    searchable: true,
    pageSize: 5,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: bulkActions,
  };

  return (
    <div className="amount-type-list-container-pro">
      <PermissionGuard permission="READ_TYPE_MONTANT" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
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