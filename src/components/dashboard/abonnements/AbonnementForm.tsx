"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, User, Calendar, DollarSign, Clock, MapPin, Tag } from "lucide-react";
import { Abonnement, AbonnementCreate, AbonnementUpdate } from "@/types/abonnement.types";
import { Abonne } from "@/types/abonne.types";
import { Peage } from "@/types/peage.types";
import { AbonnementTarif } from "@/types/period-tarif.types";
import { AbonnementValidator } from "@/types/abonnement.types";

interface AbonnementFormProps {
  mode: 'add' | 'edit';
  initialData: AbonnementCreate | Abonnement;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  abonnes: Abonne[];
  peages: Peage[];
  tarifsAbonnement: AbonnementTarif[];
}

export default function AbonnementForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  abonnes,
  peages,
  tarifsAbonnement
}: AbonnementFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAbonne, setSelectedAbonne] = useState<Abonne | null>(null);
  const [selectedPeage, setSelectedPeage] = useState<Peage | null>(null);
  const [selectedTarif, setSelectedTarif] = useState<AbonnementTarif | null>(null);

  // Mettre à jour les sélections quand les données changent
  useEffect(() => {
    const abonne = abonnes.find(a => a.id === formData.abonneId) || null;
    setSelectedAbonne(abonne);

    const peage = peages.find(p => p.id === formData.peage) || null;
    setSelectedPeage(peage);

    const tarif = tarifsAbonnement.find(t => t.id === formData.tarifId) || null;
    setSelectedTarif(tarif);
  }, [formData.abonneId, formData.peage, formData.tarifId, abonnes, peages, tarifsAbonnement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = AbonnementValidator.validate(formData);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Formater l'affichage du tarif pour le select
  const formatTarifDisplay = (tarif: AbonnementTarif) => {
    const essieux = tarif.nbreEssieux ? `-${tarif.nbreEssieux}essieux` : '';
    return `${tarif.libelle}${essieux}-${tarif.periodelibelle}-${tarif.montant.toLocaleString('fr-FR')}F`;
  };

  return (
    <form onSubmit={handleSubmit} className="abonnement-form-pro">
      <div className="form-content space-y-6">
        {/* Sélection de l'abonné */}
        <div className="abonne-selection-section">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Sélection de l'Abonné
            <span className="required text-red-500 ml-1">*</span>
          </h3>

          {abonnes.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Aucun abonné disponible. Veuillez d'abord créer des abonnés.
              </p>
            </div>
          ) : (
            <>
              <select
                name="abonneId"
                value={formData.abonneId}
                onChange={handleChange}
                className={`form-select w-full px-3 py-2 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                required
                disabled={mode === 'edit'}
              >
                <option value={0}>Sélectionnez un abonné</option>
                {abonnes.map(abonne => (
                  <option key={abonne.id} value={abonne.id}>
                    {abonne.nom} {abonne.prenom}
                  </option>
                ))}
              </select>

              {/* Informations de l'abonné sélectionné */}
              {selectedAbonne && (
                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Informations de l'abonné sélectionné :
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-purple-600/70 dark:text-purple-400/70">Nom :</span>
                      <span className="ml-2 text-purple-900 dark:text-purple-100">
                        {selectedAbonne.nom} {selectedAbonne.prenom}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-600/70 dark:text-purple-400/70">Téléphone :</span>
                      <span className="ml-2 text-purple-900 dark:text-purple-100">
                        {selectedAbonne.nbreTel}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-600/70 dark:text-purple-400/70">Immatriculation :</span>
                      <span className="ml-2 text-purple-900 dark:text-purple-100">
                        {selectedAbonne.immatriculation}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-600/70 dark:text-purple-400/70">CNIB :</span>
                      <span className="ml-2 text-purple-900 dark:text-purple-100">
                        {selectedAbonne.cnib}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sélection du péage */}
        <div className="peage-selection-section">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Sélection du Péage
            <span className="required text-red-500 ml-1">*</span>
          </h3>

          {peages.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Aucun péage disponible.
              </p>
            </div>
          ) : (
            <>
              <select
                name="peage"
                value={formData.peage}
                onChange={handleChange}
                className={`form-select w-full px-3 py-2 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                required
              >
                <option value={0}>Sélectionnez un péage</option>
                {peages.map(peage => (
                  <option key={peage.id} value={peage.id}>
                    {peage.libPeage}
                  </option>
                ))}
              </select>

              {/* Informations du péage sélectionné */}
              {selectedPeage && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Informations du péage sélectionné :
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600/70 dark:text-blue-400/70">Nom :</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-100">
                        {selectedPeage.libPeage}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600/70 dark:text-blue-400/70">Localité :</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-100">
                        {selectedPeage.libLoc}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600/70 dark:text-blue-400/70">Code :</span>
                      <span className="ml-2 text-blue-900 dark:text-blue-100">
                        {selectedPeage.codPeage}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sélection du tarif d'abonnement */}
        <div className="tarif-selection-section">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Sélection du Tarif d'Abonnement
            <span className="required text-red-500 ml-1">*</span>
          </h3>

          {tarifsAbonnement.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Aucun tarif d'abonnement disponible.
              </p>
            </div>
          ) : (
            <>
              <select
                name="tarifId"
                value={formData.tarifId}
                onChange={handleChange}
                className={`form-select w-full px-3 py-2 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                required
              >
                <option value={0}>Sélectionnez un tarif d'abonnement</option>
                {tarifsAbonnement.map(tarif => (
                  <option key={tarif.id} value={tarif.id}>
                    {formatTarifDisplay(tarif)}
                  </option>
                ))}
              </select>

              {/* Informations du tarif sélectionné */}
              {selectedTarif && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Informations du tarif sélectionné :
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-600/70 dark:text-green-400/70">Catégorie :</span>
                      <span className="ml-2 text-green-900 dark:text-green-100">
                        {selectedTarif.libelle}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-600/70 dark:text-green-400/70">Périodicité :</span>
                      <span className="ml-2 text-green-900 dark:text-green-100">
                        {selectedTarif.periodelibelle}
                      </span>
                    </div>
                    {selectedTarif.nbreEssieux && (
                      <div>
                        <span className="text-green-600/70 dark:text-green-400/70">Nombre d'essieux :</span>
                        <span className="ml-2 text-green-900 dark:text-green-100">
                          {selectedTarif.nbreEssieux}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-green-600/70 dark:text-green-400/70">Montant :</span>
                      <span className="ml-2 text-green-900 dark:text-green-100 font-bold">
                        {selectedTarif.montant.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Date de début */}
        <div className="date-debut-section">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date de Début
            <span className="required text-red-500 ml-1">*</span>
          </h3>

          <div className="form-field">
            <input
              type="date"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              min={getTodayDate()}
              className={`form-input w-full px-3 py-2 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                }`}
              required
            />
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
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-200/50 dark:hover:bg-purple-800/30 transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-submit flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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