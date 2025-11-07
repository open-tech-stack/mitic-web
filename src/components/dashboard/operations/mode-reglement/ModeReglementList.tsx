// @/components/dashboard/operations/mode-reglement/ModeReglementList.tsx
"use client";

import { useState } from "react";
import { CreditCard, Edit, Trash2 } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { ModeReglement } from "@/types/modeReglement.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface ModeReglementListProps {
  modes: ModeReglement[];
}

export default function ModeReglementList({ modes }: ModeReglementListProps) {
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
    <div className="mode-reglement-list-container-pro">
      <PermissionGuard permission="READ_MODE_REGLEMENT" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des modes de règlement</p>
        </div>
      }>
        <DataTable
          data={modes}
          columns={columns}
          config={tableConfig}
          onSelectionChange={setSelectedRows}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />
      </PermissionGuard>
    </div>
  );
}