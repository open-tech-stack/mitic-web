// @/components/dashboard/operations/operation-montant-type/OperationMontantTypeList.tsx
"use client";

import { useState } from "react";
import { Edit, Link, Trash2 } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { OperationMontantType, DeleteOperationMontantTypeRequest } from "@/types/operationMontantType.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface OperationMontantTypeListProps {
  associations: OperationMontantType[];
  onEditRequested: (association: OperationMontantType) => void;
  onDelete: (deleteRequest: DeleteOperationMontantTypeRequest) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function OperationMontantTypeList({ 
  associations, 
  onEditRequested, 
  onDelete,
  canUpdate = false,
  canDelete = false,
}: OperationMontantTypeListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

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
      key: "libelleTypeOperation",
      label: "Type d'Opération",
      sortable: true,
    },
    {
      key: "libelleTypeMontant",
      label: "Type de Montant",
      sortable: true,
    }
  ];

  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70",
      condition: () => canUpdate,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete({
        idTypeOperation: row.idTypeOperation,
        idTypeMontant: row.idTypeMontant
      }),
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: () => canDelete,
    }
  ];

  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (selectedRows) => {
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} association(s) ?`)) {
          selectedRows.forEach((row: OperationMontantType) => onDelete({
            idTypeOperation: row.idTypeOperation,
            idTypeMontant: row.idTypeMontant
          }));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: () => canDelete,
    }
  ];

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
    <div className="operation-montant-type-list-container-pro">
      <PermissionGuard permission="READ_OPERATION_MONTANT_TYPE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des associations</p>
        </div>
      }>
        <DataTable
          data={associations}
          columns={columns}
          config={tableConfig}
          onSelectionChange={setSelectedRows}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />
      </PermissionGuard>
    </div>
  );
}