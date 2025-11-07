"use client";

import { useState } from "react";
import { Edit, Trash2, Shield, AlertTriangle } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Permission } from "@/types/security.types";

interface PermissionListProps {
  permissions: Permission[];
  loading: boolean;
  onEditRequested: (permission: Permission) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: number[]) => void;
}

export default function PermissionList({
  permissions,
  loading,
  onEditRequested,
  onDelete,
  onDeleteMultiple
}: PermissionListProps) {
  const [selectedRows, setSelectedRows] = useState<Permission[]>([]);

  // Configuration des colonnes
  const columns: Column[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "80px",
      render: (value, row) => (
        <span className="id-badge inline-flex items-center justify-center w-8 h-8 bg-amber-100/50 dark:bg-amber-900/30 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300">
          {value}
        </span>
      ),
    },
    {
      key: "name",
      label: "Nom",
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
  ];

  // Actions individuelles
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300",
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        if (confirm(`Voulez-vous vraiment supprimer la permission "${row.name}" ?`)) {
          onDelete(row.id);
        }
      },
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-300",
    },
  ];

  // Actions groupées
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: `Supprimer (${selectedRows.length})`,
      onClick: (selectedRows: Permission[]) => {
        const count = selectedRows.length;
        const message = count === 1 
          ? `Voulez-vous vraiment supprimer la permission "${selectedRows[0].name}" ?`
          : `Voulez-vous vraiment supprimer les ${count} permissions sélectionnées ?`;
        
        if (confirm(message)) {
          const ids = selectedRows.map(row => row.id);
          onDeleteMultiple(ids);
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-4 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors font-medium",
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: true,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: bulkActions,
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: Permission[]) => {
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="permission-list-container-pro">
      {/* Informations sur la sélection */}
      {selectedRows.length > 0 && (
        <div className="selection-info mb-4 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              {selectedRows.length} permission{selectedRows.length > 1 ? 's' : ''} sélectionnée{selectedRows.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            Permissions sélectionnées : {selectedRows.map(row => row.name).join(', ')}
          </div>
        </div>
      )}

      {/* Tableau des données */}
      <DataTable
        data={permissions}
        columns={columns}
        config={tableConfig}
        loading={loading}
        onSelectionChange={handleSelectionChange}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
      />

      {/* État vide */}
      {!loading && permissions.length === 0 && (
        <div className="empty-state text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
            Aucune permission trouvée
          </h3>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Commencez par ajouter votre première permission.
          </p>
        </div>
      )}
    </div>
  );
}