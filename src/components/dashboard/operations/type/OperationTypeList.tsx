// @/components/dashboard/operations/type/OperationTypeList.tsx
"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TypeOperation } from "@/types/typeOperation.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { Receipt } from "lucide-react";

interface OperationTypeListProps {
  types: TypeOperation[];
}

export default function OperationTypeList({ types }: OperationTypeListProps) {
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
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: false, // Désactivé car pas d'actions de suppression
    pagination: true,
    searchable: true,
    pageSize: 5,
    pageSizes: [5, 10, 25, 50],
    actions: [],
    bulkActions: [],
  };

  return (
    <div className="operation-type-list-container-pro">
      <PermissionGuard permission="READ_TYPE_OPERATION" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des types d'opération</p>
        </div>
      }>
        <DataTable
          data={types}
          columns={columns}
          config={tableConfig}
          onSelectionChange={setSelectedRows}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />
      </PermissionGuard>
    </div>
  );
}