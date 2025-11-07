"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, Tag } from "lucide-react";
import { Role } from "@/types/security.types";

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: Role | Omit<Role, "id">) => void;
  onCancel: () => void;
}

export default function RoleForm({
  role,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  const isEdit = !!role;
  const [formData, setFormData] = useState<Omit<Role, "id">>({
    name: role?.name || "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
      });
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple
    const validationErrors: string[] = [];
    if (!formData.name.trim()) {
      validationErrors.push("Le nom du rôle est requis");
    }
    
    if (formData.name.length > 50) {
      validationErrors.push("Le nom du rôle ne doit pas dépasser 50 caractères");
    }

    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);

      if (isEdit && role) {
        // Mode modification
        onSubmit({ ...formData, id: role.id });
      } else {
        // Mode ajout
        onSubmit(formData);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer les erreurs quand l'utilisateur modifie
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="role-form-pro">
      <div className="form-content space-y-6">
        {/* Champ nom */}
        <div className="form-row">
          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Tag className="w-4 h-4 mr-2" />
              Nom du Rôle
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: Administrateur"
                required
                autoFocus
              />
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
        </div>

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
          disabled={isSubmitting}
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
              {isEdit ? "Modifier" : "Ajouter"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}