"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit } from "lucide-react";
import { Pcg } from "@/types/pcg.types";

interface UpdatePcgProps {
  compte: Pcg | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (compte: Pcg) => void;
  availableParents?: Pcg[];
}

export default function UpdatePcg({
  compte,
  isOpen,
  onClose,
  onUpdate,
  availableParents = [],
}: UpdatePcgProps) {
  const [formData, setFormData] = useState<Pcg | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (compte && isOpen) {
      setFormData({ ...compte });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [compte, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData?.libelle?.trim()) {
      newErrors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.trim().length > 255) {
      newErrors.libelle = "Le libellé ne peut dépasser 255 caractères";
    }

    if (formData?.classe && formData.classe.trim().length > 255) {
      newErrors.classe = "La classe ne peut dépasser 255 caractères";
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

  if (!isOpen || !compte || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            <Edit className="w-5 h-5 inline mr-2" />
            Modifier le Compte
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-blue-600/70 hover:text-blue-700 dark:text-blue-400/70 dark:hover:text-blue-300 disabled:opacity-50"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Numéro de compte
            </label>
            <input
              type="text"
              value={formData?.numeroCompte ?? ""}
              disabled
              className="w-full px-3 py-2 border border-blue-200/30 dark:border-blue-700/30 rounded-xl bg-blue-100/30 dark:bg-blue-900/10 opacity-70 cursor-not-allowed"
            />
            <p className="text-blue-600/70 text-xs mt-1">
              Le numéro de compte ne peut pas être modifié
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              required
              value={formData?.libelle ?? ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, libelle: e.target.value } : null
                )
              }
              className={`w-full px-3 py-2 border rounded-xl bg-blue-50/50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.libelle
                  ? "border-red-500"
                  : "border-blue-200/30 dark:border-blue-700/30"
              }`}
              disabled={isSubmitting}
              maxLength={255}
            />
            {errors.libelle && (
              <p className="text-red-500 text-xs mt-1">{errors.libelle}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Classe
            </label>
            <input
              type="text"
              value={formData?.classe ?? ""}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, classe: e.target.value } : null
                )
              }
              className={`w-full px-3 py-2 border rounded-xl bg-blue-50/50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.classe
                  ? "border-red-500"
                  : "border-blue-200/30 dark:border-blue-700/30"
              }`}
              disabled={isSubmitting}
              maxLength={255}
            />
            {errors.classe && (
              <p className="text-red-500 text-xs mt-1">{errors.classe}</p>
            )}
          </div>

          {/* Affichage des informations de hiérarchie */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
              Informations de hiérarchie
            </p>
            <div className="mt-2 space-y-1 text-xs text-blue-600/70 dark:text-blue-400/70">
              <div>Parent: {formData.parent || 'Aucun (Racine)'}</div>
              <div>Chemin: {formData.path || '—'}</div>
              <div>Sous-comptes: {formData.sousComptes?.length || 0}</div>
            </div>
          </div>

          {/* Informations sur les sous-comptes */}
          {formData.sousComptes && formData.sousComptes.length > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-green-700 dark:text-green-300 text-sm">
                Ce compte a {formData.sousComptes.length} sous-compte(s)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-blue-200/30 dark:border-blue-700/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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