"use client";

import { useState } from "react";
import { Edit, Trash2, Badge, Eye, Calendar, DollarSign, User, CheckCircle, XCircle, Clock, MapPin } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Abonnement } from "@/types/abonnement.types";

interface AbonnementListProps {
  abonnements: Abonnement[];
  onEditRequested: (abonnement: Abonnement) => void;
  onDelete: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function AbonnementList({
  abonnements,
  onEditRequested,
  onDelete,
  canUpdate = false,
  canDelete = false
}: AbonnementListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Configuration des colonnes pour DataTable
  const columns: Column[] = [
    {
      key: "index",
      label: "N°",
      sortable: false,
      render: (value, row, index) => (
        <span className="id-badge inline-flex items-center justify-center w-8 h-8 bg-purple-100/50 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300">
          {index + 1}
        </span>
      ),
    },
    {
      key: "abonne",
      label: "Abonné",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
            <User className="w-4 h-4" />
            {row.nomAbonne} {row.prenomAbonne}
          </span>
          <div className="flex flex-col text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
            <span>🚗 {row.abonneImmatriculation}</span>
          </div>
        </div>
      ),
    },
    {
      key: "periode",
      label: "Période",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="font-medium">{new Date(row.dateDebut).toLocaleDateString('fr-FR')}</span>
          </div>
          {row.dateFin && (
            <span className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
              Fin: {new Date(row.dateFin).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "peage",
      label: "Péage",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {row.peageLabel}
          </span>
        </div>
      ),
    },
    {
      key: "categorie",
      label: "Catégorie",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-purple-900 dark:text-purple-100">
            {row.typeCategories}
          </span>
        </div>
      ),
    },
    {
      key: "immatriculation",
      label: "Immatriculation",
      sortable: true,
      render: (value, row) => (
        <span className="font-mono text-sm bg-purple-100/50 dark:bg-purple-900/30 px-2 py-1 rounded">
          {row.abonneImmatriculation}
        </span>
      ),
    },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2 font-semibold">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-green-700 dark:text-green-300">
            {row.montant?.toLocaleString('fr-FR')} F
          </span>
        </div>
      ),
    },
    {
      key: "actif",
      label: "Actif",
      sortable: true,
      render: (value, row) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${row.actif
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
          {row.actif ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {row.actif ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ];

  // Configuration des actions individuelles
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => onEditRequested(row),
      className: "p-2 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors text-purple-600/70 dark:text-purple-400/70",
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
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} abonnement(s) ?`)) {
          selectedRows.forEach((row: Abonnement) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: (rows: Abonnement[]) => canDelete && rows.length > 0
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
    <div className="abonnement-list-container-pro">
      <DataTable
        data={abonnements}
        columns={columns}
        config={tableConfig}
        onSelectionChange={setSelectedRows}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-200/30 dark:border-purple-700/30"
      />
    </div>
  );
}