"use client";

import { useState, useEffect } from "react";
import {
  Save,
  X,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  Tag,
  Hash,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import {
  Compte,
  CompteValidator,
  CompteCreateData,
} from "@/types/compte.types";
import { CompteType } from "@/types/typeCompte.types";
import { User as UserType } from "@/types/user.types";
import { OrganizationalUnit } from "@/types/uo.types";
import { Pcg } from "@/types/pcg.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface CompteFormProps {
  compte?: Compte;
  onSubmit: (data: CompteCreateData | Compte) => void;
  onCancel: () => void;
}

export default function CompteForm({
  compte,
  onSubmit,
  onCancel,
}: CompteFormProps) {
  const isEdit = !!compte;

  // État principal du formulaire
  const [formData, setFormData] = useState<CompteCreateData>({
    libelle: compte?.libelle || "",
    numeroCompte: compte?.numeroCompte || "",
    typeCompte: compte?.typeCompte || 0,
    user: compte?.user || null,
    nom: compte?.nom || "",
    prenom: compte?.prenom || "",
    numPerteProfits: compte?.numPerteProfits || "",
    codeUo: compte?.codeUo || null,
    libelleUo: compte?.libelleUo || "",
    dateCreation: compte?.dateCreation || new Date(),
    pcgNumero: compte?.pcgNumero || "",
    path: compte?.path || "",
    pcgNumeroPerteProfits: compte?.pcgNumeroPerteProfits || "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUtilisateur, setIsUtilisateur] = useState(!!compte?.user);
  const [compteTypes, setCompteTypes] = useState<CompteType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [uos, setUos] = useState<OrganizationalUnit[]>([]);
  const [pcgs, setPcgs] = useState<Pcg[]>([]);

  const [selectedCompteType, setSelectedCompteType] = useState<CompteType | null>(null);
  const [showGainFields, setShowGainFields] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const typeService = ServiceFactory.createCompteTypeService();
        const uoService = ServiceFactory.createUoService();
        const userService = ServiceFactory.createUserService();
        const compteService = ServiceFactory.createCompteService();

        const [types, uosResult, users, pcgsList] = await Promise.all([
          typeService.loadAll(),
          uoService.loadAll(),
          userService.loadAllUsers(),
          compteService.getAvailablePcgs(),
        ]);

        setCompteTypes(types);
        if (uosResult.success) {
          setUos(uoService.getUnits());
        }
        setUsers(users);
        setPcgs(pcgsList);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    loadData();

    if (compte) {
      setFormData({
        libelle: compte.libelle,
        numeroCompte: compte.numeroCompte,
        typeCompte: compte.typeCompte,
        user: compte.user,
        nom: compte.nom || "",
        prenom: compte.prenom || "",
        numPerteProfits: compte.numPerteProfits || "",
        codeUo: compte.codeUo,
        libelleUo: compte.libelleUo || "",
        dateCreation: compte.dateCreation,
        pcgNumero: compte.pcgNumero,
        path: compte.path || "",
        pcgNumeroPerteProfits: compte.pcgNumeroPerteProfits || "",
      });
      setIsUtilisateur(!!compte.user);

      // En mode édition, déterminer le type de compte
      const type = compteTypes.find(t => t.id === compte.typeCompte);
      setSelectedCompteType(type || null);
      // En mode édition, on ne montre PAS la section gain
      setShowGainFields(false);
    }
  }, [compte]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      // Les paths sont déjà dans formData via handlePcgChange
    };

    const validationErrors = CompteValidator.validate(submissionData, isEdit);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);

      if (isEdit && compte) {
        // Mode modification
        onSubmit({ ...submissionData, id: compte.id } as Compte);
      } else {
        // Mode ajout
        onSubmit(submissionData);
      }
    }
  };

  // 🔥 NOUVEAU: Fonction pour déterminer les labels selon le type de compte
  const getGainFieldLabels = () => {
    if (!selectedCompteType) return { numeroLabel: '', pcgLabel: '' };

    const isCaisse = selectedCompteType.libelle?.toLowerCase().includes('caisse');
    const isAgent = selectedCompteType.libelle?.toLowerCase().includes('agent');

    if (isCaisse) {
      return {
        numeroLabel: 'Numéro Compte Perte et Profit *',
        pcgLabel: 'PCG Perte et Profit *'
      };
    } else if (isAgent) {
      return {
        numeroLabel: 'Numéro Compte Gain *',
        pcgLabel: 'PCG Compte Gain *'
      };
    }

    return { numeroLabel: '', pcgLabel: '' };
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "typeCompte" || name === "user"
          ? Number(value) || null
          : value,
    }));

    // 🔥 Gestion spéciale pour le type de compte en mode ajout
    if (name === "typeCompte" && !isEdit) {
      const selectedType = compteTypes.find(
        (type) => type.id === Number(value)
      );
      setSelectedCompteType(selectedType || null);

      const isAvecGain = selectedType?.libelle?.toLowerCase().includes('caisse') ||
        selectedType?.libelle?.toLowerCase().includes('agent') ||
        false;
      setShowGainFields(isAvecGain);

      // Réinitialiser les champs gain si on change de type
      if (!isAvecGain) {
        setFormData((prev) => ({
          ...prev,
          numPerteProfits: "",
          pcgNumeroPerteProfits: "",
        }));
      }
    }

    // Effacer les erreurs quand l'utilisateur modifie
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handlePcgChange = (
    field: "pcgNumero" | "pcgNumeroPerteProfits",
    value: string
  ) => {
    const selectedPcg = pcgs.find((pcg) => pcg.numeroCompte === value);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      path: field === "pcgNumero" ? selectedPcg?.path || "" : prev.path,
    }));
  };

  const toggleEntityType = () => {
    const newIsUtilisateur = !isUtilisateur;
    setIsUtilisateur(newIsUtilisateur);

    setFormData((prev) => ({
      ...prev,
      user: newIsUtilisateur ? prev.user : null,
      codeUo: !newIsUtilisateur ? prev.codeUo : null,
    }));

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="compte-form-pro">
      <div className="form-content space-y-6">
        {/* Libellé et Numéro */}
        <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Tag className="w-4 h-4 mr-2" />
              Libellé du Compte *
            </label>
            <div className="input-wrapper relative">
              <input
                type="text"
                name="libelle"
                value={formData.libelle}
                onChange={handleChange}
                maxLength={100}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: Compte principal"
                required
                autoFocus
              />
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Hash className="w-4 h-4 mr-2" />
              Numéro de Compte *
            </label>
            <div className="input-wrapper relative">
              <input
                type="text"
                name="numeroCompte"
                value={formData.numeroCompte}
                onChange={handleChange}
                maxLength={15}
                pattern="[0-9]{10,15}"
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-700/30 rounded-xl font-mono text-sm"
                placeholder="10 à 15 chiffres"
                required
              />
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
        </div>

        {/* PCG Principal */}
        <div className="form-row">
          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <BookOpen className="w-4 h-4 mr-2" />
              PCG Associé *
            </label>
            <div className="input-wrapper relative">
              <select
                name="pcgNumero"
                value={formData.pcgNumero}
                onChange={(e) => handlePcgChange("pcgNumero", e.target.value)}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez un PCG...</option>
                {pcgs.map((pcg) => (
                  <option key={pcg.path} value={pcg.numeroCompte}>
                    {pcg.path} - {pcg.libelle}
                  </option>
                ))}
              </select>
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
            {formData.pcgNumero && (
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                Path sélectionné: {formData.path}
              </p>
            )}
          </div>
        </div>

        {/* Type de compte et Type d'entité */}
        <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Type de Compte *
            </label>
            <div className="input-wrapper relative">
              <select
                name="typeCompte"
                value={formData.typeCompte || ""}
                onChange={handleChange}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="">Sélectionnez un type...</option>
                {compteTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.libelle}
                  </option>
                ))}
              </select>
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Building2 className="w-4 h-4 mr-2" />
              Type d'Entité
            </label>
            <div className="toggle-wrapper">
              <button
                type="button"
                onClick={toggleEntityType}
                className={`toggle-button flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${isUtilisateur
                    ? "bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200"
                    : "bg-purple-100/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-200"
                  }`}
              >
                {isUtilisateur ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    <User className="w-4 h-4" />
                    <span className="font-medium">Utilisateur</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">Unité Organisationnelle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* COMPTES AVEC GAIN (Caisse ou Agent) - UNIQUEMENT en mode ajout */}
        {!isEdit && showGainFields && (
          <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                {getGainFieldLabels().numeroLabel}
              </label>
              <div className="input-wrapper relative">
                <input
                  type="text"
                  name="numPerteProfits"
                  value={formData.numPerteProfits}
                  onChange={handleChange}
                  className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder={
                    selectedCompteType?.libelle?.toLowerCase().includes('caisse')
                      ? "Numéro de compte perte et profit"
                      : "Numéro de compte gain"
                  }
                  required
                />
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                {getGainFieldLabels().pcgLabel}
              </label>
              <div className="input-wrapper relative">
                <select
                  name="pcgNumeroPerteProfits"
                  value={formData.pcgNumeroPerteProfits}
                  onChange={(e) =>
                    handlePcgChange("pcgNumeroPerteProfits", e.target.value)
                  }
                  className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez un PCG...</option>
                  {pcgs.map((pcg) => (
                    <option key={`gain-${pcg.path}`} value={pcg.numeroCompte}>
                      {pcg.path} - {pcg.libelle}
                    </option>
                  ))}
                </select>
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>
          </div>
        )}

        {/* Sélection d'entité */}
        <div className="form-row">
          {isUtilisateur ? (
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                <User className="w-4 h-4 mr-2" />
                Utilisateur *
              </label>
              <div className="input-wrapper relative">
                <select
                  name="user"
                  value={formData.user || ""}
                  onChange={handleChange}
                  className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez un utilisateur...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nom} {user.prenom} ({user.username})
                    </option>
                  ))}
                </select>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>
          ) : (
            <div className="form-field">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                <Building2 className="w-4 h-4 mr-2" />
                Unité Organisationnelle *
              </label>
              <div className="input-wrapper relative">
                <select
                  name="codeUo"
                  value={formData.codeUo || ""}
                  onChange={handleChange}
                  className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez une UO...</option>
                  {uos.map((uo) => (
                    <option key={uo.codeUo} value={uo.codeUo}>
                      {uo.libUo} ({uo.codeUo})
                    </option>
                  ))}
                </select>
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              </div>
            </div>
          )}
        </div>

        {/* Messages d'erreur */}
        {errors.length > 0 && (
          <div className="error-messages space-y-2">
            {errors.map((error, index) => (
              <div
                key={index}
                className="error-message flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
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
          disabled={isSubmitting}
          className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {isEdit ? "Modifier" : "Ajouter"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}