"use client";

import { useState } from "react";
import { Save, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface CategorieTypeFormProps {
  mode: 'add' | 'edit';
  initialData: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

class CategorieTypeValidator {
  static validateCreation(typeData: any): string[] {
    const errors: string[] = [];
    
    if (!typeData.libelle || typeData.libelle.trim() === '') {
      errors.push('Le libellé est requis');
    } else if (typeData.libelle.length < 2) {
      errors.push('Le libellé doit contenir au moins 2 caractères');
    } else if (typeData.libelle.length > 50) {
      errors.push('Le libellé ne peut pas dépasser 50 caractères');
    }

    return errors;
  }

  static validateUpdate(typeData: any): string[] {
    const errors: string[] = [];
    
    if (!typeData.libelle || typeData.libelle.trim() === '') {
      errors.push('Le libellé est requis');
    } else if (typeData.libelle.length < 2) {
      errors.push('Le libellé doit contenir au moins 2 caractères');
    } else if (typeData.libelle.length > 50) {
      errors.push('Le libellé ne peut pas dépasser 50 caractères');
    }

    if (!typeData.id) {
      errors.push('ID manquant pour la modification');
    }

    return errors;
  }
}

export default function CategorieTypeForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: CategorieTypeFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState({ libelle: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = mode === 'add' 
      ? CategorieTypeValidator.validateCreation(formData)
      : CategorieTypeValidator.validateUpdate(formData);
    
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: typeof initialData) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    // Valider en temps réel après la première interaction
    if (touched.libelle) {
      const validationErrors = mode === 'add' 
        ? CategorieTypeValidator.validateCreation({ ...formData, [e.target.name]: e.target.value })
        : CategorieTypeValidator.validateUpdate({ ...formData, [e.target.name]: e.target.value });
      
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const validationErrors = mode === 'add' 
      ? CategorieTypeValidator.validateCreation(formData)
      : CategorieTypeValidator.validateUpdate(formData);
    
    setErrors(validationErrors.filter(error => 
      error.toLowerCase().includes(field) || error.includes('libellé')
    ));
  };

  const hasErrors = errors.length > 0;
  const libelleError = errors.find(error => error.includes('libellé') || error.includes('Libellé'));

  return (
    <form onSubmit={handleSubmit} className="type-form-pro space-y-6">
      {/* Champs du formulaire */}
      <div className="form-content space-y-4">
        <div className="form-field">
          <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
            <span className="w-4 h-4 mr-2">🏷️</span>
            Libellé du Type
            <span className="required text-red-500 ml-1">*</span>
          </label>
          
          <div className="input-wrapper relative">
            <input
              type="text"
              name="libelle"
              value={formData.libelle}
              onChange={handleChange}
              onBlur={() => handleBlur('libelle')}
              maxLength={50}
              className={`form-input w-full px-4 py-3 bg-amber-50/50 dark:bg-amber-900/20 border ${
                libelleError 
                  ? 'border-red-300 dark:border-red-700' 
                  : 'border-amber-200/30 dark:border-amber-700/30'
              } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors`}
              placeholder="Ex: Véhicule Léger, Poids Lourd..."
              disabled={loading}
              required
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {libelleError ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : formData.libelle && formData.libelle.length >= 2 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70">
              {formData.libelle?.length || 0}/50 caractères
            </span>
            
            {libelleError && (
              <span className="text-xs text-red-600 dark:text-red-400">
                {libelleError}
              </span>
            )}
          </div>
        </div>

        {/* ID retiré de l'affichage */}
      </div>

      {/* Messages d'erreur généraux */}
      {hasErrors && errors.filter(error => !error.includes('libellé')).length > 0 && (
        <div className="error-messages space-y-2 p-4 bg-red-50/50 dark:bg-red-900/20 rounded-xl">
          {errors.filter(error => !error.includes('libellé')).map((error, index) => (
            <div key={index} className="error-message flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Actions du formulaire */}
      <div className="form-actions flex gap-3 pt-6 border-t border-amber-200/30 dark:border-amber-700/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        
        <button
          type="submit"
          disabled={loading || hasErrors}
          className="btn-submit flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-3 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              En cours...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === 'add' ? 'Créer le type' : 'Mettre à jour'}
            </>
          )}
        </button>
      </div>

      {/* Conseils de validation */}
      {!hasErrors && formData.libelle && (
        <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            Le formulaire est valide. Vous pouvez enregistrer.
          </div>
        </div>
      )}
    </form>
  );
}