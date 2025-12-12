"use client";

import { useState } from "react";
import { Save, X, AlertCircle, User, Phone, Mail, MapPin, IdCard, Lock, Contact, Car } from "lucide-react";
import { Client, ClientCreate, ClientValidator } from "@/types/client.types";

interface ClientFormProps {
  mode: 'add' | 'edit';
  initialData: ClientCreate | Client;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ClientForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = ClientValidator.validate(formData);
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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
      numeroCNIB: value
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
      numeroTelephone: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="client-form-pro">
      <div className="form-content space-y-6">
        {/* Informations personnelles */}
        <div className="personal-info-section">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations Personnelles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
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
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Entrez le nom"
                required
              />
            </div>

            {/* Prénom */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
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
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Entrez le prénom"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Sexe */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Sexe
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                required
              >
                <option value="">Sélectionnez le sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            {/* Localité */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Localité
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="localite"
                value={formData.localite}
                onChange={handleChange}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Entrez la localité"
                required
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="contact-info-section">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Coordonnées
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléphone */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="numeroTelephone"
                value={formData.numeroTelephone}
                onChange={handleTelephoneChange}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="+226..."
                required
              />
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                Format: +226XXXXXXXX
              </p>
            </div>

            {/* Email */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          {/* CNIB */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <IdCard className="w-4 h-4 mr-2" />
                CNIB
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="numeroCNIB"
                value={formData.numeroCNIB}
                onChange={handleCnibChange}
                maxLength={20}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="B..."
                required
              />
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                Le CNIB doit commencer par B
              </p>
            </div>
          </div>
        </div>

        {/* Compte utilisateur */}
        <div className="account-info-section">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Compte Utilisateur
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Nom d'utilisateur
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Nom d'utilisateur"
                required
              />
            </div>

            {/* Password */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Mot de passe
                <span className="required text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                  }`}
                placeholder="Mot de passe"
                required
              />
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                Minimum 6 caractères
              </p>
            </div>
          </div>
        </div>

        {/* Type de client */}
        <div className="client-type-section">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Type de Client
          </h3>

          <div className="flex items-center gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="abonne"
                checked={formData.abonne}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-blue-900 dark:text-blue-100 font-medium">
                Ce client est un abonné
              </span>
            </label>
            <span className="text-xs text-blue-600/70 dark:text-blue-400/70">
              (Cocher pour activer les fonctionnalités d'abonnement)
            </span>
          </div>

          {/* Immatriculation (seulement si abonné) */}
          {formData.abonne && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="form-field">
                <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  <Car className="w-4 h-4 mr-2" />
                  Immatriculation
                  <span className="required text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="immatriculation"
                  value={formData.immatriculation || ''}
                  onChange={handleChange}
                  maxLength={20}
                  className={`form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.length > 0 ? 'border-red-300 dark:border-red-700' : ''
                    }`}
                  placeholder="Ex: AB-123-CD"
                  required
                />
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                  Champ obligatoire pour les abonnés
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Personne à contacter */}
        <div className="emergency-contact-section">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <Contact className="w-5 h-5" />
            Personne à Contacter (Urgence)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom personne à contacter */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Nom
              </label>
              <input
                type="text"
                name="nomPersonneAContacter"
                value={formData.nomPersonneAContacter}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de la personne à contacter"
              />
            </div>

            {/* Prénom personne à contacter */}
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Prénom
              </label>
              <input
                type="text"
                name="prenomPersonneAContacter"
                value={formData.prenomPersonneAContacter}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Prénom de la personne à contacter"
              />
            </div>
          </div>

          {/* Téléphone personne à contacter */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                Téléphone
              </label>
              <input
                type="text"
                name="numeroPersonneAContacter"
                value={formData.numeroPersonneAContacter}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Numéro de téléphone"
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