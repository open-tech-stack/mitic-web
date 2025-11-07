"use client";

import { useState } from "react";
import { Edit, Trash2, Badge, Eye, Phone, Car, Users, IdCard, User } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Abonne } from "@/types/abonne.types";

interface AbonneListProps {
  abonnes: Abonne[];
  onEditRequested: (abonne: Abonne) => void;
  onDelete: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function AbonneList({
  abonnes,
  onEditRequested,
  onDelete,
  canUpdate = false,
  canDelete = false
}: AbonneListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Configuration des colonnes pour DataTable
  const columns: Column[] = [
    {
      key: "index",
      label: "N°",
      sortable: false,
      render: (value, row, index) => (
        <span className="id-badge inline-flex items-center justify-center w-8 h-8 bg-green-100/50 dark:bg-green-900/30 rounded-full text-sm font-medium text-green-700 dark:text-green-300">
          {index + 1}
        </span>
      ),
    },
    {
      key: "nom_complet",
      label: "Nom & Prénom",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-green-900 dark:text-green-100">
            {row.nom} {row.prenom}
          </span>
        </div>
      ),
    },
    {
      key: "cnib",
      label: "CNIB",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <IdCard className="w-4 h-4 text-blue-600" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "nbreTel",
      label: "Téléphone",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-600" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "immatriculation",
      label: "Immatriculation",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-purple-600" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
  ];

  // Configuration des actions individuelles
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors text-green-600/70 dark:text-green-400/70",
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => onDelete(row.id),
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: (row) => canDelete
    },
  ];

  // Actions groupées pour la sélection multiple
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (selectedRows) => {
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} abonné(s) ?`)) {
          selectedRows.forEach((row: Abonne) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: (rows: Abonne[]) => canDelete && rows.length > 0
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: canDelete,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: bulkActions,
  };

  return (
    <div className="abonne-list-container-pro">
      <DataTable
        data={abonnes}
        columns={columns}
        config={tableConfig}
        onSelectionChange={setSelectedRows}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-green-200/30 dark:border-green-700/30"
      />
    </div>
  );
}