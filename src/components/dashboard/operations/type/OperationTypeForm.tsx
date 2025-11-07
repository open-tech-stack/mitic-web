// @/components/dashboard/operations/type/OperationTypeForm.tsx
"use client";

import { useState } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import { TypeOperation } from "@/types/typeOperation.types";
import { TypeOperationValidator } from "@/types/typeOperation.types";

interface OperationTypeFormProps {
  mode: 'add' | 'edit';
  initialData: Omit<TypeOperation, 'id'> | TypeOperation;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  existingLibelles: string[];
}

export default function OperationTypeForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  existingLibelles 
}: OperationTypeFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = TypeOperationValidator.validate(formData, existingLibelles);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="operation-type-form-pro">
      {/* Champs du formulaire */}
      <div className="form-content space-y-4">
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <span className="w-4 h-4 mr-2">🏷️</span>
              Libellé du Type d'Opération
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
                  errors.some(e => e.includes('libellé')) ? 'border-red-300 dark:border-red-700' : ''
                }`}
                placeholder="Ex: Opération principale"
                required
              />
            </div>
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