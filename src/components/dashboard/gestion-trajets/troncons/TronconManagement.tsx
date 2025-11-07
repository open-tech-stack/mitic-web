// @/components/dashboard/gestion-trajets/troncons/TronconManagement.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Route, AlertCircle } from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import TronconFormDialog from "./TronconFormDialog";
import { Peage } from "@/types/peage.types";
import { Troncon } from "@/types/troncon.types";
import { PermissionButton } from "@/components/ui/PermissionButton";

interface TronconManagementProps {
  troncons: Troncon[];
  peages: Peage[];
  loading: boolean;
  onTronconCreate: (data: Omit<Troncon, "id" | "codLoc">) => void;
  onTronconUpdate: (id: number, data: Partial<Troncon>) => void;
  onTronconDelete: (id: number) => void;
  onTronconDeleteMultiple: (ids: number[]) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

interface EnrichedTroncon extends Troncon {
  libelleTroncon: string;
  peageGaucheLib?: string;
  peageDroitLib?: string;
  peageGaucheCode?: string;
  peageDroitCode?: string;
  canEdit: boolean;
  canDelete: boolean;
}

export default function TronconManagement({
  troncons,
  peages,
  loading,
  onTronconCreate,
  onTronconUpdate,
  onTronconDelete,
  onTronconDeleteMultiple,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: TronconManagementProps) {
  const [selectedRows, setSelectedRows] = useState<EnrichedTroncon[]>([]);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingTroncon, setEditingTroncon] = useState<EnrichedTroncon | null>(null);

  // Enrichir les données pour l'affichage
  const enrichedTroncons: EnrichedTroncon[] = troncons.map(troncon => {
    const peageGauche = peages.find(p => p.id === troncon.peagesGauche);
    const peageDroit = peages.find(p => p.id === troncon.peagesDroit);
    
    return {
      ...troncon,
      libelleTroncon: `${peageGauche?.libPeage || `Péage #${troncon.peagesGauche}`} - ${peageDroit?.libPeage || `Péage #${troncon.peagesDroit}`}`,
      peageGaucheLib: peageGauche?.libPeage,
      peageDroitLib: peageDroit?.libPeage,
      peageGaucheCode: peageGauche?.codPeage,
      peageDroitCode: peageDroit?.codPeage,
      canEdit: canUpdate, // Utiliser la permission pour déterminer si éditable
      canDelete: canDelete, // Utiliser la permission pour déterminer si supprimable
    };
  });

  // Configuration des colonnes
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
      key: "libelleTroncon",
      label: "Libellé du Tronçon",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
          {!row.canEdit && (
            <span title="Lié à une localité virtuelle">
              <Route className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: "peagesGauche",
      label: "Péage Gauche",
      sortable: true,
      render: (value, row) => (
        <div className="peage-info">
          <span className="text-amber-900 dark:text-amber-100">
            {row.peageGaucheLib || `Péage #${value}`}
          </span>
          {row.peageGaucheCode && (
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70 ml-2">
              {row.peageGaucheCode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "peagesDroit",
      label: "Péage Droit",
      sortable: true,
      render: (value, row) => (
        <div className="peage-info">
          <span className="text-amber-900 dark:text-amber-100">
            {row.peageDroitLib || `Péage #${value}`}
          </span>
          {row.peageDroitCode && (
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70 ml-2">
              {row.peageDroitCode}
            </span>
          )}
        </div>
      ),
    },
  ];

  // Actions individuelles
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier",
      onClick: (row) => {
        if (!row.canEdit) {
          alert("Ce tronçon ne peut pas être modifié car il est lié à une localité virtuelle.");
          return;
        }
        setEditingTroncon(row);
        setShowFormDialog(true);
      },
      className: "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300",
      condition: (row) => row.canEdit,
    },
    {
      icon: Trash2,
      label: "Supprimer",
      onClick: (row) => {
        if (!row.canDelete) {
          alert("Ce tronçon ne peut pas être supprimé car il est lié à une localité virtuelle.");
          return;
        }
        if (confirm(`Voulez-vous vraiment supprimer le tronçon "${row.libelleTroncon}" ?`)) {
          onTronconDelete(row.id);
        }
      },
      className: "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (row) => row.canDelete,
    },
  ];

  // Actions groupées
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: `Supprimer (${selectedRows.length})`,
      onClick: (selectedRows: EnrichedTroncon[]) => {
        const deletableRows = selectedRows.filter(row => row.canDelete);
        if (deletableRows.length === 0) {
          alert("Aucun tronçon sélectionné ne peut être supprimé.");
          return;
        }
        
        const count = deletableRows.length;
        const message = count === 1 
          ? `Voulez-vous vraiment supprimer le tronçon "${deletableRows[0].libelleTroncon}" ?`
          : `Voulez-vous vraiment supprimer les ${count} tronçons sélectionnés ?`;
        
        if (confirm(message)) {
          const ids = deletableRows.map(row => row.id);
          onTronconDeleteMultiple(ids);
          setSelectedRows([]);
        }
      },
      className: "flex items-center gap-2 px-4 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors font-medium",
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
    bulkActions: bulkActions,
  };

  // Handler pour les changements de sélection
  const handleSelectionChange = (newSelectedRows: EnrichedTroncon[]) => {
    setSelectedRows(newSelectedRows);
  };

  const handleFormSubmit = (data: Omit<Troncon, "id" | "codLoc">) => {
    if (editingTroncon) {
      onTronconUpdate(editingTroncon.id, data);
    } else {
      onTronconCreate(data);
    }
    setShowFormDialog(false);
    setEditingTroncon(null);
  };

  const handleFormCancel = () => {
    setShowFormDialog(false);
    setEditingTroncon(null);
  };

  return (
    <div className="troncon-management-container">
      {/* Header avec actions */}
      <div className="management-header mb-6 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
            Gestion des Tronçons
          </h3>
          
          <div className="header-actions flex items-center gap-3">
            {selectedRows.length > 0 && canDelete && (
              <button
                onClick={() => bulkActions[0].onClick(selectedRows)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200/70 dark:hover:bg-red-800/40 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer ({selectedRows.length})
              </button>
            )}
            
            <PermissionButton
              onClick={() => setShowFormDialog(true)}
              permission="CREATE_TRONCON"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter un tronçon
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Informations sur la sélection */}
      {selectedRows.length > 0 && (
        <div className="selection-info mb-4 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">
              {selectedRows.length} tronçon{selectedRows.length > 1 ? 's' : ''} sélectionné{selectedRows.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Tableau des données */}
      <DataTable
        data={enrichedTroncons}
        columns={columns}
        config={tableConfig}
        loading={loading}
        onSelectionChange={handleSelectionChange}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
      />

      {/* État vide */}
      {!loading && enrichedTroncons.length === 0 && (
        <div className="empty-state text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Route className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
            Aucun tronçon trouvé
          </h3>
          <p className="text-amber-600/70 dark:text-amber-400/70 mb-4">
            Commencez par ajouter votre premier tronçon.
          </p>
          <PermissionButton
            onClick={() => setShowFormDialog(true)}
            permission="CREATE_TRONCON"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            Créer le premier tronçon
          </PermissionButton>
        </div>
      )}

      {/* Modal de formulaire */}
      {showFormDialog && (
        <TronconFormDialog
          open={showFormDialog}
          troncon={editingTroncon}
          peages={peages}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}