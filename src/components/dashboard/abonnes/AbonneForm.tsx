"use client";

import { useState } from "react";
import { Save, X, AlertCircle, User, Phone, Car, IdCard } from "lucide-react";
import { Abonne, AbonneCreate, AbonneUpdate } from "@/types/abonne.types";
import { AbonneValidator } from "@/types/abonne.types";

interface AbonneFormProps {
  mode: 'add' | 'edit';
  initialData: AbonneCreate | Abonne;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function AbonneForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: AbonneFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = AbonneValidator.validate(formData);
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

  const handleCnibChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // S'assurer que le CNIB commence toujours par B
    if (!value.startsWith('B')) {
      value = 'B' + value.replace(/^B/, '');
    }

    setFormData(prev => ({
      ...prev,
      cnib: value
    }));
  };

  const handleTelephoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // S'assurer que le téléphone commence toujours par +226
    if (!value.startsWith('+226')) {
      value = '+226' + value.replace(/^\+226/, '');
    }

    setFormData(prev => ({
      ...prev,
      nbreTel: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="abonne-form-pro">
      {/* Champs du formulaire */}
      <div className="form-content space-y-6">
        {/* Informations personnelles */}
        <div className="personal-info-section">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations Personnelles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Nom
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                maxLength={50}
                className={`form-input w-full px-3 py-2 bg-green-50/50 dark:bg-green-900/20 border border-green-200/30 dark:border-green-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Entrez le nom"
                required
              />
            </div>

            {/* Prénom */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Prénom
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                maxLength={50}
                className={`form-input w-full px-3 py-2 bg-green-50/50 dark:bg-green-900/20 border border-green-200/30 dark:border-green-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Entrez le prénom"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* CNIB */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                <IdCard className="w-4 h-4 mr-2" />
                CNIB
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="cnib"
                value={formData.cnib}
                onChange={handleCnibChange}
                maxLength={20}
                className={`form-input w-full px-3 py-2 bg-green-50/50 dark:bg-green-900/20 border border-green-200/30 dark:border-green-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="B..."
                required
              />
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                Le CNIB doit commencer par B
              </p>
            </div>

            {/* Téléphone */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="nbreTel"
                value={formData.nbreTel}
                onChange={handleTelephoneChange}
                className={`form-input w-full px-3 py-2 bg-green-50/50 dark:bg-green-900/20 border border-green-200/30 dark:border-green-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="+226..."
                required
              />
              <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                Format: +226XXXXXXXX
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            {/* Immatriculation */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                <Car className="w-4 h-4 mr-2" />
                Immatriculation
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="immatriculation"
                value={formData.immatriculation}
                onChange={handleChange}
                maxLength={20}
                className={`form-input w-full px-3 py-2 bg-green-50/50 dark:bg-green-900/20 border border-green-200/30 dark:border-green-700/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Ex: AB-123-CD"
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
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-xl hover:bg-green-200/50 dark:hover:bg-green-800/30 transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-submit flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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