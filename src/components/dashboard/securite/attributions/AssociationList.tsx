// @/components/dashboard/securite/attributions/AssociationList.tsx
"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  Key,
  Shield,
  LinkIcon,
  Unlink,
  Search,
  Filter,
  AlertTriangle,
  Columns,
} from "lucide-react";
import DataTable, { Column, TableAction } from "@/components/ui/DataTable";
import { Association, Permission, Role } from "@/types/security.types";

interface AssociationListProps {
  roles: Role[];
  permissions: Permission[];
  associations: Association[];
  loading: boolean;
  onEditRequested: (roleId: number, permissionIds: number[]) => void;
  onDelete: (roleId: number, permissionId: number) => void;
  onDeleteMultiple: (associations: Association[]) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function AssociationList({
  roles,
  permissions,
  associations,
  loading,
  onEditRequested,
  onDelete,
  onDeleteMultiple,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: AssociationListProps) {
  const [selectedRows, setSelectedRows] = useState<Association[]>([]);
  const [roleFilter, setRoleFilter] = useState<number | null>(null);
  const [permissionFilter, setPermissionFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const associationsByRole: {
    [roleId: number]: { 
      permissionIds: number[]; 
      roleName: string;
      associations: Association[];
    };
  } = {};

  associations.forEach((assoc) => {
    if (!associationsByRole[assoc.roleId]) {
      associationsByRole[assoc.roleId] = {
        permissionIds: [],
        roleName: assoc.roleName || `Rôle #${assoc.roleId}`,
        associations: [],
      };
    }
    associationsByRole[assoc.roleId].permissionIds.push(assoc.permissionId);
    associationsByRole[assoc.roleId].associations.push(assoc);
  });

  // Filtrer les associations en fonction des filtres et de la recherche
  const filteredAssociationsByRole = Object.entries(associationsByRole)
    .filter(([roleId, data]) => {
      // Filtre par rôle
      if (roleFilter !== null && parseInt(roleId) !== roleFilter) {
        return false;
      }

      // Filtre par permission
      if (permissionFilter !== null) {
        const hasMatchingPermission =
          data.permissionIds.includes(permissionFilter);
        if (!hasMatchingPermission) {
          return false;
        }
      }

      // Filtre par recherche
      if (searchTerm) {
        const roleName = data.roleName.toLowerCase();
        const hasMatchingPermission = data.associations.some((assoc) => {
          const permissionName = assoc.permissionName?.toLowerCase() || '';
          return permissionName.includes(searchTerm.toLowerCase());
        });

        return (
          roleName.includes(searchTerm.toLowerCase()) || hasMatchingPermission
        );
      }

      return true;
    })
    .reduce((acc, [roleId, data]) => {
      acc[parseInt(roleId)] = data;
      return acc;
    }, {} as { [roleId: number]: { permissionIds: number[]; roleName: string; associations: Association[] } });

  // Configuration des colonnes pour le tableau groupé par rôle
  const columns: Column[] = [
    {
      key: "role",
      label: "Profil",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span className="font-medium text-amber-900 dark:text-amber-100">
            {row.roleName}
          </span>
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Services associées",
      sortable: false,
      render: (value, row) => (
        <div className="flex flex-wrap gap-2">
          {row.associations.map((assoc: any) => {
            const permissionName = assoc.permissionName || `Permission #${assoc.permissionId}`;

            return (
              <span
                key={assoc.permissionId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-lg border border-amber-200/50 dark:border-amber-700/50"
              >
                <Shield className="w-3 h-3" />
                {permissionName}
                {canDelete && (
                  <button
                    onClick={() => onDelete(row.roleId, assoc.permissionId)}
                    className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 ml-1 transition-colors"
                    title="Supprimer cette association"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      ),
    },
  ];

  // Préparer les données pour le tableau groupé
  const tableData = Object.entries(filteredAssociationsByRole).map(
    ([roleId, data]) => ({
      roleId: parseInt(roleId),
      roleName: data.roleName,
      permissionIds: data.permissionIds,
      associations: data.associations,
    })
  );

  // Actions individuelles - conditionnées par les permissions
  const actions: TableAction[] = [
    {
      icon: Edit,
      label: "Modifier les associations",
      onClick: (row) => onEditRequested(row.roleId, row.permissionIds),
      className:
        "p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300",
      condition: (row) => canUpdate
    },
    {
      icon: Trash2,
      label: "Supprimer toutes les associations",
      onClick: (row) => {
        const roleName = row.roleName;

        if (
          confirm(
            `Voulez-vous vraiment supprimer toutes les associations du rôle "${roleName}" ?`
          )
        ) {
          const assocsToDelete = row.associations.map((assoc: any) => ({
            roleId: row.roleId,
            permissionId: assoc.permissionId,
            roleName: assoc.roleName,
            permissionName: assoc.permissionName,
          }));
          onDeleteMultiple(assocsToDelete);
        }
      },
      className:
        "p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-red-600/70 dark:text-red-400/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (row) => canDelete
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: false,
    pagination: true,
    searchable: false,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: actions,
    bulkActions: [],
  };

  return (
    <div className="association-list-container-pro">
      {/* En-tête avec recherche et bouton filtre */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {/* Recherche à gauche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            <input
              type="text"
              placeholder="Rechercher par profil ou service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Bouton filtre à droite */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors border border-amber-200/30 dark:border-amber-700/30"
            >
              <Columns className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Filtres dépliables */}
        {showFilters && (
          <div className="filters-container p-4 bg-amber-50/30 dark:bg-amber-900/10 rounded-xl border border-amber-200/30 dark:border-amber-700/30 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtre par rôle */}
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
                <select
                  value={roleFilter === null ? "" : roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Tous les profils</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par permission */}
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
                <select
                  value={permissionFilter === null ? "" : permissionFilter}
                  onChange={(e) =>
                    setPermissionFilter(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Tous les services</option>
                  {permissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Statistiques de filtrage */}
            <div className="mt-4 flex items-center justify-between text-sm text-amber-600/70 dark:text-amber-400/70">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4" />
                <span>
                  {Object.keys(filteredAssociationsByRole).length} profil(s) sur{" "}
                  {Object.keys(associationsByRole).length}
                </span>
              </div>
              
              {(roleFilter !== null || permissionFilter !== null || searchTerm) && (
                <button
                  onClick={() => {
                    setRoleFilter(null);
                    setPermissionFilter(null);
                    setSearchTerm("");
                  }}
                  className="text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tableau des données */}
      <DataTable
        data={tableData}
        columns={columns}
        config={tableConfig}
        loading={loading}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
      />

      {/* État vide */}
      {!loading && tableData.length === 0 && (
        <div className="empty-state text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <LinkIcon className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
            {associations.length === 0
              ? "Aucune association trouvée"
              : "Aucun résultat"}
          </h3>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            {associations.length === 0
              ? canCreate 
                ? "Commencez par associer des services à des profils."
                : "Aucune association n'a été créée."
              : "Aucun profil ne correspond à vos critères de recherche."}
          </p>
        </div>
      )}
    </div>
  );
}