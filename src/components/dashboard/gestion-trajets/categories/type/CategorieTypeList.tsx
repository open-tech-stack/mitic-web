// @/components/dashboard/gestion-trajets/categories/type/CategorieTypeList.tsx
"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Filter, Search, Edit, Trash2 } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface CategorieTypeListProps {
  types: any[];
  onEditRequested: (type: any) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function CategorieTypeList({ 
  types,
  onEditRequested,
  onDelete,
  loading = false,
  canUpdate = false,
  canDelete = false,
}: CategorieTypeListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTypes = types.filter(type => {
    if (!type || !type.libelle) {
      return false;
    }
    
    const libelleMatch = type.libelle.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = type.id ? type.id.toString().includes(searchTerm) : false;
    
    return libelleMatch || idMatch;
  });

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
        <span className="font-medium text-amber-900 dark:text-amber-100">
          {row.libelle || 'Sans libellé'}
        </span>
      ),
    },
  ];

  // Actions conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300",
      condition: () => canUpdate,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        if (confirm(`Voulez-vous vraiment supprimer le type "${row.libelle}" ?`)) {
          onDelete(row.id);
        }
      },
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-300",
      condition: () => canDelete,
    },
  ];

  const tableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: false, // on utilise notre propre recherche
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: [],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-3 text-amber-600">Chargement des types...</span>
      </div>
    );
  }

  if (types.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
          Aucun type de catégorie
        </h3>
        <p className="text-amber-600/70 dark:text-amber-400/70">
          Aucun type de catégorie n'est disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="type-list-container-pro">
      {/* Barre de recherche */}
      <PermissionGuard permission="READ_CATEGORY_TYPE">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            <input
              type="text"
              placeholder="Rechercher un type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 dark:text-amber-100 placeholder-amber-600/70 dark:placeholder-amber-400/70"
            />
          </div>
        </div>
      </PermissionGuard>

      {filteredTypes.length === 0 ? (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30">
          <Filter className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Aucun résultat trouvé pour "{searchTerm}"
          </p>
        </div>
      ) : (
        <DataTable
          data={filteredTypes}
          columns={columns}
          config={tableConfig}
          onSelectionChange={setSelectedRows}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />
      )}

      {/* Info sur les résultats */}
      <PermissionGuard permission="READ_CATEGORY_TYPE">
        <div className="mt-4 text-sm text-amber-600/70 dark:text-amber-400/70">
          {filteredTypes.length} type(s) trouvé(s)
          {searchTerm && ` pour "${searchTerm}"`}
        </div>
      </PermissionGuard>
    </div>
  );
}