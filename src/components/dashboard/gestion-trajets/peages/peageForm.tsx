// @/components/dashboard/gestion-trajets/peages/peageForm.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Route, Tag, Type, MapPin, X, Save, Plus } from "lucide-react";
import { Localite } from "@/types/localite.types";
import {
  Peage,
  PeageCreateRequest,
  PeageUpdateRequest,
} from "@/types/peage.types";

interface PeageFormProps {
  localites: Localite[];
  peageData?: Peage | null;
  onSubmit: (data: PeageCreateRequest | PeageUpdateRequest) => void | Promise<void>;
  onCancel: () => void;
}

export default function PeageForm({
  localites,
  peageData = null,
  onSubmit,
  onCancel,
}: PeageFormProps) {
  const [formData, setFormData] = useState<PeageCreateRequest>({
    codPeage: "",
    libPeage: "",
    locReel: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!peageData;

  useEffect(() => {
    if (peageData) {
      setFormData({
        codPeage: peageData.codPeage || "",
        libPeage: peageData.libPeage || "",
        locReel: peageData.locReel || 0,
      });
    }
  }, [peageData]);

  const validateField = (name: string, value: string | number) => {
    let error = "";

    if (!value) {
      error = "Ce champ est requis";
    } else {
      switch (name) {
        case "codPeage":
          if (typeof value === "string") {
            if (!/^\d+$/.test(value))
              error = "Doit contenir seulement des chiffres";
            if (value.length !== 3)
              error = "Doit contenir exactement 3 chiffres";
            const num = parseInt(value, 10);
            if (num < 1 || num > 999) error = "Doit être entre 001 et 999";
          }
          break;
        case "libPeage":
          if (typeof value === "string") {
            if (value.length < 2) error = "Minimum 2 caractères";
            if (value.length > 100) error = "Maximum 100 caractères";
          }
          break;
        case "locReel":
          if (value === 0) error = "Veuillez sélectionner une localité";
          break;
      }
    }

    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "locReel" ? parseInt(value, 10) : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCodPeageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);

    setFormData((prev) => ({ ...prev, codPeage: value }));

    if (errors.codPeage) {
      setErrors((prev) => ({ ...prev, codPeage: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format codPeage to 3 digits
    const formattedData = {
      ...formData,
      codPeage: formData.codPeage.padStart(3, "0"),
    };

    // Pour l'édition, inclure l'ID
    const submitData = isEditMode
      ? ({ ...formattedData, id: peageData.id } as PeageUpdateRequest)
      : (formattedData as PeageCreateRequest);

    onSubmit(submitData);
  };

  const getPhysicalLocalites = () => {
    return localites.filter((l) => !l.virtuel);
  };

  const getSelectedLocaliteName = () => {
    if (!formData.locReel) return "";
    const localite = localites.find((l) => l.id === formData.locReel);
    return localite ? localite.libLoc : "";
  };

  // Fonction pour obtenir le code de localité formaté
  const getLocaliteDisplay = (localite: Localite) => {
    return `${localite.libLoc} (${localite.codeLoc})`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200/30 dark:border-amber-700/30 w-full max-w-md"
      >
        <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 flex items-center">
              <Route className="w-5 h-5 mr-2" />
              {isEditMode ? "Modifier le péage" : "Nouveau péage"}
            </h2>
            <button
              onClick={onCancel}
              className="text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code Péage */}
          <div>
            <label className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Code Péage *
            </label>
            <input
              type="text"
              name="codPeage"
              value={formData.codPeage}
              onChange={handleCodPeageChange}
              className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.codPeage
                  ? "border-red-500"
                  : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              placeholder="Ex: 001"
              maxLength={3}
            />
            {errors.codPeage && (
              <p className="text-red-500 text-xs mt-1">{errors.codPeage}</p>
            )}
            <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1">
              Code à 3 chiffres (001-999)
            </p>
          </div>

          {/* Libellé Péage */}
          <div>
            <label className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Libellé Péage *
            </label>
            <input
              type="text"
              name="libPeage"
              value={formData.libPeage}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.libPeage
                  ? "border-red-500"
                  : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              placeholder="Ex: Péage de Ouagadougou"
              maxLength={100}
            />
            {errors.libPeage && (
              <p className="text-red-500 text-xs mt-1">{errors.libPeage}</p>
            )}
            <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1">
              {formData.libPeage.length}/100 caractères
            </p>
          </div>

          {/* Localité Réelle */}
          <div>
            <label className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Localité Réelle *
            </label>
            <select
              name="locReel"
              value={formData.locReel}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.locReel
                  ? "border-red-500"
                  : "border-amber-200/30 dark:border-amber-700/30"
              }`}
            >
              <option value={0}>Sélectionnez une localité</option>
              {getPhysicalLocalites().map((localite) => (
                <option key={localite.id} value={localite.id}>
                  {getLocaliteDisplay(localite)}
                </option>
              ))}
            </select>
            {errors.locReel && (
              <p className="text-red-500 text-xs mt-1">{errors.locReel}</p>
            )}

            {/* Affichage de la localité sélectionnée */}
            {formData.locReel > 0 && (
              <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Sélectionné: {getSelectedLocaliteName()}
              </p>
            )}

            {/* Info sur les localités disponibles */}
            <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1">
              {getPhysicalLocalites().length} localité(s) réelle(s)
              disponible(s)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(errors).some((key) => errors[key])}
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
