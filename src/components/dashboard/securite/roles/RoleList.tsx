"use client";

import { useState } from "react";
import { Edit, Trash2, Key, AlertTriangle } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Role } from "@/types/security.types";

interface RoleListProps {
  roles: Role[];
  loading: boolean;
}

export default function RoleList({
  roles,
  loading,
}: RoleListProps) {
  const [selectedRows, setSelectedRows] = useState<Role[]>([]);

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



  // Configuration du tableau
  const tableConfig = {
    selectable: true,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: Role[]) => {
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="role-list-container-pro">
      {/* Informations sur la sélection */}
      {selectedRows.length > 0 && (
        <div className="selection-info mb-4 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              {selectedRows.length} rôle{selectedRows.length > 1 ? 's' : ''} sélectionné{selectedRows.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            Rôles sélectionnés : {selectedRows.map(row => row.name).join(', ')}
          </div>
        </div>
      )}

      {/* Tableau des données */}
      <DataTable
        data={roles}
        columns={columns}
        config={tableConfig}
        loading={loading}
        onSelectionChange={handleSelectionChange}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
      />

      {/* État vide */}
      {!loading && roles.length === 0 && (
        <div className="empty-state text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Key className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
            Aucun rôle trouvé
          </h3>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Commencez par ajouter votre premier rôle.
          </p>
        </div>
      )}
    </div>
  );
}