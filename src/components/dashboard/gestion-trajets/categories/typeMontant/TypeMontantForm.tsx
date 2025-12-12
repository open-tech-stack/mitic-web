// @/components/dashboard/gestion-trajets/categories/typeMontant/TypeMontantForm.tsx

"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, Calculator as CalculatorIcon } from "lucide-react";
import { TypeMontant } from "@/types/typeMontant.types";
import { TypeMontantValidator } from "@/types/typeMontant.types";
import toast from "react-hot-toast";
import Calculator from "@/components/ui/Calculator";

interface AmountTypeFormProps {
  mode: 'add' | 'edit';
  initialData: Omit<TypeMontant, 'id'> | TypeMontant;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel: () => void;
  existingLibelles: string[];
  existingTypes: Array<{ libelle: string; calculable?: boolean }>;
}

export default function AmountTypeForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  existingLibelles,
  existingTypes
}: AmountTypeFormProps) {
  const [formData, setFormData] = useState({
    ...initialData,
    calculable: initialData.calculable || false,
    formule: initialData.formule || ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = TypeMontantValidator.validate(formData, existingLibelles);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      try {
        // Préparer les données à envoyer
        const dataToSend = {
          ...formData,
          formule: formData.calculable ? formData.formule : ''
        };

        await onSubmit(dataToSend);
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        toast.error(
          mode === 'add'
            ? "Erreur lors de la création du type de montant"
            : "Erreur lors de la modification du type de montant"
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Veuillez corriger les erreurs du formulaire");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Si on décoche calculable, on vide la formule
        ...(name === 'calculable' && !checked ? { formule: '' } : {})
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      formule: value
    }));
  };

  const handleCalculatorButton = (value: string) => {
    if (value === "=") {
      // Évaluer la formule (simplifiée)
      try {
        const evalFormula = formData.formule
          .replace(/\[([^\]]+)\]/g, '1') // Remplacer les types par 1 pour l'évaluation
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/%/g, '/100');

        const result = eval(evalFormula);
        setFormData(prev => ({
          ...prev,
          formule: prev.formule + ` = ${result}`
        }));
      } catch (error) {
        toast.error("Impossible d'évaluer la formule");
      }
    } else {
      setFormData(prev => ({
        ...prev,
        formule: prev.formule + value
      }));
    }
  };

  const handleTypeSelect = (typeLibelle: string) => {
    setFormData(prev => ({
      ...prev,
      formule: prev.formule + `[${typeLibelle}]`
    }));
  };

  // Filtrer les types disponibles (sauf celui en cours d'édition en mode edit)
  const availableTypes = existingTypes.filter(type =>
    mode === 'edit' && 'id' in initialData
      ? type.libelle !== (initialData as TypeMontant).libelle
      : true
  );

  return (
    <form onSubmit={handleSubmit} className="amount-type-form-pro">
      <div className="form-container flex flex-col lg:flex-row gap-6">
        {/* Formulaire à gauche */}
        <div className="form-content flex-1 space-y-4">
          {/* Champ Libellé */}
          <div className="form-row">
            <div className="form-field full-width">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                <span className="w-4 h-4 mr-2">🏷️</span>
                Libellé du Type de Montant
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <div className="input-wrapper relative">
                <input
                  type="text"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleChange}
                  maxLength={100}
                  className={`form-input w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.some(e => e.includes('libellé')) ? 'border-red-300 dark:border-red-700' : ''
                    }`}
                  placeholder="Ex: Montant fixe, Calcul taxe, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Checkbox Calculable */}
          <div className="form-row">
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                <input
                  type="checkbox"
                  name="calculable"
                  checked={formData.calculable}
                  onChange={handleChange}
                  className="mr-3 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <span>Type calculable</span>
              </label>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                Si coché, ce type sera calculé à partir d'une formule
              </p>
            </div>
          </div>

          {/* Champ Formule (visible seulement si calculable) */}
          {formData.calculable && (
            <div className="form-row">
              <div className="form-field full-width">
                <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Formule de calcul
                  <span className="required text-red-500 ml-1">*</span>
                </label>
                <div className="input-wrapper relative">
                  <input
                    type="text"
                    name="formule"
                    value={formData.formule}
                    onChange={handleFormulaChange}
                    className={`form-input w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono ${errors.some(e => e.includes('formule')) ? 'border-red-300 dark:border-red-700' : ''
                      }`}
                    placeholder="Ex: [Type1] + [Type2] * 0.2"
                    required
                  />
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                  Utilisez les types entre crochets [] et les opérateurs mathématiques
                </p>
              </div>

              {/* Liste des types disponibles pour la formule */}
              <div className="available-types mt-4">
                <div className="text-xs font-medium text-amber-600/70 dark:text-amber-400/70 mb-2">
                  Types disponibles pour la formule:
                </div>
                <div className="types-grid grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[80px] overflow-y-auto p-2 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg">
                  {availableTypes.map((type) => (
                    <button
                      key={type.libelle}
                      type="button"
                      onClick={() => handleTypeSelect(type.libelle)}
                      className="type-tag px-2 py-1 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs truncate hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
                      title={`Insérer ${type.libelle}`}
                    >
                      {type.libelle}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages d'erreur */}
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

        {/* Calculatrice à droite (visible seulement si calculable) */}
        {formData.calculable && (
          <div className="lg:w-1/2">
            <div className="h-full">
              <Calculator
                onButtonClick={handleCalculatorButton}
                onTypeSelect={handleTypeSelect}
                existingTypes={availableTypes}
                currentFormula={formData.formule}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions du formulaire */}
      <div className="form-actions flex gap-3 pt-6 mt-6 border-t border-amber-200/30 dark:border-amber-700/30">
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