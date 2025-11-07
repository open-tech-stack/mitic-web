// @/components/dashboard/gestion-trajets/troncons/TronconLocaliteManagement.tsx
"use client";

import { useState } from "react";
import { LinkIcon, AlertCircle, Unlink } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { TronconLocaliteDisplay } from "@/types/troncon.types";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface TronconLocaliteManagementProps {
  associations: TronconLocaliteDisplay[];
  loading: boolean;
}

export default function TronconLocaliteManagement({
  associations,
  loading,
}: TronconLocaliteManagementProps) {
  const [selectedRows, setSelectedRows] = useState<TronconLocaliteDisplay[]>([]);

  // Configuration des colonnes (sans actions)
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
      key: "tronconLibelle",
      label: "Tronçon",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "localiteLibelle",
      label: "Localité Virtuelle",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        </div>
      ),
    },
  ];

  // Configuration du tableau 
  const tableConfig = {
    selectable: false, 
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: [],
    bulkActions: [],
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: TronconLocaliteDisplay[]) => {
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="troncon-localite-management-container">
      {/* Header sans boutons d'action */}
      <PermissionGuard permission="READ_TRONCON">
        <div className="management-header mb-6 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
              Associations Tronçon-Localité
            </h3>

            <div className="header-actions flex items-center gap-3">
              <div className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                Consultation seule
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Information sur le mode consultation */}
      <PermissionGuard permission="READ_TRONCON">
        <div className="info-banner mb-6 p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
          <div className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Mode consultation</p>
              <p className="text-sm">
                Les associations tronçon-localité sont gérées automatiquement par le système.
                Cette interface permet uniquement la consultation des associations existantes.
              </p>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Tableau des données */}
      <PermissionGuard permission="READ_TRONCON" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Unlink className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir les associations tronçon-localité</p>
        </div>
      }>
        <DataTable
          data={associations}
          columns={columns}
          config={tableConfig}
          loading={loading}
          onSelectionChange={handleSelectionChange}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
        />
      </PermissionGuard>

      {/* État vide - seulement si on peut lire */}
      <PermissionGuard permission="READ_TRONCON">
        {!loading && associations.length === 0 && (
          <div className="empty-state text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Unlink className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
              Aucune association trouvée
            </h3>
            <p className="text-amber-600/70 dark:text-amber-400/70">
              Aucune association tronçon-localité n'a été configurée dans le système.
            </p>
          </div>
        )}
      </PermissionGuard>
    </div>
  );
}