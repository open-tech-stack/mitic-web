// @/components/dashboard/agents/agentList.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { AgentCaisse } from "@/types/agent.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface AgentListProps {
  agents: AgentCaisse[];
  loading: boolean;
  onEdit?: (agent: AgentCaisse) => void;
  onDelete?: (id: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function AgentList({ 
  agents, 
  loading,
  onEdit,
  onDelete,
  canUpdate = false,
  canDelete = false,
}: AgentListProps) {
  const [selectedRows, setSelectedRows] = useState<AgentCaisse[]>([]);

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
      key: "username",
      label: "Nom d'utilisateur",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "nom",
      label: "Nom",
      sortable: true,
    },
    {
      key: "prenom",
      label: "Prénom",
      sortable: true,
    },
    {
      key: "nbreVente",
      label: "Nbre Ventes",
      sortable: true,
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "montantVente",
      label: "Montant Ventes",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-600">
          {value?.toLocaleString()} FCFA
        </span>
      ),
    },
  ];

  // Actions conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => {
        onEdit?.(row as AgentCaisse);
      },
      className: "p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors text-blue-600/70 dark:text-blue-400/70",
      condition: () => canUpdate,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        onDelete?.(row.id);
      },
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70",
      condition: () => canDelete,
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
    bulkActions: [],
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: any[]) => {
    setSelectedRows(newSelectedRows as AgentCaisse[]);
  };

  return (
    <div className="agent-list-container-pro">
      <PermissionGuard permission="READ_AGENT_CAISSE" fallback={
        <div className="text-center py-12 text-blue-600/70 dark:text-blue-400/70">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des agents caissiers</p>
        </div>
      }>
        {/* Informations sur la sélection */}
        {selectedRows.length > 0 && (
          <div className="selection-info mb-4 p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {selectedRows.length} agent{selectedRows.length > 1 ? 's' : ''} sélectionné{selectedRows.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Tableau des données */}
        <DataTable
          data={agents}
          columns={columns}
          config={tableConfig}
          loading={loading}
          onSelectionChange={handleSelectionChange}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-200/30 dark:border-blue-700/30"
        />

        {/* Informations additionnelles */}
        {!loading && agents.length === 0 && (
          <div className="empty-state text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-blue-600/70 dark:text-blue-400/70" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
              Aucun agent caissier
            </h3>
            <p className="text-blue-600/70 dark:text-blue-400/70">
              Commencez par ajouter votre premier agent caissier.
            </p>
          </div>
        )}
      </PermissionGuard>
    </div>
  );
}