"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, Key, Shield, Link, Unlink } from "lucide-react";
import { Role, Permission } from "@/types/security.types";

interface RolePermissionAssociationProps {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: { [roleId: number]: number[] };
  onSubmit: (roleId: number, permissionIds: number[]) => void;
  onCancel: () => void;
}

export default function RolePermissionAssociation({
  roles,
  permissions,
  rolePermissions,
  onSubmit,
  onCancel,
}: RolePermissionAssociationProps) {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les permissions sélectionnées quand le rôle change
  useEffect(() => {
    if (selectedRole !== null && rolePermissions[selectedRole]) {
      setSelectedPermissions(rolePermissions[selectedRole]);
    } else {
      setSelectedPermissions([]);
    }
  }, [selectedRole, rolePermissions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === null) {
      setErrors(["Veuillez sélectionner un rôle"]);
      return;
    }

    setIsSubmitting(true);
    onSubmit(selectedRole, selectedPermissions);
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );

    // Effacer les erreurs
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(permissions.map(p => p.id));
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="role-permission-association-pro">
      <div className="form-content space-y-6">
        {/* Sélection du rôle */}
        <div className="form-row">
          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Key className="w-4 h-4 mr-2" />
              Rôle
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <select
                value={selectedRole || ""}
                onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : null)}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez un rôle...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
        </div>

        {/* Sélection des permissions */}
        {selectedRole && (
          <div className="form-row">
            <div className="form-field">
              <div className="flex items-center justify-between mb-2">
                <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100">
                  <Shield className="w-4 h-4 mr-2" />
                  Permissions associées
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllPermissions}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                  >
                    <Unlink className="w-3 h-3 mr-1" />
                    Tout désélectionner
                  </button>
                </div>
              </div>
              
              <div className="permissions-grid grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-700/30 rounded-xl">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/20 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        {permission.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {errors.length > 0 && (
          <div className="error-messages space-y-2">
            {errors.map((error, index) => (
              <div
                key={index}
                className="error-message flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions du formulaire */}
      <div className="form-actions flex gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting || selectedRole === null}
          className="btn-submit flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              En cours...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Associer les permissions
            </>
          )}
        </button>
      </div>
    </form>
  );
}