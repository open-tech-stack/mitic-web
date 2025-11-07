// @/app/dashboard/divers/users/page.tsx - VERSION AVEC PERMISSIONS
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  UserPlus,
  RefreshCw,
  Key,
  CheckCircle,
} from "lucide-react";
import ListUser from "@/components/dashboard/divers/users/listUser";
import UserForm from "@/components/dashboard/divers/users/userForm";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import toast from "react-hot-toast";
import { User, CreateUserRequest, UpdateUserRequest } from "@/types/user.types";
import { OrganizationalUnit } from "@/types/uo.types";
import { Role } from "@/types/security.types";
import { ServiceFactory } from "@/services/factory/factory.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { PermissionButton } from "@/components/ui/PermissionButton";

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [usersToDelete, setUsersToDelete] = useState<string[]>([]);
  const [userToUpdate, setUserToUpdate] = useState<CreateUserRequest | UpdateUserRequest | null>(null);

 

  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions utilisateur
  const canReadUser = hasPermission('READ_USER') || hasPermission('CRUD_USER');
  const canCreateUser = hasPermission('CREATE_USER') || hasPermission('CRUD_USER');
  const canUpdateUser = hasPermission('UPDATE_USER') || hasPermission('CRUD_USER');
  const canDeleteUser = hasPermission('DELETE_USER') || hasPermission('CRUD_USER');

  // Initialisation des services via la factory
  const userService = ServiceFactory.createUserService();
  const uoService = ServiceFactory.createUoService();
  const securityService = ServiceFactory.createSecurityService();

  useEffect(() => {
    if (canReadUser) {
      loadInitialData();
    }
  }, [canReadUser]);

  const loadInitialData = async () => {
    if (!canReadUser) {
      setError("Vous n'avez pas les permissions nécessaires pour voir les utilisateurs");
      return;
    }

    setLoading(true);
    try {
      console.log("Début du chargement des données initiales...");
      
      // Charger toutes les données en parallèle
      const [usersResult, uoResult, securityResult] = await Promise.allSettled([
        userService.loadAllUsers(),
        uoService.loadAll(),
        securityService.loadAllData()
      ]);

      // Traitement des utilisateurs
      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value);
        console.log("Utilisateurs chargés:", usersResult.value);
      } else {
        console.error("Erreur lors du chargement des utilisateurs:", usersResult.reason);
        toast.error("Erreur lors du chargement des utilisateurs");
      }

      // Traitement des unités organisationnelles
      if (uoResult.status === 'fulfilled') {
        if (uoResult.value.success) {
          const units = uoService.getUnits();
          setOrganizationalUnits(units);
          console.log("UO chargées:", units);
        } else {
          console.error("Erreur UO:", uoResult.value);
        }
      } else {
        console.error("Erreur lors du chargement des UO:", uoResult.reason);
        toast.error("Erreur lors du chargement des unités organisationnelles");
      }

      // Traitement des données de sécurité (rôles)
      if (securityResult.status === 'fulfilled') {
        if (securityResult.value.success && securityResult.value.data) {
          const securityData = securityResult.value.data;
          setRoles(securityData.roles || []);
          console.log("Rôles chargés via SecurityService:", securityData.roles);
        } else {
          console.error("Erreur sécurité:", securityResult.value);
          toast.error("Erreur lors du chargement des rôles");
        }
      } else {
        console.error("Erreur lors du chargement des rôles:", securityResult.reason);
        toast.error("Erreur lors du chargement des rôles");
      }

      setInitialDataLoaded(true);
      console.log("Chargement initial terminé");
      
    } catch (error) {
      console.error("Erreur générale lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!canReadUser) {
      toast.error("Vous n'avez pas la permission de rafraîchir les données");
      return;
    }

    setLoading(true);
    try {
      // Recharger seulement les utilisateurs lors du refresh
      const usersData = await userService.loadAllUsers();
      setUsers(usersData);
      console.log("Utilisateurs rechargés:", usersData);
      
      // Si les données de référence ne sont pas chargées, les recharger aussi
      if (!initialDataLoaded) {
        await loadInitialData();
      }
      
    } catch (error) {
      console.error("Erreur lors du rechargement des données:", error);
      toast.error("Erreur lors du rechargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
    toast.success("Liste actualisée avec succès");
  };

  const handleAddUser = async (userData: CreateUserRequest) => {
    if (!canCreateUser) {
      toast.error("Vous n'avez pas la permission de créer un utilisateur");
      return;
    }

    try {
      const newUser = await userService.createUser(userData);
      setUsers((prev) => [...prev, newUser]);
      setShowAddModal(false);
      toast.success("Utilisateur créé avec succès");
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de la création de l'utilisateur"
      );
    }
  };

  const handleUpdateUser = async (userData: UpdateUserRequest) => {
    if (!userToEdit || !canUpdateUser) {
      toast.error("Vous n'avez pas la permission de modifier cet utilisateur");
      return;
    }

    try {
      const updatedUser = await userService.updateUser(userToEdit.id, userData);
      setUsers((prev) =>
        prev.map((user) => (user.id === userToEdit.id ? updatedUser : user))
      );
      setShowEditModal(false);
      setShowEditConfirmModal(false);
      setUserToEdit(null);
      setUserToUpdate(null);
      toast.success("Utilisateur modifié avec succès");
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de la modification de l'utilisateur"
      );
    }
  };

  const confirmUpdateUser = (
    userData: CreateUserRequest | UpdateUserRequest
  ) => {
    setUserToUpdate(userData);
    setShowEditConfirmModal(true);
  };

  const handleDeleteUsers = async (userIds: string[]) => {
    if (!canDeleteUser) {
      toast.error("Vous n'avez pas la permission de supprimer des utilisateurs");
      return;
    }

    try {
      await userService.deleteUsers(userIds);
      setUsers((prev) => prev.filter((user) => !userIds.includes(user.id)));
      setShowDeleteModal(false);
      setUsersToDelete([]);
      toast.success(`${userIds.length} utilisateur(s) supprimé(s) avec succès`);
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de la suppression des utilisateurs"
      );
    }
  };

  const handleEditUser = (user: User) => {
    if (!canUpdateUser) {
      toast.error("Vous n'avez pas la permission de modifier les utilisateurs");
      return;
    }
    setUserToEdit(user);
    setShowEditModal(true);
  };

  // Si l'utilisateur n'a aucune permission utilisateur
  if (!hasAnyPermission(['READ_USER', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CRUD_USER'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Statistiques simplifiées avec vérification des données
  const stats = {
    total: users.length,
    withUo: users.filter((user) => user.codeUo).length,
    withoutUo: users.filter((user) => !user.codeUo).length,
    withPassword: users.filter((user) => user.hasPassword).length,
    withoutPassword: users.filter((user) => !user.hasPassword).length,
    byRole: roles && roles.length > 0 
      ? roles
          .map((role) => ({
            role: role.name,
            count: users.filter((user) => user.roleId === role.id).length,
            code: role.id.toString(),
          }))
          .filter((stat) => stat.count > 0)
      : [],
  };

  // Affichage de chargement si les données initiales ne sont pas prêtes
  if (!initialDataLoaded && canReadUser) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
            <p className="text-amber-800 dark:text-amber-200">
              Chargement des données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              Gérez les utilisateurs de votre application et leurs accès
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PermissionButton
              onClick={handleRefresh}
              disabled={loading}
              permission="READ_USER"
              className="flex items-center gap-2 px-4 py-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </PermissionButton>

            <PermissionButton
              onClick={() => setShowAddModal(true)}
              disabled={loading || !initialDataLoaded}
              permission="CREATE_USER"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvel utilisateur</span>
            </PermissionButton>
          </div>
        </div>

        {/* Statistiques principales - seulement si on peut lire */}
        <PermissionGuard permission="READ_USER">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Total utilisateurs
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Users className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Avec UO assignée
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.withUo}
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                    {stats.total > 0
                      ? ((stats.withUo / stats.total) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Building2 className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Mots de passe configurés
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.withPassword}
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                    {stats.total > 0
                      ? ((stats.withPassword / stats.total) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                    Rôles différents
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {stats.byRole.length}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Key className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      </div>

      {/* Liste des utilisateurs - seulement si on peut lire */}
      <PermissionGuard permission="READ_USER" fallback={
        <div className="text-center py-12 text-amber-600/70 dark:text-amber-400/70">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vous n'avez pas la permission de voir la liste des utilisateurs</p>
        </div>
      }>
        <ListUser
          users={users}
          organizationalUnits={organizationalUnits}
          roles={roles}
          loading={loading}
          onEdit={handleEditUser}
          onDelete={(userIds) => {
            setUsersToDelete(userIds);
            setShowDeleteModal(true);
          }}
          onRefresh={handleRefresh}
          onAddUser={() => setShowAddModal(true)}
          canCreate={canCreateUser}
          canUpdate={canUpdateUser}
          canDelete={canDeleteUser}
        />
      </PermissionGuard>

      {/* Modals avec permissions */}
      <PermissionGuard permission="CREATE_USER">
        {showAddModal && (
          <UserForm
            organizationalUnits={organizationalUnits}
            roles={roles}
            allowPasswordEdit={true}
            onSubmit={(data) => {
              if ("nom" in data && typeof data.nom === "string") {
                handleAddUser(data as CreateUserRequest);
              } else {
                toast.error("Données invalides pour la création d'utilisateur");
              }
            }}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </PermissionGuard>

      <PermissionGuard permission="UPDATE_USER">
        {showEditModal && userToEdit && (
          <UserForm
            organizationalUnits={organizationalUnits}
            roles={roles}
            userData={userToEdit}
            allowPasswordEdit={true}
            onSubmit={confirmUpdateUser}
            onCancel={() => {
              setShowEditModal(false);
              setUserToEdit(null);
            }}
          />
        )}
      </PermissionGuard>

      {/* Modal de confirmation pour la suppression */}
      <PermissionGuard permission="DELETE_USER">
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteUsers(usersToDelete)}
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer ${usersToDelete.length} utilisateur(s) ? Cette action est irréversible.`}
          confirmText="Supprimer"
          type="delete"
        />
      </PermissionGuard>

      {/* Modal de confirmation pour la modification */}
      <PermissionGuard permission="UPDATE_USER">
        <ConfirmationModal
          isOpen={showEditConfirmModal}
          onClose={() => {
            setShowEditConfirmModal(false);
            setUserToUpdate(null);
          }}
          onConfirm={() =>
            userToUpdate && handleUpdateUser(userToUpdate as UpdateUserRequest)
          }
          title="Confirmer la modification"
          message="Êtes-vous sûr de vouloir modifier cet utilisateur ?"
          confirmText="Modifier"
          type="edit"
        />
      </PermissionGuard>
    </div>
  );
}


