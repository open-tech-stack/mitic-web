// @/components/dashboard/comptes/type/compteTypeList.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { CompteType } from "@/types/typeCompte.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface CompteTypeListProps {
  types: CompteType[];
  loading: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function CompteTypeList({ 
  types, 
  loading,
  canUpdate = false,
  canDelete = false,
}: CompteTypeListProps) {
  const [selectedRows, setSelectedRows] = useState<CompteType[]>([]);

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

  // Actions conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => {
        // Action de modification (désactivée pour l'instant)
        alert("La modification des types de compte est désactivée.");
      },
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70",
      condition: () => canUpdate,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        // Action de suppression (désactivée pour l'instant)
        alert("La suppression des types de compte est désactivée.");
      },
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: () => canDelete,
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: [],
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: any[]) => {
    setSelectedRows(newSelectedRows as CompteType[]);
  };

  return (
    <div className="type-list-container-pro">
      <PermissionGuard permission="READ_COMPTE_TYPE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des types de compte</p>
        </div>
      }>
        {/* Informations sur la sélection */}
        {selectedRows.length > 0 && (
          <div className="selection-info mb-4 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {selectedRows.length} élément{selectedRows.length > 1 ? 's' : ''} sélectionné{selectedRows.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              Types sélectionnés : {selectedRows.map((row: CompteType) => row.libelle).join(', ')}
            </div>
          </div>
        )}

        {/* Tableau des données */}
        <DataTable
          data={types}
          columns={columns}
          config={tableConfig}
          loading={loading}
          onSelectionChange={handleSelectionChange}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />

        {/* Informations additionnelles */}
        {!loading && types.length === 0 && (
          <div className="empty-state text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
              Aucun type de compte
            </h3>
            <p className="text-amber-600/70 dark:text-amber-400/70">
              Commencez par ajouter votre premier type de compte.
            </p>
          </div>
        )}
      </PermissionGuard>
    </div>
  );
}