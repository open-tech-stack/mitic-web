// @/components/dashboard/divers/users/listUser.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShieldUser,
  Trash2,
  Edit,
  Eye,
  Lock,
  LockOpen,
  Building2,
  Key,
  RefreshCw,
  UserPlus,
  MapPin,
  Ticket,
  ArrowRightLeft,
} from "lucide-react";
import DataTable, {
  Column,
  TableAction,
  TableConfig,
} from "@/components/ui/DataTable";
import { User } from "@/types/user.types";
import { OrganizationalUnit } from "@/types/uo.types";
import { Role } from "@/types/security.types";
import { Localite } from "@/types/localite.types";
import { Peage } from "@/types/peage.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface ListUserProps {
  users: User[];
  organizationalUnits: OrganizationalUnit[];
  roles: Role[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (userIds: string[]) => void;
  onView?: (user: User) => void;
  onRefresh: () => void;
  onAddUser: () => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function ListUser({
  users,
  organizationalUnits,
  roles,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onAddUser,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: ListUserProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [peages, setPeages] = useState<Peage[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Initialisation des services via la factory
  const localiteService = ServiceFactory.createLocaliteService();
  const peageService = ServiceFactory.createPeageService();

  useEffect(() => {
    console.log("Users data:", users);
    console.log("Roles data:", roles);
    console.log("Organizational units:", organizationalUnits);

    // Charger les localités et péages seulement une fois
    if (!dataLoaded) {
      loadReferenceData();
    }
  }, [dataLoaded]);

  const loadReferenceData = async () => {
    try {
      // Charger les localités et péages en parallèle
      const [localitesData, peagesData] = await Promise.all([
        loadLocalites(),
        loadPeages(),
      ]);

      setDataLoaded(true);
      console.log("Reference data loaded successfully");
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de référence:",
        error
      );
    }
  };

  const loadLocalites = async (): Promise<Localite[]> => {
    try {
      const localitesData = await localiteService.loadAllLocalites();
      setLocalites(localitesData);
      console.log("Localites loaded:", localitesData);
      return localitesData;
    } catch (error) {
      console.error("Erreur lors du chargement des localités:", error);
      return [];
    }
  };

  const loadPeages = async (): Promise<Peage[]> => {
    try {
      const peagesData = await peageService.loadAllPeages();
      setPeages(peagesData);
      console.log("Peages loaded:", peagesData);
      return peagesData;
    } catch (error) {
      console.error("Erreur lors du chargement des péages:", error);
      return [];
    }
  };

  const getUoName = useMemo(() => {
    return (codeUo: string | null) => {
      if (!codeUo) return "-";
      const uo = organizationalUnits.find((u) => u.codeUo === codeUo);
      return uo ? `${uo.libUo} (${uo.codeUo})` : codeUo;
    };
  }, [organizationalUnits]);

  const getRoleName = useMemo(() => {
    return (roleId: number) => {
      console.log("Looking for role with ID:", roleId, "in roles:", roles);
      if (!roles || roles.length === 0) return `Chargement... (ID: ${roleId})`;

      const role = roles.find((r) => r.id === roleId);
      return role ? role.name : `Rôle inconnu (ID: ${roleId})`;
    };
  }, [roles]);

  const getLocaliteDisplay = useMemo(() => {
    return (localiteId: number | null | undefined): string => {
      if (!localiteId) return "-";

      const localite = localiteService.getLocaliteById(localiteId);
      return localite
        ? `${localite.libLoc}`
        : `Localité inconnue (ID: ${localiteId})`;
    };
  }, [localites]);

  const getPeageDisplay = useMemo(() => {
    return (peageId: number | null | undefined): string => {
      if (!peageId) return "-";

      const peage = peageService.getPeageById(peageId);
      return peage
        ? `${peage.libPeage}`
        : `Péage inconnu (ID: ${peageId})`;
    };
  }, [peages]);

  const getSensDisplay = (sens: "IN" | "OUT" | null | undefined): string => {
    if (!sens) return "-";
    return sens === "IN" ? "Entrée" : "Sortie";
  };

  // Colonnes du tableau avec mémoisation pour éviter les re-calculs
  const columns: Column[] = useMemo(
    () => [
      {
        key: "fullName",
        label: "Nom complet",
        sortable: true,
        render: (value, row: User) => (
          <div>
            <div className="font-medium text-amber-900 dark:text-amber-100">
              {row.prenom} {row.nom}
            </div>
            <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
              {row.username}
            </div>
          </div>
        ),
      },
      {
        key: "username",
        label: "Nom d'utilisateur",
        sortable: true,
        render: (value) => (
          <code className="bg-amber-100/50 dark:bg-amber-900/30 px-2 py-1 rounded text-amber-900 dark:text-amber-100">
            {value}
          </code>
        ),
      },
      {
        key: "codeUo",
        label: "Unité organisationnelle",
        sortable: true,
        render: (value) => (
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
            <span>{getUoName(value)}</span>
          </div>
        ),
      },
      {
        key: "roleId",
        label: "Rôle",
        sortable: true,
        render: (value, row: User) => (
          <div className="flex items-center">
            <Key className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {getRoleName(row.roleId)}
            </span>
          </div>
        ),
      },
      {
        key: "localiteId",
        label: "Localité",
        sortable: true,
        render: (value, row: User) => (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
            <span>{getLocaliteDisplay(row.localiteId)}</span>
          </div>
        ),
      },
      {
        key: "peageId",
        label: "Péage",
        sortable: true,
        render: (value, row: User) => (
          <div className="flex items-center">
            <Ticket className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
            <span>{getPeageDisplay(row.peageId)}</span>
          </div>
        ),
      },
      {
        key: "sens",
        label: "Sens",
        sortable: true,
        render: (value, row: User) => (
          <div className="flex items-center">
            <ArrowRightLeft className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
            <span>{getSensDisplay(row.sens)}</span>
          </div>
        ),
      },
      {
        key: "hasPassword",
        label: "Mot de passe",
        sortable: true,
        align: "center",
        render: (value) => (
          <div className="flex justify-center">
            {value ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Lock className="w-3 h-3 mr-1" />
                Configuré
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <LockOpen className="w-3 h-3 mr-1" />
                Non configuré
              </span>
            )}
          </div>
        ),
      },
    ],
    [
      organizationalUnits,
      roles,
      localites,
      peages,
      getUoName,
      getRoleName,
      getLocaliteDisplay,
      getPeageDisplay,
    ]
  );

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
      onClick: (row) => onDelete([row.id]),
      className: "text-red-600/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (row) => canDelete
    },
  ];

  // Ajouter l'action de visualisation si fournie
  if (onView) {
    actions.unshift({
      icon: Eye,
      label: "Voir",
      onClick: (row) => onView(row),
      className:
        "text-blue-600/70 hover:text-blue-700 dark:hover:text-blue-300",
      condition: (row) => true // Toujours visible si fournie
    });
  }

  // Actions groupées - conditionnées par les permissions
  const bulkActions: TableAction[] = [
    {
      icon: Trash2,
      label: "Supprimer la sélection",
      onClick: (rows: User[]) => onDelete(rows.map((row: User) => row.id)),
      className: "text-red-600/70 hover:text-red-700 dark:hover:text-red-300",
      condition: (rows: User[]) => canDelete && rows.length > 0
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
              <ShieldUser className="w-5 h-5 mr-2" />
              Liste des utilisateurs
            </h2>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
              {users.length} utilisateur(s) au total
              {selectedUsers.length > 0 &&
                ` • ${selectedUsers.length} sélectionné(s)`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>

            {canCreate && (
              <button
                onClick={onAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nouvel utilisateur</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        config={config}
        loading={loading || !dataLoaded}
        onSelectionChange={setSelectedUsers}
      />
    </div>
  );
}