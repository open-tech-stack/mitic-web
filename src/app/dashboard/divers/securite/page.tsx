// app/roles-permissions/page.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Plus,
  Edit,
  Users,
  BarChart3,
  LinkIcon,
  RefreshCw,
} from "lucide-react";
import RolePermissionAssociation from "@/components/dashboard/securite/attributions/RolePermissionAssociation";
import AssociationList from "@/components/dashboard/securite/attributions/AssociationList";
import { Role, Permission, Association } from "@/types/security.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [showAssociationModal, setShowAssociationModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions rôles-permissions
  const canReadRolePermission = hasPermission('READ_ASSOCIATION_ROLE_PERMISSION') || hasPermission('CRUD_ASSOCIATION_ROLE_PERMISSION');
  const canCreateRolePermission = hasPermission('CREATE_ASSOCIATION_ROLE_PERMISSION') || hasPermission('CRUD_ASSOCIATION_ROLE_PERMISSION');
  const canUpdateRolePermission = hasPermission('UPDATE_ASSOCIATION_ROLE_PERMISSION') || hasPermission('CRUD_ASSOCIATION_ROLE_PERMISSION');
  const canDeleteRolePermission = hasPermission('DELETE_ASSOCIATION_ROLE_PERMISSION') || hasPermission('CRUD_ASSOCIATION_ROLE_PERMISSION');

  const securityService = ServiceFactory.getSecurityService();

  // Charger les données initiales
  useEffect(() => {
    if (canReadRolePermission) {
      loadAllData();
    }
  }, [canReadRolePermission]);

  // Fonction pour charger toutes les données
  const loadAllData = async () => {
    if (!canReadRolePermission) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les associations rôles-permissions");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await securityService.loadAllData();

      if (result.success && result.data) {
        console.log("Données chargées:", result.data);

        setRoles(result.data.roles || []);
        setPermissions(result.data.permissions || []);

        const formattedAssociations: Association[] = [];
        result.data.associations?.forEach((assoc) => {
          const permissionArray = Array.isArray(assoc.permission)
            ? assoc.permission
            : [assoc.permission];

          const role = result.data?.roles.find((r) => r.id === assoc.role);

          permissionArray.forEach((permId) => {
            const permission = result.data?.permissions.find(
              (p) => p.id === permId
            );
            formattedAssociations.push({
              roleId: assoc.role,
              permissionId: permId,
              roleName: role?.name,
              permissionName: permission?.name,
            });
          });
        });

        console.log("Roles:", result.data.roles);
        console.log("Permissions:", result.data.permissions);
        console.log("Associations formatées:", formattedAssociations);

        setAssociations(formattedAssociations);
      } else {
        setError(result.error || "Erreur lors du chargement des données");
      }
    } catch (err: any) {
      console.error("Erreur complète:", err);
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'a aucune permission rôles-permissions
  if (!hasAnyPermission(['READ_ASSOCIATION_ROLE_PERMISSION', 'CREATE_ASSOCIATION_ROLE_PERMISSION', 'UPDATE_ASSOCIATION_ROLE_PERMISSION', 'DELETE_ASSOCIATION_ROLE_PERMISSION', 'CRUD_ASSOCIATION_ROLE_PERMISSION'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Key className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  // Statistiques
  const stats = {
    roles: roles.length,
    associations: associations.length,
  };

  // Handlers pour les associations
  const handleAssociationSubmit = async (
    roleId: number,
    permissionIds: number[]
  ) => {
    if (!canCreateRolePermission && !canUpdateRolePermission) {
      alert("Vous n'avez pas la permission de créer ou modifier des associations");
      return;
    }

    try {
      setLoading(true);
      const result = await securityService.saveAssociation(
        roleId,
        permissionIds
      );

      if (result.success && result.data) {
        // Mettre à jour les associations locales
        const newAssociations = associations.filter((a) => a.roleId !== roleId);
        permissionIds.forEach((permId) => {
          newAssociations.push({ roleId, permissionId: permId });
        });
        setAssociations(newAssociations);

        setShowAssociationModal(false);
        setSelectedRole(null);
      } else {
        setError(
          result.error || "Erreur lors de la sauvegarde de l'association"
        );
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde de l'association");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssociation = async (
    roleId: number,
    permissionId: number
  ) => {
    if (!canDeleteRolePermission) {
      alert("Vous n'avez pas la permission de supprimer des associations");
      return;
    }

    try {
      setLoading(true);
      const result = await securityService.deleteAssociation(
        roleId,
        permissionId
      );

      if (result.success) {
        setAssociations(
          associations.filter(
            (a) => !(a.roleId === roleId && a.permissionId === permissionId)
          )
        );
      } else {
        setError(
          result.error || "Erreur lors de la suppression de l'association"
        );
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'association");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMultipleAssociations = async (
    assocsToDelete: Association[]
  ) => {
    if (!canDeleteRolePermission) {
      alert("Vous n'avez pas la permission de supprimer des associations");
      return;
    }

    try {
      setLoading(true);

      // Supprimer chaque association individuellement
      for (const assoc of assocsToDelete) {
        const result = await securityService.deleteAssociation(
          assoc.roleId,
          assoc.permissionId
        );
        if (!result.success) {
          setError(
            result.error || "Erreur lors de la suppression des associations"
          );
          break;
        }
      }

      // Mettre à jour les associations locales
      setAssociations(
        associations.filter(
          (a) =>
            !assocsToDelete.some(
              (d) => d.roleId === a.roleId && d.permissionId === a.permissionId
            )
        )
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression des associations");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssociationRequested = (
    roleId: number,
    permissionIds: number[]
  ) => {
    if (!canUpdateRolePermission) {
      alert("Vous n'avez pas la permission de modifier des associations");
      return;
    }
    setSelectedRole(roles.find((r) => r.id === roleId) || null);
    setShowAssociationModal(true);
  };

  // Convertir les associations en format attendu par RolePermissionAssociation
  const getRolePermissionsMap = () => {
    const rolePermissions: { [roleId: number]: number[] } = {};
    associations.forEach((assoc) => {
      if (!rolePermissions[assoc.roleId]) {
        rolePermissions[assoc.roleId] = [];
      }
      rolePermissions[assoc.roleId].push(assoc.permissionId);
    });
    return rolePermissions;
  };

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Key className="w-8 h-8 mr-3" />
              Gestion des Profils Utilisateurs
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les profils utilisateurs et leurs services associés ici.
            </p>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-4 bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-800 dark:text-red-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistiques - seulement si on peut lire */}
        <PermissionGuard permission="READ_ASSOCIATION_ROLE_PERMISSION">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Profils Utilisateurs
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.roles}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Key className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Services
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.associations}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <LinkIcon className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Contrôles */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Bouton Actualiser à gauche */}
          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={loadAllData}
              disabled={loading}
              permission="READ_ASSOCIATION_ROLE_PERMISSION"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Actualiser</span>
            </PermissionButton>
          </div>

          {/* Bouton d'ajout à droite */}
          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={() => setShowAssociationModal(true)}
              permission="CREATE_ASSOCIATION_ROLE_PERMISSION"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Nouveau profil utilisateur</span>
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Contenu - seulement si on peut lire */}
      <PermissionGuard permission="READ_ASSOCIATION_ROLE_PERMISSION" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir les associations rôles-permissions</p>
        </div>
      }>
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AssociationList
              roles={roles}
              permissions={permissions}
              associations={associations}
              loading={loading}
              onEditRequested={handleEditAssociationRequested}
              onDelete={handleDeleteAssociation}
              onDeleteMultiple={handleDeleteMultipleAssociations}
              canCreate={canCreateRolePermission}
              canUpdate={canUpdateRolePermission}
              canDelete={canDeleteRolePermission}
            />
          </motion.div>
        </div>
      </PermissionGuard>

      {/* Modals avec permissions */}
      <PermissionGuard permission="CREATE_ASSOCIATION_ROLE_PERMISSION">
        <AnimatePresence>
          {/* Modal Association */}
          {showAssociationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowAssociationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                    <LinkIcon className="w-6 h-6 mr-2" />
                    {selectedRole
                      ? `Profile pour ${selectedRole.name}`
                      : "Attribution de profil"}
                  </h2>
                  <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
                    Créer un profil utilisateur
                  </p>
                </div>

                <RolePermissionAssociation
                  roles={roles}
                  permissions={permissions}
                  rolePermissions={getRolePermissionsMap()}
                  onSubmit={handleAssociationSubmit}
                  onCancel={() => {
                    setShowAssociationModal(false);
                    setSelectedRole(null);
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PermissionGuard>
    </div>
  );
}