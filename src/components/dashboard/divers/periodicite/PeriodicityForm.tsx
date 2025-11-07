// @/components/dashboard/divers/periodicite/PeriodicityForm.tsx

"use client";

import { useState } from "react";
import { Save, X, AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { Periodicite } from "@/types/periodicity.types";

// Utilitaires de validation
export class PeriodicityValidator {
  static validate(periodicity: Partial<Periodicite>): string[] {
    const errors: string[] = [];
    
    if (!periodicity.libelle?.trim()) {
      errors.push('Le libellé est requis');
    } else if (periodicity.libelle.trim().length > 100) {
      errors.push('Le libellé ne peut pas dépasser 100 caractères');
    }

    return errors;
  }
}

interface PeriodicityFormProps {
  mode: 'add' | 'edit';
  initialData: Omit<Periodicite, 'id'> | Periodicite;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  hasActivePeriodicity: boolean;
}

export default function PeriodicityForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  hasActivePeriodicity 
}: PeriodicityFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = PeriodicityValidator.validate(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Si on active cette période et qu'il y a déjà une période active, 
    // afficher une confirmation
    if (name === "actif" && checked && hasActivePeriodicity && mode === "add") {
      if (!confirm("Une période est déjà active. L'activation de cette nouvelle période désactivera l'actuelle. Continuer ?")) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="periodicity-form-pro">
      {/* Champs du formulaire */}
      <div className="form-content space-y-4">
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <span className="w-4 h-4 mr-2">🏷️</span>
              Libellé de la Périodicité
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="text"
                name="libelle"
                value={formData.libelle}
                onChange={handleChange}
                maxLength={100}
                className={`form-input w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                }`}
                placeholder="Ex: Mensuelle"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              Statut
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors ${
                  formData.actif 
                    ? 'bg-amber-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.actif ? 'transform translate-x-5' : ''
                  }`}></div>
                </div>
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  {formData.actif ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      Inactif
                    </span>
                  )}
                </span>
              </label>
            </div>
            
            {hasActivePeriodicity && formData.actif && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    Une période est déjà active. L'activation de celle-ci désactivera automatiquement l'autre.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="error-messages space-y-2 mt-3">
            {errors.map((error, index) => (
              <div key={index} className="error-message flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
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
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
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
              {mode === 'add' ? 'Enregistrer' : 'Modifier'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}