// @/components/dashboard/comptes/type/compteTypeForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, CreditCard } from "lucide-react";
import { CompteType, CompteTypeValidator } from "@/types/typeCompte.types";

interface CompteTypeFormProps {
  type?: CompteType; // Optionnel - si fourni, c'est une modification
  onSubmit: (data: CompteType | Omit<CompteType, 'id'>) => void;
  onCancel: () => void;
}

export default function CompteTypeForm({ type, onSubmit, onCancel }: CompteTypeFormProps) {
  const isEdit = !!type;
  const [formData, setFormData] = useState<Omit<CompteType, 'id'>>({ 
    libelle: type?.libelle || '' 
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour le formulaire si le type change (utile pour la modification)
  useEffect(() => {
    if (type) {
      setFormData({ libelle: type.libelle });
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = CompteTypeValidator.validateCreation(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      
      if (isEdit && type) {
        // Mode modification - retourner l'objet complet avec l'ID
        onSubmit({ ...formData, id: type.id });
      } else {
        // Mode ajout - retourner seulement les données sans ID
        onSubmit(formData);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      libelle: e.target.value
    }));
    
    // Effacer les erreurs quand l'utilisateur tape
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="type-form-pro">
      {/* Champs du formulaire */}
      <div className="form-content">
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Libellé du Type de Compte
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="text"
                value={formData.libelle}
                onChange={handleChange}
                maxLength={50}
                className={`form-input w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                }`}
                placeholder="Ex: Compte courant"
                required
                autoFocus
              />
              <span className="input-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600/70 dark:text-amber-400/70">
                📝
              </span>
            </div>
            
            {/* Messages d'erreur */}
            {errors.length > 0 && (
              <div className="error-messages space-y-2 mt-3">
                {errors.map((error, index) => (
                  <div key={index} className="error-message flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
            
            {/* Compteur de caractères */}
            <div className="character-count mt-2 text-right text-xs text-amber-600/70 dark:text-amber-400/70">
              {formData.libelle.length}/50
            </div>
          </div>
        </div>
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
          disabled={isSubmitting || !formData.libelle.trim()}
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
              {isEdit ? 'Modifier' : 'Ajouter'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}