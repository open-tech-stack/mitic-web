"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, Calendar, DollarSign, Car, Truck, Axe } from "lucide-react";
import { AbonnementTarifCreate, AbonnementTarif, CreationInfo, AbonnementTarifValidator } from "@/types/period-tarif.types";

interface AbonnementTarifFormProps {
  mode: 'add' | 'edit';
  initialData: AbonnementTarifCreate | AbonnementTarif;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  creationInfo: CreationInfo | null;
}

export default function AbonnementTarifForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  creationInfo
}: AbonnementTarifFormProps) {
  const [formData, setFormData] = useState<AbonnementTarifCreate>(() => {
    // Si c'est un AbonnementTarif (données du backend), convertir en AbonnementTarifCreate
    if ('libelle' in initialData) {
      return {
        type: initialData.libelle,
        periodicite: initialData.periodelibelle,
        nombre_essieux: initialData.nbreEssieux,
        montant: initialData.montant
      };
    }
    return initialData;
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Réinitialiser le nombre d'essieux si le type change et n'est plus poids lourd
    if (creationInfo) {
      const isPoidsLourd = creationInfo.categorieDto.some(cat =>
        cat.libelle[0] === formData.type &&
        AbonnementTarifValidator.isPoidsLourd(cat.libelle[0])
      );

      if (!isPoidsLourd && formData.nombre_essieux) {
        setFormData(prev => ({
          ...prev,
          nombre_essieux: undefined
        }));
      }
    }
  }, [formData.type, creationInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = AbonnementTarifValidator.validate(formData);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);

      // Préparer les données pour l'envoi
      const submitData = {
        ...formData,
        nombre_essieux: formData.nombre_essieux || undefined
      };

      onSubmit(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'montant' || name === 'nombre_essieux' ?
        (value ? parseInt(value) : undefined) : value
    }));
  };

  // Vérifications de sécurité
  const isPoidsLourdSelected = creationInfo ?
    AbonnementTarifValidator.isPoidsLourd(formData.type) : false;

  const categories = creationInfo?.categorieDto || [];
  const periodicites = creationInfo?.periodicityAbonnementDtos || [];
  const nbreEssieux = creationInfo?.nbreEssieux || [];

  if (!creationInfo) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-900 dark:text-blue-100">Chargement des informations...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="abonnement-tarif-form-pro">
      <div className="form-content space-y-4">
        {/* Sélection du type de véhicule */}
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              <Car className="w-4 h-4 mr-2" />
              Type de Véhicule
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`form-select w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                required
              >
                <option value="">Sélectionnez un type</option>
                {categories.map(categorie => (
                  <option key={categorie.id} value={categorie.libelle[0]}>
                    {categorie.libelle[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sélection du nombre d'essieux (uniquement pour poids lourds) */}
        {isPoidsLourdSelected && (
          <div className="form-row">
            <div className="form-field full-width">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <Truck className="w-4 h-4 mr-2" />
                Nombre d'Essieux
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <div className="input-wrapper relative">
                <select
                  name="nombre_essieux"
                  value={formData.nombre_essieux || ''}
                  onChange={handleChange}
                  className={`form-select w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                    }`}
                  required
                >
                  <option value="">Sélectionnez le nombre d'essieux</option>
                  {nbreEssieux.map((essieux, index) => (
                    <option key={index} value={essieux}>
                      {essieux} essieux
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                Champ obligatoire pour les poids lourds
              </p>
            </div>
          </div>
        )}

        {/* Sélection de la périodicité */}
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Périodicité
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <select
                name="periodicite"
                value={formData.periodicite}
                onChange={handleChange}
                className={`form-select w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                required
              >
                <option value="">Sélectionnez une périodicité</option>
                {periodicites.map((period) => (
                  <option key={period.id} value={period.periodicityName}>
                    {period.periodicityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Champ montant */}
        <div className="form-row">
          <div className="form-field full-width">
            <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              <DollarSign className="w-4 h-4 mr-2" />
              Montant (FCFA)
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="number"
                name="montant"
                value={formData.montant}
                onChange={handleChange}
                min="0"
                max="1000000"
                step="1"
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="0"
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
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-submit flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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