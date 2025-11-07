"use client";

import { useState, useEffect } from "react";
import { X, Save, Route, CheckSquare, Square } from "lucide-react";
import { Peage } from "@/types/peage.types";
import { Troncon } from "@/types/troncon.types";

interface TronconFormDialogProps {
  open: boolean;
  troncon?: Troncon | null;
  peages: Peage[];
  onSubmit: (data: Omit<Troncon, "id" | "codLoc">) => void;
  onCancel: () => void;
}

export default function TronconFormDialog({
  open,
  troncon,
  peages,
  onSubmit,
  onCancel,
}: TronconFormDialogProps) {
  const isEdit = !!troncon;
  const [formData, setFormData] = useState({
    peagesGauche: troncon?.peagesGauche || "",
    peagesDroit: troncon?.peagesDroit || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCodeLeft, setShowCodeLeft] = useState(false);
  const [showCodeRight, setShowCodeRight] = useState(false);

  useEffect(() => {
    if (troncon) {
      setFormData({
        peagesGauche: troncon.peagesGauche,
        peagesDroit: troncon.peagesDroit,
      });
    } else {
      setFormData({
        peagesGauche: "",
        peagesDroit: "",
      });
    }
    setErrors({});
  }, [troncon, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.peagesGauche) {
      newErrors.peagesGauche = "Le péage gauche est obligatoire";
    }

    if (!formData.peagesDroit) {
      newErrors.peagesDroit = "Le péage droit est obligatoire";
    }

    if (formData.peagesGauche && formData.peagesDroit && formData.peagesGauche === formData.peagesDroit) {
      newErrors.form = "Vous ne pouvez pas sélectionner le même péage des deux côtés";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        peagesGauche: Number(formData.peagesGauche),
        peagesDroit: Number(formData.peagesDroit),
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ quand l'utilisateur modifie
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (errors.form && field in formData) {
      setErrors(prev => ({ ...prev, form: "" }));
    }
  };

  const getPeageDisplay = (peage: Peage, showCode: boolean) => {
    return showCode ? `${peage.codPeage} - ${peage.libPeage}` : peage.libPeage;
  };

  const getSelectedPeage = (id: number) => {
    return peages.find(p => p.id === id);
  };

  const peagesGaucheDisponibles = peages.filter(peage => 
    peage.id !== Number(formData.peagesDroit)
  );

  const peagesDroitDisponibles = peages.filter(peage => 
    peage.id !== Number(formData.peagesGauche)
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
            {isEdit ? <Route className="w-6 h-6 mr-2" /> : <Route className="w-6 h-6 mr-2" />}
            {isEdit ? "Modifier le tronçon" : "Ajouter un tronçon"}
          </h2>
          <p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
            {isEdit ? "Modifier les informations du tronçon" : "Ajouter un nouveau tronçon à votre système"}
          </p>
        </div>

        {errors.form && (
          <div className="error-banner mb-4 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200/30 dark:border-red-700/30">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <X className="w-4 h-4" />
              <span>{errors.form}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection péage gauche */}
          <div className="form-section">
            <div className="section-header flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100">
                Péage Gauche
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCodeLeft}
                  onChange={() => setShowCodeLeft(!showCodeLeft)}
                  className="sr-only"
                />
                {showCodeLeft ? (
                  <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (                  <Square className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                )}
                <span className="text-sm text-amber-600/70 dark:text-amber-400/70">
                  Afficher les codes
                </span>
              </label>
            </div>

            <div className="input-wrapper">
              <select
                value={formData.peagesGauche}
                onChange={(e) => handleChange("peagesGauche", e.target.value)}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border ${
                  errors.peagesGauche 
                    ? "border-red-300 dark:border-red-700" 
                    : "border-amber-200/30 dark:border-amber-700/30"
                } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              >
                <option value="">Sélectionner un péage gauche</option>
                {peagesGaucheDisponibles.map((peage) => (
                  <option key={peage.id} value={peage.id}>
                    {getPeageDisplay(peage, showCodeLeft)}
                  </option>
                ))}
              </select>
              {errors.peagesGauche && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.peagesGauche}</p>
              )}
            </div>

            {formData.peagesGauche && (
              <div className="selection-preview mt-3 p-3 bg-amber-100/30 dark:bg-amber-900/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <Route className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
                  <div>
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Péage sélectionné :
                    </span>
                    <span className="text-amber-700 dark:text-amber-300 ml-2">
                      {getSelectedPeage(Number(formData.peagesGauche))?.libPeage}
                    </span>
                    {showCodeLeft && (
                      <span className="text-xs text-amber-600/70 dark:text-amber-400/70 ml-2">
                        ({getSelectedPeage(Number(formData.peagesGauche))?.codPeage})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sélection péage droit */}
          <div className="form-section">
            <div className="section-header flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100">
                Péage Droit
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCodeRight}
                  onChange={() => setShowCodeRight(!showCodeRight)}
                  className="sr-only"
                />
                {showCodeRight ? (
                  <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                )}
                <span className="text-sm text-amber-600/70 dark:text-amber-400/70">
                  Afficher les codes
                </span>
              </label>
            </div>

            <div className="input-wrapper">
              <select
                value={formData.peagesDroit}
                onChange={(e) => handleChange("peagesDroit", e.target.value)}
                disabled={!formData.peagesGauche}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border ${
                  errors.peagesDroit 
                    ? "border-red-300 dark:border-red-700" 
                    : "border-amber-200/30 dark:border-amber-700/30"
                } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50`}
              >
                <option value="">Sélectionner un péage droit</option>
                {peagesDroitDisponibles.map((peage) => (
                  <option key={peage.id} value={peage.id}>
                    {getPeageDisplay(peage, showCodeRight)}
                  </option>
                ))}
              </select>
              {errors.peagesDroit && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.peagesDroit}</p>
              )}
              {!formData.peagesGauche && (
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm mt-1">
                  Sélectionnez d'abord un péage gauche
                </p>
              )}
            </div>

            {formData.peagesDroit && (
              <div className="selection-preview mt-3 p-3 bg-amber-100/30 dark:bg-amber-900/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <Route className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
                  <div>
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Péage sélectionné :
                    </span>
                    <span className="text-amber-700 dark:text-amber-300 ml-2">
                      {getSelectedPeage(Number(formData.peagesDroit))?.libPeage}
                    </span>
                    {showCodeRight && (
                      <span className="text-xs text-amber-600/70 dark:text-amber-400/70 ml-2">
                        ({getSelectedPeage(Number(formData.peagesDroit))?.codPeage})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

       

          {/* Actions du formulaire */}
          <div className="form-actions flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>

            <button
              type="submit"
              className="btn-submit flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEdit ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}