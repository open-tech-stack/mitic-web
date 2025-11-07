// @/components/dashboard/operations/schema-comptable/ListEcritures.tsx
"use client";

import { useState, useMemo } from "react";
import { Edit, Trash2, Search, X, Plus } from "lucide-react";
import { CompteType } from "@/types/typeCompte.types";
import { ModeReglement } from "@/types/modeReglement.types";
import { SchemaComptable } from "@/types/schemaComptable.types";
import { TypeOperation } from "@/types/typeOperation.types";
import { TypeMontant } from "@/types/typeMontant.types";
import DataTable, { Column, TableConfig } from "@/components/ui/DataTable";
import { SchemaComptableService } from "@/services/operations/schemaComptables/schemaComptables.service";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

interface ListEcrituresProps {
  schemas: SchemaComptable[];
  typesOperation: TypeOperation[];
  modesReglement: ModeReglement[];
  typesCompte: CompteType[];
  typesMontant: TypeMontant[];
  onSchemaEdit: (schema: SchemaComptable) => void;
  onOpenCreateModal: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ListEcritures({
  schemas,
  typesOperation,
  modesReglement,
  typesCompte,
  typesMontant,
  onSchemaEdit,
  onOpenCreateModal,
  canUpdate = false,
  canDelete = false,
}: ListEcrituresProps) {
  const [selectedTypeOp, setSelectedTypeOp] = useState<number>(0);
  const [selectedModeReglement, setSelectedModeReglement] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const schemaComptableService = SchemaComptableService.getInstance();

  // Méthodes utilitaires
  const getTypeOperationLibelle = (id: number): string => {
    return typesOperation.find((t) => t.id === id)?.libelle || "Inconnu";
  };

  const getModeReglementLibelle = (id: number): string => {
    return modesReglement.find((m) => m.id === id)?.libelle || "Inconnu";
  };

  const getTypeCompteLibelle = (id: number): string => {
    return typesCompte.find((t) => t.id === id)?.libelle || "Inconnu";
  };

  const getTypeMontantLibelle = (id: number): string => {
    return typesMontant.find((t) => t.id === id)?.libelle || "Inconnu";
  };

  const getSensLibelle = (sens: string): string => {
    return sens === "DEBIT" ? "Débit" : "Crédit";
  };

  const getDetenteurLibelle = (typeDetenteur: boolean): string => {
    return typeDetenteur ? "UO" : "User";
  };

  // Préparation des données pour le DataTable
  const tableData = useMemo(() => {
    return schemas.flatMap((schema) =>
      schema.ecritures.map((ecriture, ecritureIndex) => ({
        id: `${schema.id}-${ecriture.id || ecritureIndex}`,
        schemaId: schema.id,
        typeOperation: getTypeOperationLibelle(schema.id_tyOp),
        modeReglement: getModeReglementLibelle(schema.id_reglement),
        typeCompte: getTypeCompteLibelle(ecriture.id_typeCompte),
        typeMontant: getTypeMontantLibelle(ecriture.id_typeMontant),
        sens: ecriture.sens,
        detenteur: ecriture.type_detenteur,
        schema: schema,
        isFirstRow: ecritureIndex === 0,
        rowSpan: ecritureIndex === 0 ? schema.ecritures.length : 0,
      }))
    );
  }, [schemas, typesOperation, modesReglement, typesCompte, typesMontant]);

  // Filtrage des données
  const filteredData = useMemo(() => {
    let filtered = tableData;

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.typeOperation.toLowerCase().includes(term) ||
          item.modeReglement.toLowerCase().includes(term) ||
          item.typeCompte.toLowerCase().includes(term) ||
          item.typeMontant.toLowerCase().includes(term)
      );
    }

    // Filtrage par type d'opération
    if (selectedTypeOp > 0) {
      const typeOpLibelle = getTypeOperationLibelle(selectedTypeOp);
      filtered = filtered.filter(
        (item) => item.typeOperation === typeOpLibelle
      );
    }

    // Filtrage par mode de règlement
    if (selectedModeReglement > 0) {
      const modeReglementLibelle = getModeReglementLibelle(
        selectedModeReglement
      );
      filtered = filtered.filter(
        (item) => item.modeReglement === modeReglementLibelle
      );
    }

    return filtered;
  }, [tableData, searchTerm, selectedTypeOp, selectedModeReglement]);

  // Gestion de la recherche
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Gestion de la sélection du type d'opération
  const handleTypeOperationChange = (typeOpId: number) => {
    setSelectedTypeOp(typeOpId);
  };

  // Gestion de la sélection du mode de règlement
  const handleModeReglementChange = (modeReglementId: number) => {
    setSelectedModeReglement(modeReglementId);
  };

  // Réinitialise les filtres
  const resetFilters = () => {
    setSelectedTypeOp(0);
    setSelectedModeReglement(0);
    setSearchTerm("");
  };

  // Actions sur les schémas
  const handleEditSchema = (schema: SchemaComptable) => {
    onSchemaEdit(schema);
  };

  const handleDeleteSchema = async (schema: SchemaComptable) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer le schéma comptable pour "${getTypeOperationLibelle(
      schema.id_tyOp
    )}" - "${getModeReglementLibelle(
      schema.id_reglement
    )}" ?\n\nCette action supprimera également toutes les écritures associées (${
      schema.ecritures.length
    } écriture(s)).`;

    if (confirm(confirmMessage)) {
      try {
        if (schema.id) {
          await schemaComptableService.delete(schema.id);
          // Le service met à jour automatiquement l'état,
          // ce qui déclenchera un re-render des composants parents
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const hasActiveFilters =
    selectedTypeOp > 0 || selectedModeReglement > 0 || searchTerm !== "";

  // Configuration des colonnes pour le DataTable
  const columns: Column[] = [
    {
      key: "typeOperation",
      label: "Type d'Opération",
      sortable: true,
      render: (value, row) =>
        row.isFirstRow ? (
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        ) : null,
    },
    {
      key: "modeReglement",
      label: "Mode de Règlement",
      sortable: true,
      render: (value, row) =>
        row.isFirstRow ? (
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {value}
          </span>
        ) : null,
    },
    {
      key: "typeCompte",
      label: "Type de Compte",
      sortable: true,
      render: (value) => (
        <span className="text-amber-900 dark:text-amber-100">{value}</span>
      ),
    },
    {
      key: "typeMontant",
      label: "Type de Montant",
      sortable: true,
      render: (value) => (
        <span className="text-amber-900 dark:text-amber-100">{value}</span>
      ),
    },
    {
      key: "sens",
      label: "Sens",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            value === "DEBIT"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          {getSensLibelle(value)}
        </span>
      ),
    },
    {
      key: "detenteur",
      label: "Détenteur",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
          }`}
        >
          {getDetenteurLibelle(value)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) =>
        row.isFirstRow ? (
          <div className="flex gap-2">
            <PermissionButton
              type="button"
              permission="UPDATE_SCHEMA_COMPTABLE"
              className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              onClick={() => handleEditSchema(row.schema)}
              title="Modifier ce schéma"
            >
              <Edit className="w-3 h-3" />
              Modifier
            </PermissionButton>
            <PermissionButton
              type="button"
              permission="DELETE_SCHEMA_COMPTABLE"
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => handleDeleteSchema(row.schema)}
              title="Supprimer ce schéma"
            >
              <Trash2 className="w-3 h-3" />
              Supprimer
            </PermissionButton>
          </div>
        ) : null,
    },
  ];

  // Configuration du DataTable
  const tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    searchable: false, // Nous gérons la recherche nous-mêmes
    pageSize: 10,
    pageSizes: [5, 10, 20, 50, 100],
  };

  return (
    <div className="schemas-management-container bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-amber-200/30 dark:border-amber-700/30">
      {/* En-tête avec bouton d'ajout */}
      <div className="management-header mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
              Schémas Comptables
            </h3>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
              Gérez vos schémas comptables et leurs écritures associées
            </p>
          </div>
          <PermissionButton
            type="button"
            permission="CREATE_SCHEMA_COMPTABLE"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            onClick={onOpenCreateModal}
          >
            <Plus className="w-4 h-4" />
            Ajouter un schéma comptable
          </PermissionButton>
        </div>
      </div>

      {/* Section de recherche et filtres */}
      <PermissionGuard permission="READ_SCHEMA_COMPTABLE">
        <div className="search-filter-section mb-6">
          <div className="search-bar mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              <input
                type="text"
                placeholder="Rechercher un schéma comptable..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300"
                  onClick={() => handleSearchChange("")}
                  title="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="filters-row grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="filter-group">
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Type d'Opération
              </label>
              <select
                value={selectedTypeOp}
                onChange={(e) =>
                  handleTypeOperationChange(Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value={0}>Tous les types d'opération</option>
                {typesOperation.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Mode de Règlement
              </label>
              <select
                value={selectedModeReglement}
                onChange={(e) =>
                  handleModeReglementChange(Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value={0}>Tous les modes de règlement</option>
                {modesReglement.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-actions flex items-end">
              <button
                type="button"
                className="w-full px-3 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>
      </PermissionGuard>

      {/* Utilisation du DataTable */}
      <PermissionGuard permission="READ_SCHEMA_COMPTABLE" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <div className="text-6xl mb-4">📊</div>
          <p>Vous n'avez pas la permission de voir la liste des schémas comptables</p>
        </div>
      }>
        <DataTable
          data={filteredData}
          columns={columns}
          config={tableConfig}
          loading={false}
          className="border-0"
        />

        {/* État vide */}
        {filteredData.length === 0 && (
          <div className="empty-state text-center py-12">
            <div className="empty-icon text-6xl text-amber-400 dark:text-amber-600 mb-4">
              📊
            </div>
            <div className="empty-text">
              <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                {hasActiveFilters
                  ? "Aucun résultat trouvé"
                  : "Aucun schéma comptable"}
              </h4>
              <p className="text-amber-600/70 dark:text-amber-400/70 mb-4">
                {hasActiveFilters
                  ? "Aucun schéma comptable ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou votre recherche."
                  : "Aucun schéma comptable n'a encore été créé. Cliquez sur 'Ajouter un schéma comptable' pour en créer un."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                  onClick={resetFilters}
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        )}
      </PermissionGuard>
    </div>
  );
}