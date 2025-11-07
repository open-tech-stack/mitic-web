"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { OrganizationalUnit } from "@/types/uo.types";

interface AddUOProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    unit: Omit<
      OrganizationalUnit,
      "id" | "enfants" | "compte" | "usersAssocies"
    >
  ) => void;
  parentUnit?: OrganizationalUnit;
  availableParents?: OrganizationalUnit[];
}

export default function AddUO({
  isOpen,
  onClose,
  onAdd,
  parentUnit,
  availableParents = [],
}: AddUOProps) {
  const [formData, setFormData] = useState({
    codeUo: "",
    libUo: "",
    parent: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculer si une unité racine existe déjà
  const hasRootUnit = availableParents.some((p) => !p.parent);

  // Déterminer si on peut créer une unité racine
  const canCreateRoot = !hasRootUnit;

  // Déterminer le parent par défaut
  const defaultParent =
    parentUnit?.codeUo ||
    (canCreateRoot ? "" : availableParents[0]?.codeUo || "");

  // Réinitialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      setFormData({
        codeUo: "",
        libUo: "",
        parent: defaultParent,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, parentUnit, defaultParent]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.codeUo.trim()) {
      newErrors.codeUo = "Le code UO est obligatoire";
    } else if (formData.codeUo.trim().length > 20) {
      newErrors.codeUo = "Le code UO ne peut dépasser 20 caractères";
    }

    if (!formData.libUo.trim()) {
      newErrors.libUo = "Le libellé UO est obligatoire";
    } else if (formData.libUo.trim().length > 100) {
      newErrors.libUo = "Le libellé UO ne peut dépasser 100 caractères";
    }

    // Validation du parent - si une unité racine existe déjà, on doit avoir un parent
    if (hasRootUnit && !formData.parent) {
      newErrors.parent =
        "Une unité racine existe déjà. Vous devez choisir un parent.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onAdd({
        codeUo: formData.codeUo.trim(),
        libUo: formData.libUo.trim(),
        parent: formData.parent || null,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isRootUnit = !formData.parent;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            <Plus className="w-5 h-5 inline mr-2" />
            {parentUnit ? `Ajouter à ${parentUnit.libUo}` : "Nouvelle Unité"}
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
              Code UO *
            </label>
            <input
              type="text"
              required
              value={formData.codeUo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, codeUo: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-xl bg-amber-50/50 dark:bg-amber-900/20 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.codeUo
                  ? "border-red-500"
                  : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              placeholder="Ex: DIR001"
              disabled={isSubmitting}
              maxLength={20}
            />
            {errors.codeUo && (
              <p className="text-red-500 text-xs mt-1">{errors.codeUo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              required
              value={formData.libUo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, libUo: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-xl bg-amber-50/50 dark:bg-amber-900/20 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.libUo
                  ? "border-red-500"
                  : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              placeholder="Ex: Direction Générale"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.libUo && (
              <p className="text-red-500 text-xs mt-1">{errors.libUo}</p>
            )}
          </div>

          {/* Sélection du parent - Toujours afficher sauf si on ajoute directement à un parent */}
          {!parentUnit && (
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Unité parente {!canCreateRoot && "*"}
              </label>
              <select
                value={formData.parent}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, parent: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-xl bg-amber-50/50 dark:bg-amber-900/20 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.parent
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                }`}
                disabled={
                  isSubmitting ||
                  (availableParents.length === 0 && canCreateRoot)
                }
                required={!canCreateRoot}
              >
                {canCreateRoot ? (
                  <option value="">Aucune (Unité racine)</option>
                ) : (
                  <option value="">Choisir un parent</option>
                )}
                {availableParents.map((parent) => (
                  <option key={parent.codeUo} value={parent.codeUo}>
                    {parent.codeUo} - {parent.libUo}
                    {!parent.parent && " ★"}
                  </option>
                ))}
              </select>
              {errors.parent && (
                <p className="text-red-500 text-xs mt-1">{errors.parent}</p>
              )}
              {canCreateRoot && (
                <p className="text-green-600 text-xs mt-1">
                  Première unité : elle sera créée comme unité racine
                </p>
              )}
              {!canCreateRoot && !formData.parent && (
                <p className="text-amber-600 text-xs mt-1">
                  Une unité racine existe déjà. Vous devez choisir un parent.
                </p>
              )}
            </div>
          )}

          {/* Message informatif pour les unités avec parent prédéfini */}
          {parentUnit && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Cette unité sera créée sous "{parentUnit.libUo}" (
                {parentUnit.codeUo})
              </p>
            </div>
          )}

          {/* Message informatif pour les unités racines */}
          {isRootUnit && canCreateRoot && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✓ Cette unité sera créée comme unité racine
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
              disabled={isSubmitting || (!canCreateRoot && !formData.parent)}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Créer"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
