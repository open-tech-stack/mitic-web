"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit } from "lucide-react";
import { OrganizationalUnit } from "@/types/uo.types";

interface UpdateUOProps {
  unit: OrganizationalUnit | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (unit: OrganizationalUnit) => void;
  availableParents?: OrganizationalUnit[];
}

export default function UpdateUO({
  unit,
  isOpen,
  onClose,
  onUpdate,
  availableParents = [],
}: UpdateUOProps) {
  const [formData, setFormData] = useState<OrganizationalUnit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (unit && isOpen) {
      setFormData({ ...unit });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [unit, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData?.libUo?.trim()) {
      newErrors.libUo = "Le libellé UO est obligatoire";
    } else if (formData.libUo.trim().length > 100) {
      newErrors.libUo = "Le libellé UO ne peut dépasser 100 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdate(formData);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !unit || !formData) return null;

  // Vérifier si c'est une unité racine
  const isRootUnit = !unit.parent;
  // Compter les unités racines existantes
  const rootUnitsCount =
    availableParents.filter((p) => !p.parent).length + (isRootUnit ? 1 : 0);
  // Une unité racine peut devenir non-racine seulement s'il y a d'autres racines
  const canChangeFromRoot = !isRootUnit || rootUnitsCount > 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            <Edit className="w-5 h-5 inline mr-2" />
            Modifier l'Unité
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-amber-600/70 hover:text-amber-700 dark:text-amber-400/70 dark:hover:text-amber-300 disabled:opacity-50"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
              Code UO
            </label>
            <input
              type="text"
              value={formData?.codeUo ?? ""}
              disabled
              className="w-full px-3 py-2 border border-amber-200/30 dark:border-amber-700/30 rounded-xl bg-amber-100/30 dark:bg-amber-900/10 opacity-70 cursor-not-allowed"
            />
            <p className="text-amber-600/70 text-xs mt-1">
              Le code UO ne peut pas être modifié
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              required
              value={formData?.libUo ?? ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, libUo: e.target.value } : null
                )
              }
              className={`w-full px-3 py-2 border rounded-xl bg-amber-50/50 dark:bg-amber-900/20 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.libUo
                  ? "border-red-500"
                  : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.libUo && (
              <p className="text-red-500 text-xs mt-1">{errors.libUo}</p>
            )}
          </div>

          {/* Gestion du parent pour unité racine */}
          {isRootUnit && !canChangeFromRoot ? (
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Unité parente
              </label>
              <div className="w-full px-3 py-2 border border-amber-200/30 dark:border-amber-700/30 rounded-xl bg-amber-100/30 dark:bg-amber-900/10 opacity-70">
                Aucune (Unité racine)
              </div>
              <p className="text-amber-600 text-xs mt-1">
                Cette unité est la seule unité racine et ne peut pas être
                modifiée
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Unité parente
              </label>
              <select
                value={formData?.parent ?? ""}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, parent: e.target.value || null } : null
                  )
                }
                className="w-full px-3 py-2 border border-amber-200/30 dark:border-amber-700/30 rounded-xl bg-amber-50/50 dark:bg-amber-900/20 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Aucune (Unité racine)</option>
                {availableParents.map((parent) => (
                  <option key={parent.codeUo} value={parent.codeUo}>
                    {parent.libUo} ({parent.codeUo})
                  </option>
                ))}
              </select>
              {isRootUnit && (
                <p className="text-blue-600 text-xs mt-1">
                  Cette unité est actuellement une unité racine
                </p>
              )}
            </div>
          )}

          {/* Informations sur les enfants */}
          {formData.enfants && formData.enfants.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Cette unité a {formData.enfants.length} sous-unité(s) :
                <span className="font-medium ml-1">
                  {formData.enfants.map((e) => e.libUo).join(", ")}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-amber-200/30 dark:border-amber-700/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Modifier"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
