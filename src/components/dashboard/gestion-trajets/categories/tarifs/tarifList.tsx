// @/components/dashboard/gestion-trajets/categories/tarifs/tarifList.tsx
"use client";

import { Car, DollarSign, Edit, Eye, List, Trash2 } from "lucide-react";
import DataTable, {
  Column,
  TableAction,
  TableConfig,
} from "@/components/ui/DataTable";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

// Types
interface CategorieType {
  id: number;
  libelle: string;
}

interface Categorie {
  id: number;
  typeCategorie: number;
  nbreEssieux: number;
  montant: number;
}

interface CategorieListProps {
  categories: Categorie[];
  types: CategorieType[];
  loading: boolean;
  onEdit: (categorie: Categorie) => void;
  onDelete: (id: number) => void;
  onBulkDelete: (categories: Categorie[]) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

// Utilitaires de validation
class CategorieValidator {
  static isPoidsLourd(typeLibelle: string): boolean {
    return (
      typeLibelle.toLowerCase().includes("poids lourd") ||
      typeLibelle.toLowerCase().includes("camion") ||
      typeLibelle.toLowerCase().includes("articulé")
    );
  }
}

export default function CategorieList({
  categories,
  types,
  loading,
  onEdit,
  onDelete,
  onBulkDelete,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: CategorieListProps) {
  const getTypeName = (typeId: number): string => {
    const type = types.find((t) => t.id === typeId);
    return type?.libelle || "Inconnu";
  };

  const isPoidsLourd = (typeId: number): boolean => {
    const type = types.find((t) => t.id === typeId);
    return type ? CategorieValidator.isPoidsLourd(type.libelle) : false;
  };

  const formatMontant = (montant: number): string => {
    return `${montant.toLocaleString()} FCFA`;
  };

  // Configuration du tableau
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
      key: "typeCategorie",
      label: "Type",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-amber-900 dark:text-amber-100">
          {getTypeName(value)}
        </span>
      ),
    },
    {
      key: "nbreEssieux",
      label: "Essieux",
      sortable: true,
      align: "center",
      render: (value, row) => (
        <div className="flex items-center justify-center">
          {isPoidsLourd(row.typeCategorie) ? (
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-900 dark:text-amber-100">
                {value}
              </span>
              <span className="text-xs text-amber-600/70 dark:text-amber-400/70">
                essieu{value > 1 ? "x" : ""}
              </span>
            </div>
          ) : (
            <span className="text-amber-600/70 dark:text-amber-400/70">-</span>
          )}
        </div>
      ),
    },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      align: "right",
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {formatMontant(value)}
          </span>
        </div>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEdit(row),
      className:
        "text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30",
      condition: () => canUpdate,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row.id),
      className:
        "text-red-600/70 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30",
      condition: () => canDelete,
    },
  ];

  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (rows) => onBulkDelete(rows),
      className:
        "bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200/50 dark:hover:bg-red-800/30",
      condition: () => canDelete,
    },
  ];

  const tableConfig: TableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 5,
    pageSizes: [5, 10, 25, 50],
    actions,
    bulkActions,
  };

  return (
    <div className="mb-8">
      <PermissionGuard permission="READ_CATEGORIE">
        <div className="flex items-center gap-3 mb-6">
          <List className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
            Liste des Catégories
          </h2>
        </div>

        <DataTable
          data={categories}
          columns={columns}
          config={tableConfig}
          loading={loading}
        />
      </PermissionGuard>
    </div>
  );
}
