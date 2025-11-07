// @/components/dashboard/operations/operation-montant-type/OperationMontantTypeForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle } from "lucide-react";
import { OperationMontantType } from "@/types/operationMontantType.types";
import { OperationMontantTypeValidator } from "@/types/operationMontantType.types";
import { TypeOperation } from "@/types/typeOperation.types";
import { TypeMontant } from "@/types/typeMontant.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface OperationMontantTypeFormProps {
  mode: 'add' | 'edit';
  initialData?: Omit<OperationMontantType, 'id'> | OperationMontantType;
  onSubmit: (data: Omit<OperationMontantType, 'id'>) => void;
  onCancel: () => void;
  existingAssociations: OperationMontantType[];
}

export default function OperationMontantTypeForm({ 
  mode,
  initialData,
  onSubmit, 
  onCancel, 
  existingAssociations 
}: OperationMontantTypeFormProps) {
  const [formData, setFormData] = useState<Omit<OperationMontantType, 'id'>>({
    idTypeOperation: initialData?.idTypeOperation || 0,
    idTypeMontant: initialData?.idTypeMontant || 0
  });
  const [typesOperation, setTypesOperation] = useState<TypeOperation[]>([]);
  const [typesMontant, setTypesMontant] = useState<TypeMontant[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const typeOperationService = ServiceFactory.createTypeOperationService();
        const typeMontantService = ServiceFactory.createTypeMontantService();
        
        const [operations, montants] = await Promise.all([
          typeOperationService.loadAll(),
          typeMontantService.loadAll()
        ]);
        
        setTypesOperation(operations);
        setTypesMontant(montants);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des dépendances:', error);
        setLoading(false);
      }
    };

    loadDependencies();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = OperationMontantTypeValidator.validate(formData, existingAssociations);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3 text-amber-900 dark:text-amber-100">Chargement...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="operation-montant-type-form-pro">
      <div className="form-content space-y-4">
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <span className="w-4 h-4 mr-2">⚡</span>
              Type d'Opération
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <select
              name="idTypeOperation"
              value={formData.idTypeOperation}
              onChange={handleChange}
              className={`form-select w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.some(e => e.includes('opération')) ? 'border-red-300 dark:border-red-700' : ''
              }`}
              required
            >
              <option value={0}>Sélectionnez un type d'opération</option>
              {typesOperation.map(type => (
                <option key={type.id} value={type.id}>
                  {type.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <span className="w-4 h-4 mr-2">💰</span>
              Type de Montant
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <select
              name="idTypeMontant"
              value={formData.idTypeMontant}
              onChange={handleChange}
              className={`form-select w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.some(e => e.includes('montant')) ? 'border-red-300 dark:border-red-700' : ''
              }`}
              required
            >
              <option value={0}>Sélectionnez un type de montant</option>
              {typesMontant.map(type => (
                <option key={type.id} value={type.id}>
                  {type.libelle}
                </option>
              ))}
            </select>
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
          disabled={isSubmitting || formData.idTypeOperation === 0 || formData.idTypeMontant === 0}
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