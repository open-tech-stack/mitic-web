"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Tag, Type, Cloud, X, Save, Plus, Check, Route } from "lucide-react";
import { LocaliteService, Troncon } from "@/services/localite/localite.service";

// Types modifiés
export interface LocaliteData {
  id?: number;
  codeLoc: string;
  libLoc: string;
  virtuel: boolean;
  tronconIds?: number[]; // Changé en tableau
  libelleTroncons?: string[]; // Changé en tableau
}

interface LocaliteFormProps {
  localiteData?: LocaliteData | null;
  onSubmit: (data: LocaliteData) => void;
  onCancel: () => void;
}

export default function LocaliteForm({
  localiteData = null,
  onSubmit,
  onCancel,
}: LocaliteFormProps) {
  const [formData, setFormData] = useState<LocaliteData>({
    codeLoc: "",
    libLoc: "",
    virtuel: false,
    tronconIds: [], // Initialisé comme tableau vide
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [troncons, setTroncons] = useState<Troncon[]>([]);
  const [loadingTroncons, setLoadingTroncons] = useState(false);
  const isEditMode = !!localiteData;

  const localiteService = LocaliteService.getInstance();

  useEffect(() => {
    if (localiteData) {
      setFormData({
        codeLoc: localiteData.codeLoc || "",
        libLoc: localiteData.libLoc || "",
        virtuel: localiteData.virtuel || false,
        tronconIds: localiteData.tronconIds || [], // Initialisé comme tableau
      });
    }
  }, [localiteData]);

  useEffect(() => {
    loadTroncons();
  }, []);

  const loadTroncons = async () => {
    setLoadingTroncons(true);
    try {
      const tronconsData = await localiteService.getTroncons();
      setTroncons(tronconsData);
    } catch (error) {
      console.error("Erreur lors du chargement des tronçons:", error);
      setErrors(prev => ({ ...prev, tronconIds: "Erreur lors du chargement des tronçons" }));
    } finally {
      setLoadingTroncons(false);
    }
  };

  const validateField = (name: string, value: any) => {
    let error = "";

    if (name !== "virtuel" && name !== "tronconIds" && !value) {
      error = "Ce champ est requis";
    } else {
      switch (name) {
        case "codeLoc":
          if (typeof value === "string") {
            if (!/^\d+$/.test(value)) error = "Doit contenir seulement des chiffres";
            if (value.length !== 3) error = "Doit contenir exactement 3 chiffres";
            const num = parseInt(value, 10);
            if (num < 1 || num > 999) error = "Doit être entre 001 et 999";
          }
          break;
        case "libLoc":
          if (typeof value === "string") {
            if (value.length < 2) error = "Minimum 2 caractères";
            if (value.length > 100) error = "Maximum 100 caractères";
          }
          break;
        case "tronconIds":
          if (formData.virtuel && (!value || value.length === 0)) {
            error = "Au moins un tronçon doit être sélectionné pour une localité virtuelle";
          }
          break;
      }
    }

    return error;
  };

  const handleTronconSelection = (tronconId: number) => {
    setFormData(prev => {
      const currentIds = prev.tronconIds || [];
      const newIds = currentIds.includes(tronconId)
        ? currentIds.filter(id => id !== tronconId)
        : [...currentIds, tronconId];
      
      return { ...prev, tronconIds: newIds };
    });

    // Clear error when user selects a tronçon
    if (errors.tronconIds) {
      setErrors(prev => ({ ...prev, tronconIds: "" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Si on désactive "virtuel", on supprime l'erreur du tronçon
    if (name === "virtuel" && !fieldValue && errors.tronconIds) {
      setErrors(prev => ({ ...prev, tronconIds: "" }));
    }
  };

  const handleCodeLocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    
    setFormData(prev => ({ ...prev, codeLoc: value }));
    
    if (errors.codeLoc) {
      setErrors(prev => ({ ...prev, codeLoc: "" }));
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

    // Validation spécifique pour les tronçons si virtuel
    if (formData.virtuel && (!formData.tronconIds || formData.tronconIds.length === 0)) {
      newErrors.tronconIds = "Au moins un tronçon doit être sélectionné pour une localité virtuelle";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format codeLoc to 3 digits
    const formattedData = {
      ...formData,
      codeLoc: formData.codeLoc.padStart(3, '0')
    };

    onSubmit(formattedData);
  };

  // Fonction pour obtenir le libellé d'un tronçon par son ID
  const getTronconLabel = (id: number) => {
    const troncon = troncons.find(t => t.id === id);
    return troncon ? troncon.libelleTroncon : `Tronçon ${id}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200/30 dark:border-amber-700/30 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {isEditMode ? "Modifier la localité" : "Nouvelle localité"}
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
          <div>
            <label className="flex text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 items-center">
              <Tag className="w-4 h-4 mr-2" />
              Code Localité *
            </label>
            <input
              type="text"
              name="codeLoc"
              value={formData.codeLoc}
              onChange={handleCodeLocChange}
              className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.codeLoc ? "border-red-500" : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              placeholder="Ex: 001"
              maxLength={3}
            />
            {errors.codeLoc && <p className="text-red-500 text-xs mt-1">{errors.codeLoc}</p>}
            <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1">
              Code à 3 chiffres (001-999)
            </p>
          </div>

          <div>
            <label className="flex text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 items-center">
              <Type className="w-4 h-4 mr-2" />
              Libellé Localité *
            </label>
            <input
              type="text"
              name="libLoc"
              value={formData.libLoc}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.libLoc ? "border-red-500" : "border-amber-200/30 dark:border-amber-700/30"
              }`}
              placeholder="Ex: Ouagadougou Centre"
              maxLength={100}
            />
            {errors.libLoc && <p className="text-red-500 text-xs mt-1">{errors.libLoc}</p>}
          </div>

          <div className="pt-2">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="virtuel"
                  checked={formData.virtuel}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`block w-14 h-7 rounded-full transition-colors ${
                  formData.virtuel 
                    ? "bg-amber-600" 
                    : "bg-amber-200/50 dark:bg-amber-800/30"
                }`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${
                  formData.virtuel ? "transform translate-x-7" : ""
                }`}></div>
              </div>
              <div className="ml-3 flex items-center">
                <Cloud className="w-4 h-4 mr-2 text-amber-600/70 dark:text-amber-400/70" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Localité Virtuelle
                </span>
              </div>
            </label>
            <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1 ml-11">
              Cochez pour définir comme localité virtuelle
            </p>
          </div>

          {/* Sélecteur multiple de tronçons pour les localités virtuelles */}
          {formData.virtuel && (
            <div>
              <label className="flex text-sm font-medium text-amber-900 dark:text-amber-100 mb-1 items-center">
                <Route className="w-4 h-4 mr-2" />
                Tronçons Associés *
              </label>
              
              {loadingTroncons ? (
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Chargement des tronçons...
                </p>
              ) : (
                <div className={`space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg ${
                  errors.tronconIds ? "border-red-500" : "border-amber-200/30 dark:border-amber-700/30"
                }`}>
                  {troncons.map((troncon) => (
                    <div key={troncon.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`troncon-${troncon.id}`}
                        checked={(formData.tronconIds || []).includes(troncon.id)}
                        onChange={() => handleTronconSelection(troncon.id)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`troncon-${troncon.id}`}
                        className={`flex items-center w-full p-2 rounded-lg cursor-pointer transition-colors ${
                          (formData.tronconIds || []).includes(troncon.id)
                            ? "bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-600"
                            : "bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 hover:bg-amber-100/50 dark:hover:bg-amber-800/30"
                        }`}
                      >
                        <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                          (formData.tronconIds || []).includes(troncon.id)
                            ? "bg-amber-600 border-amber-600"
                            : "border-amber-400"
                        }`}>
                          {(formData.tronconIds || []).includes(troncon.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-amber-900 dark:text-amber-100">
                          {troncon.libelleTroncon}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.tronconIds && <p className="text-red-500 text-xs mt-1">{errors.tronconIds}</p>}
              
              {/* Affichage des tronçons sélectionnés */}
              {(formData.tronconIds || []).length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-1">
                    Tronçons sélectionnés ({formData.tronconIds?.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(formData.tronconIds || []).map(id => (
                      <span
                        key={id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-600"
                      >
                        {getTronconLabel(id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
              className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center"
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