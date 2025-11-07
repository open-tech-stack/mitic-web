"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldUser,
  Building2,
  X,
  Save,
  UserPlus,
  Key,
  MapPin,
  Ticket,
  ArrowRightLeft,
} from "lucide-react";
import { User, CreateUserRequest, UpdateUserRequest } from "@/types/user.types";
import { Role } from "@/types/security.types";
import { OrganizationalUnit } from "@/types/uo.types";
import { Localite } from "@/types/localite.types";
import { Peage } from "@/types/peage.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface UserFormProps {
  organizationalUnits: OrganizationalUnit[];
  roles: Role[];
  userData?: User | null;
  allowPasswordEdit?: boolean;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
}

export default function UserForm({
  organizationalUnits,
  roles,
  userData = null,
  allowPasswordEdit = true,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    nom: "",
    prenom: "",
    username: "",
    password: "",
    codeUo: null,
    roleId: 0,
    localiteId: null,
    peageId: null,
    sens: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localites, setLocalites] = useState<Localite[]>([]);
  const [peages, setPeages] = useState<Peage[]>([]);
  const [loadingLocalites, setLoadingLocalites] = useState(false);
  const [loadingPeages, setLoadingPeages] = useState(false);

  const isEditMode = !!userData;
  
  // Initialisation des services via la factory
  const localiteService = ServiceFactory.createLocaliteService();
  const peageService = ServiceFactory.createPeageService();

  // Vérifier si le rôle sélectionné est "agent"
  const isAgentRole = () => {
    if (!formData.roleId) return false;
    const role = roles.find((r) => r.id === formData.roleId);
    if (!role) return false;

    const roleName = role.name.toLowerCase();
    return roleName.includes("agent") || roleName.includes("agen");
  };

  // Vérifier si le rôle sélectionné est "caisse"
const isCaisseRole = () => {
  if (!formData.roleId) return false;
  const role = roles.find((r) => r.id === formData.roleId);
  if (!role) return false;

  const roleName = role.name.toLowerCase();
  return (
    roleName.includes("caisse") ||
    roleName.includes("caissier") ||
    roleName.includes("caissier_principale")
  );
};

  useEffect(() => {
    if (userData) {
      setFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        username: userData.username || "",
        password: "userData.password" in userData ? userData.password || "" : "",
        codeUo: userData.codeUo || null,
        roleId: userData.roleId || 0,
        localiteId: userData.localiteId || null,
        peageId: userData.peageId || null,
        sens: userData.sens || null,
      });
    }

    // Charger les localités et péages
    loadLocalites();
    loadPeages();
  }, [userData]);

  const loadLocalites = async () => {
    setLoadingLocalites(true);
    try {
      const localitesData = await localiteService.loadAllLocalites();
      setLocalites(localitesData);
    } catch (error) {
      console.error("Erreur lors du chargement des localités:", error);
    } finally {
      setLoadingLocalites(false);
    }
  };

  const loadPeages = async () => {
    setLoadingPeages(true);
    try {
      const peagesData = await peageService.loadAllPeages();
      setPeages(peagesData);
    } catch (error) {
      console.error("Erreur lors du chargement des péages:", error);
    } finally {
      setLoadingPeages(false);
    }
  };

  const validateField = (name: string, value: string | number | null) => {
    let error = "";

    if (
      !value &&
      name !== "password" &&
      name !== "localiteId" &&
      name !== "peageId" &&
      name !== "sens" &&
      name !== "codeUo"
    ) {
      error = "Ce champ est requis";
    } else {
      switch (name) {
        case "nom":
        case "prenom":
          if (typeof value === "string" && value.length > 50)
            error = "Ne peut pas dépasser 50 caractères";
          break;
        case "username":
          if (typeof value === "string" && value.length < 3)
            error = "Minimum 3 caractères";
          if (typeof value === "string" && value.length > 20)
            error = "Maximum 20 caractères";
          break;
        case "password":
          if (!isEditMode && typeof value === "string" && value.length < 6)
            error = "Minimum 6 caractères";
          break;
        case "roleId":
          if (!value || value === 0) error = "Un rôle doit être sélectionné";
          break;
        case "localiteId":
          if (isAgentRole() && !value)
            error = "La localité est requise pour le rôle agent";
          break;
        case "peageId":
          if (isCaisseRole() && !value)
            error = "Le péage est requis pour le rôle caisse";
          break;
        case "sens":
          if (isCaisseRole() && !value)
            error = "Le sens est requis pour le rôle caisse";
          break;
      }
    }

    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Convertir les valeurs numériques
    let processedValue: string | number | null = value;
    if (name === "localiteId" || name === "peageId" || name === "roleId") {
      processedValue = value ? parseInt(value) : (name === "roleId" ? 0 : null);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "password" || (!isEditMode && allowPasswordEdit)) {
        const error = validateField(key, value);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = { ...formData };
    if (isEditMode && !submitData.password) {
      delete submitData.password;
    }

    onSubmit(submitData);
  };

  const getSelectedUoName = () => {
    if (!formData.codeUo) return "";
    const uo = organizationalUnits.find((u) => u.codeUo === formData.codeUo);
    return uo?.libUo || "";
  };

  const getSelectedRoleName = () => {
    if (!formData.roleId) return "";
    const role = roles.find((r) => r.id === formData.roleId);
    return role?.name || "";
  };

  const getSelectedLocaliteName = () => {
    if (!formData.localiteId) return "";
    const localite = localites.find((l) => l.id === formData.localiteId);
    return localite?.libLoc || "";
  };

  const getSelectedPeageName = () => {
    if (!formData.peageId) return "";
    const peage = peages.find((p) => p.id === formData.peageId);
    return peage?.libPeage || "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200/30 dark:border-amber-700/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 flex items-center">
              {isEditMode ? (
                <>
                  <ShieldUser className="w-5 h-5 mr-2" />
                  Modifier l'utilisateur
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Nouvel utilisateur
                </>
              )}
            </h2>
            <button
              onClick={onCancel}
              className="text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.nom
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                }`}
                placeholder="Entrez le nom"
                maxLength={50}
              />
              {errors.nom && (
                <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.prenom
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                }`}
                placeholder="Entrez le prénom"
                maxLength={50}
              />
              {errors.prenom && (
                <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Nom d'utilisateur *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.username
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                } ${isEditMode ? "opacity-70 cursor-not-allowed" : ""}`}
                placeholder="Entrez le nom d'utilisateur"
                maxLength={20}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
              {isEditMode && (
                <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1">
                  Le nom d'utilisateur ne peut pas être modifié après création
                </p>
              )}
            </div>

            {allowPasswordEdit && (
              <div>
                <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Mot de passe {!isEditMode && "*"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.password
                      ? "border-red-500"
                      : "border-amber-200/30 dark:border-amber-700/30"
                  }`}
                  placeholder={
                    isEditMode
                      ? "Nouveau mot de passe (optionnel)"
                      : "Entrez le mot de passe"
                  }
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
                {isEditMode && (
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-xs mt-1">
                    Laisser vide pour conserver le mot de passe actuel
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Unité organisationnelle
              </label>
              <select
                name="codeUo"
                value={formData.codeUo || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.codeUo
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                }`}
              >
                <option value="">Sélectionnez une unité</option>
                {organizationalUnits.map((uo) => (
                  <option key={uo.codeUo} value={uo.codeUo}>
                    {uo.libUo} ({uo.codeUo})
                  </option>
                ))}
              </select>
              {errors.codeUo && (
                <p className="text-red-500 text-xs mt-1">{errors.codeUo}</p>
              )}
              {formData.codeUo && (
                <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  Sélectionné: {getSelectedUoName()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Rôle *
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.roleId
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                }`}
              >
                <option value="0">Sélectionnez un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>
              )}
              {formData.roleId && (
                <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                  <Key className="w-3 h-3 mr-1" />
                  Sélectionné: {getSelectedRoleName()}
                </p>
              )}
            </div>
          </div>

          {/* Champs spécifiques pour le rôle agent */}
          {isAgentRole() && (
            <div>
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                Localité *
              </label>
              <select
                name="localiteId"
                value={formData.localiteId || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.localiteId
                    ? "border-red-500"
                    : "border-amber-200/30 dark:border-amber-700/30"
                }`}
                disabled={loadingLocalites}
              >
                <option value="">Sélectionnez une localité</option>
                {localites.map((localite) => (
                  <option key={localite.id} value={localite.id}>
                    {localite.libLoc} ({localite.codeLoc})
                  </option>
                ))}
              </select>
              {errors.localiteId && (
                <p className="text-red-500 text-xs mt-1">{errors.localiteId}</p>
              )}
              {formData.localiteId && (
                <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  Sélectionné: {getSelectedLocaliteName()}
                </p>
              )}
            </div>
          )}

          {/* Champs spécifiques pour le rôle caisse */}
          {isCaisseRole() && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Péage *
                </label>
                <select
                  name="peageId"
                  value={formData.peageId || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.peageId
                      ? "border-red-500"
                      : "border-amber-200/30 dark:border-amber-700/30"
                  }`}
                  disabled={loadingPeages}
                >
                  <option value="">Sélectionnez un péage</option>
                  {peages.map((peage) => (
                    <option key={peage.id} value={peage.id}>
                      {peage.libPeage} ({peage.codPeage})
                    </option>
                  ))}
                </select>
                {errors.peageId && (
                  <p className="text-red-500 text-xs mt-1">{errors.peageId}</p>
                )}
                {formData.peageId && (
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                    <Ticket className="w-3 h-3 mr-1" />
                    Sélectionné: {getSelectedPeageName()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Sens *
                </label>
                <select
                  name="sens"
                  value={formData.sens || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.sens
                      ? "border-red-500"
                      : "border-amber-200/30 dark:border-amber-700/30"
                  }`}
                >
                  <option value="">Sélectionnez un sens</option>
                  <option value="IN">Entrée (IN)</option>
                  <option value="OUT">Sortie (OUT)</option>
                </select>
                {errors.sens && (
                  <p className="text-red-500 text-xs mt-1">{errors.sens}</p>
                )}
                {formData.sens && (
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center">
                    <ArrowRightLeft className="w-3 h-3 mr-1" />
                    Sélectionné: {formData.sens === "IN" ? "Entrée" : "Sortie"}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors flex items-center"
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}