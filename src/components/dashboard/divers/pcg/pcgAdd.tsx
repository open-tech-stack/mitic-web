"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Pcg } from '@/types/pcg.types';

interface AddPcgProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (compte: Omit<Pcg, "sousComptes" | "path">) => void;
  parentCompte?: Pcg;
  availableParents?: Pcg[];
}

export default function AddPcg({
  isOpen,
  onClose,
  onAdd,
  parentCompte,
  availableParents = []
}: AddPcgProps) {
  const [formData, setFormData] = useState({
    numeroCompte: "",
    libelle: "",
    classe: "",
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        numeroCompte: "",
        libelle: "",
        classe: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validation du numéro de compte
    if (!formData.numeroCompte.trim()) {
      newErrors.numeroCompte = "Le numéro de compte est obligatoire";
    } else if (!/^\d+$/.test(formData.numeroCompte.trim())) {
      newErrors.numeroCompte = "Le numéro de compte doit être un nombre";
    } else if (formData.numeroCompte.trim().length > 100) {
      newErrors.numeroCompte = "Le numéro de compte ne peut dépasser 100 caractères";
    }

    if (!formData.libelle.trim()) {
      newErrors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.trim().length > 255) {
      newErrors.libelle = "Le libellé ne peut dépasser 255 caractères";
    }

    if (formData.classe.trim().length > 255) {
      newErrors.classe = "La classe ne peut dépasser 255 caractères";
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
        numeroCompte: formData.numeroCompte.trim(),
        libelle: formData.libelle.trim(),
        classe: formData.classe.trim(),
        parent: parentCompte?.numeroCompte || null
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            <Plus className="w-5 h-5 inline mr-2" />
            {parentCompte ? `Ajouter à ${parentCompte.libelle}` : "Nouveau Compte"}
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
              Numéro de compte *
            </label>
            <input
              type="text"
              required
              value={formData.numeroCompte}
              onChange={(e) => {
                // Validation en temps réel pour n'accepter que les nombres
                const value = e.target.value.replace(/[^\d]/g, '');
                setFormData(prev => ({ ...prev, numeroCompte: value }));
              }}
              className={`w-full px-3 py-2 border rounded-xl bg-blue-50/50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.numeroCompte ? 'border-red-500' : 'border-blue-200/30 dark:border-blue-700/30'
              }`}
              placeholder="Ex: 123456789"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.numeroCompte && (
              <p className="text-red-500 text-xs mt-1">{errors.numeroCompte}</p>
            )}
            <p className="text-blue-600/70 text-xs mt-1">
              Seuls les chiffres sont autorisés
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Libellé *
            </label>
            <input
              type="text"
              required
              value={formData.libelle}
              onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-xl bg-blue-50/50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.libelle ? 'border-red-500' : 'border-blue-200/30 dark:border-blue-700/30'
              }`}
              placeholder="Ex: Capital social"
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
              value={formData.classe}
              onChange={(e) => setFormData(prev => ({ ...prev, classe: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-xl bg-blue-50/50 dark:bg-blue-900/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.classe ? 'border-red-500' : 'border-blue-200/30 dark:border-blue-700/30'
              }`}
              placeholder="Ex: 1"
              disabled={isSubmitting}
              maxLength={255}
            />
            {errors.classe && (
              <p className="text-red-500 text-xs mt-1">{errors.classe}</p>
            )}
          </div>

          {parentCompte && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Ce compte sera créé sous "{parentCompte.libelle}" ({parentCompte.numeroCompte})
              </p>
              <p className="text-blue-600/70 text-xs mt-1">
                Le backend gérera automatiquement la hiérarchie basée sur le numéro de compte
              </p>
            </div>
          )}

          {!parentCompte && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✓ Ce compte sera créé comme compte racine
              </p>
              <p className="text-green-600/70 text-xs mt-1">
                Le backend analysera le numéro pour créer la hiérarchie automatiquement
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
                "Créer"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}