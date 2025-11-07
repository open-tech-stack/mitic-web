// @/components/dashboard/divers/pcg/pcgList.tsx
'use client'

import { useState } from 'react'
import { Edit, Trash2, Plus } from 'lucide-react'
import DataTable, { Column, TableAction, TableConfig } from '@/components/ui/DataTable'
import { Pcg } from '@/types/pcg.types'

interface ListPcgProps {
  data: Pcg[];
  loading?: boolean;
  onEdit: (compte: Pcg) => void;
  onDelete: (compte: Pcg) => void;
  onRefresh: () => void;
  onAddCompte: () => void;
  onImport: () => void;
  onSelectionChange?: (selectedComptes: Pcg[]) => void;
  onBulkDelete?: (comptes: Pcg[]) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ListPcg({
  data,
  onEdit,
  onDelete,
  onAddCompte,
  onSelectionChange,
  onBulkDelete,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: ListPcgProps) {
  const [selectedComptes, setSelectedComptes] = useState<Pcg[]>([]);

  // Fonction pour compter tous les descendants d'un compte
  const countAllDescendants = (compte: Pcg): number => {
    let count = 0;
    const countRecursive = (node: Pcg) => {
      if (node.sousComptes) {
        node.sousComptes.forEach(child => {
          count++;
          countRecursive(child);
        });
      }
    };
    countRecursive(compte);
    return count;
  };

  // Configuration des colonnes pour le tableau avec les 5 champs
  const pcgColumns: Column[] = [
    {
      key: 'numeroCompte',
      label: 'Numéro Compte',
      sortable: true,
      visible: true,
      width: '140px',
      render: (value, row) => (
        <div className="font-mono font-bold text-blue-900 dark:text-blue-100 text-base">
          {value}
          {!row.parent && (
            <span className="ml-2 text-blue-500 text-lg">★</span>
          )}
        </div>
      )
    },
    {
      key: 'libelle',
      label: 'Libellé',
      sortable: true,
      visible: true,
      render: (value, row) => (
        <div className="font-medium text-blue-900 dark:text-blue-100">
          {value}
          {!row.parent && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
              Racine
            </span>
          )}
        </div>
      )
    },
    {
      key: 'classe',
      label: 'Classe',
      sortable: true,
      visible: true,
      width: '120px',
      render: (value) => value || '—'
    },
    {
      key: 'parent',
      label: 'Compte Parent',
      sortable: true,
      visible: true,
      render: (value) => value || '—'
    },
    {
      key: 'path',
      label: 'Chemin',
      sortable: true,
      visible: true,
      render: (value) => value || '—'
    },
    {
      key: 'sousComptes',
      label: 'Sous-comptes',
      sortable: true,
      visible: true,
      align: 'center',
      render: (value, row) => {
        const directChildren = Array.isArray(value) ? value.length : 0;
        const totalDescendants = countAllDescendants(row);
        
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
              {directChildren}
            </span>
            {totalDescendants > directChildren && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{totalDescendants} total
              </span>
            )}
          </div>
        );
      }
    }
  ];

  // Actions pour chaque ligne - conditionnées par les permissions
  const rowActions: TableAction[] = [
    {
      icon: Edit,
      label: 'Modifier',
      onClick: (row) => onEdit(row),
      className: 'text-blue-600 hover:text-blue-700 dark:hover:text-blue-400',
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: 'Supprimer',
      onClick: (row) => onDelete(row),
      className: 'text-red-600 hover:text-red-700 dark:hover:text-red-400',
      condition: (row) => canDelete && (!row.sousComptes || row.sousComptes.length === 0)
    }
  ];

  // Actions groupées - conditionnées par les permissions
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: 'Supprimer la sélection',
      onClick: (rows) => onBulkDelete && onBulkDelete(rows),
      className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30',
      condition: (rows: Pcg[]) => 
        canDelete &&
        rows.every((row: Pcg) => !row.sousComptes || row.sousComptes.length === 0)
    }
  ];

  // Configuration du tableau
  const tableConfig: TableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: rowActions,
    bulkActions: bulkActions
  };

  // Gestion de la sélection
  const handleSelectionChange = (selectedRows: any[]) => {
    setSelectedComptes(selectedRows);
    onSelectionChange && onSelectionChange(selectedRows);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-200/30 dark:border-blue-700/30">
      <div className="p-6 border-b border-blue-200/30 dark:border-blue-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Liste du Plan Comptable Général
            </h2>
            <p className="text-blue-600/70 dark:text-blue-400/70 mt-1">
              {data.length} compte(s) au total
              {selectedComptes.length > 0 && ` • ${selectedComptes.length} sélectionné(s)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <button
                onClick={onAddCompte}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau compte</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        columns={pcgColumns}
        config={tableConfig}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}