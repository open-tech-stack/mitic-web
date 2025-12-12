// @/components/dashboard/gestion-trajets/localites/listLocalite.tsx 
"use client";

import { useState } from "react";
import { MapPin, Cloud, Navigation, Edit, Trash2, Building } from "lucide-react";
import DataTable, {
  Column,
  TableAction,
  TableConfig,
} from "@/components/ui/DataTable";

// Types
export interface LocaliteData {
  id?: number;
  codeLoc: string;
  libLoc: string;
  virtuel: boolean;
  codeUo?: string;  // Ajout du code UO
  libelleUo?: string; // Ajout du libellé UO
  tronconId?: number;
  libelleTroncon?: string;
  libelleTroncons?: string[];
}

interface ListLocaliteProps {
  localites: LocaliteData[];
  loading?: boolean;
  onEdit: (localite: LocaliteData) => void;
  onDelete: (localiteId: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ListLocalite({
  localites,
  loading = false,
  onEdit,
  onDelete,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: ListLocaliteProps) {
  const [selectedLocalites, setSelectedLocalites] = useState<LocaliteData[]>(
    []
  );

  // Configuration des colonnes pour le DataTable
  const columns: Column[] = [
    {
      key: "codeLoc",
      label: "Code",
      sortable: true,
      width: "100px",
      align: "center",
      render: (value) => (
        <span className="inline-flex items-center justify-center w-12 h-8 bg-amber-100/50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-lg font-mono font-semibold">
          {value}
        </span>
      ),
    },
    {
      key: "libLoc",
      label: "Libellé",
      sortable: true,
      render: (value) => (
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "libelleUo",
      label: "UO",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <Building className="w-4 h-4 mr-2 text-blue-600/70 dark:text-blue-400/70" />
          <div className="min-w-0">
            <span className="font-medium text-blue-900 dark:text-blue-100 truncate block">
              {value || row.codeUo || "Non spécifiée"}
            </span>
            {row.codeUo && (
              <span className="text-xs text-blue-600/70 dark:text-blue-400/70">
                Code: {row.codeUo}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "virtuel",
      label: "Type",
      sortable: true,
      align: "center",
      render: (value, row) => (
        <div className="flex flex-col items-center space-y-2">
          {value ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              <Cloud className="w-3 h-3 mr-1" />
              Virtuelle
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Navigation className="w-3 h-3 mr-1" />
              Réelle
            </span>
          )}
          {/* Affichage des tronçons pour les localités virtuelles */}
          {row.virtuel &&
            row.libelleTroncons &&
            row.libelleTroncons.length > 0 && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div className="font-medium mb-1">Tronçons associés:</div>
                  <div className="flex flex-wrap gap-1">
                    {row.libelleTroncons.map((libelle: any, index: any) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-800/50 border border-blue-200 dark:border-blue-600"
                      >
                        {libelle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      ),
    },
  ];

  // Actions pour chaque ligne - conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEdit(row),
      className:
        "text-amber-600/70 hover:text-amber-700 dark:hover:text-amber-300",
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        if (
          window.confirm(
            `Êtes-vous sûr de vouloir supprimer la localité "${row.libLoc}" ?`
          )
        ) {
          onDelete(row.id);
        }
      },
      className: "text-red-600/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (row) => canDelete
    },
  ];

  // Actions groupées - conditionnées par les permissions
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (rows) => {
        if (
          window.confirm(
            `Êtes-vous sûr de vouloir supprimer ${rows.length} localité(s) ?`
          )
        ) {
          rows.forEach((row: LocaliteData) => {
            if (row.id !== undefined) {
              onDelete(row.id.toString());
            }
          });
        }
      },
      className: "text-red-600/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (rows: LocaliteData[]) => canDelete && rows.length > 0
    },
  ];

  // Configuration du tableau
  const config: TableConfig = {
    selectable: canDelete, // seulement si on peut supprimer
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions,
    bulkActions,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30">
      <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Liste des localités
            </h2>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
              {localites.length} localité(s) au total
              {selectedLocalites.length > 0 &&
                ` • ${selectedLocalites.length} sélectionné(s)`}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        data={localites}
        columns={columns}
        config={config}
        loading={loading}
        onSelectionChange={setSelectedLocalites}
      />
    </div>
  );
}