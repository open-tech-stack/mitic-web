"use client";

import { useState } from "react";
import { Edit, Trash2, Badge, Eye, Phone, Mail, MapPin, User, UserCheck, IdCard, Lock } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Client } from "@/types/client.types";

interface ClientListProps {
  clients: Client[];
  onEditRequested: (client: Client) => void;
  onDelete: (id: number) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ClientList({
  clients,
  onEditRequested,
  onDelete,
  canUpdate = false,
  canDelete = false
}: ClientListProps) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Configuration des colonnes pour DataTable
  const columns: Column[] = [
    {
      key: "index",
      label: "N°",
      sortable: false,
      render: (value, row, index) => (
        <span className="id-badge inline-flex items-center justify-center w-8 h-8 bg-blue-100/50 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
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
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            {row.nom} {row.prenom}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full w-fit mt-1 ${row.abonne
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
            }`}>
            {row.abonne ? 'Abonné' : 'Ordinaire'}
          </span>
        </div>
      ),
    },
    {
      key: "localite",
      label: "Localité",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "numeroTelephone",
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
      key: "numeroCNIB",
      label: "CNIB",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <IdCard className="w-4 h-4 text-purple-600" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-600" />
          <span className="text-sm truncate max-w-[150px]">{value || 'Non renseigné'}</span>
        </div>
      ),
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "password",
      label: "Mot de passe",
      sortable: false,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {value}
          </span>
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
      className: "p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors text-blue-600/70 dark:text-blue-400/70",
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
        if (confirm(`Voulez-vous vraiment supprimer ${selectedRows.length} client(s) ?`)) {
          selectedRows.forEach((row: Client) => onDelete(row.id));
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-3 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors",
      condition: (rows: Client[]) => canDelete && rows.length > 0
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
    <div className="client-list-container-pro">
      <DataTable
        data={clients}
        columns={columns}
        config={tableConfig}
        onSelectionChange={setSelectedRows}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-200/30 dark:border-blue-700/30"
      />
    </div>
  );
}