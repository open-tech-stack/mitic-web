"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Wifi, WifiOff } from "lucide-react";
import Input from "@/components/ui/Input";
import ForgotPasswordTooltip from "./ForgotPasswordTooltip";
import SuccessModal from "@/components/ui/SuccessModal";
import ErrorModal from "@/components/ui/ErrorModal";
import { LoginCredentials } from "@/types/auth.types";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("Erreur de connexion");
  const [isConnected, setIsConnected] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérification de la connectivité réseau simplifiée
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    checkConnection();

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  /**
   * Validation côté client des données de connexion
   */
  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!credentials.username.trim()) {
      newErrors.username = "L'identifiant est requis";
    } else if (credentials.username.trim().length < 3) {
      newErrors.username = "L'identifiant doit contenir au moins 3 caractères";
    }

    if (!credentials.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (credentials.password.length < 4) {
      newErrors.password = "Le mot de passe doit contenir au moins 4 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Affiche une erreur dans le modal
   */
  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  /**
   * Gestion de la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification de la connectivité
    if (!isConnected) {
      showError(
        "Connexion internet requise",
        "Pas de connexion internet. Veuillez vérifier votre connexion avant de vous connecter."
      );
      return;
    }

    // Validation du formulaire
    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await login(credentials);

      if (result.success) {
        // Connexion réussie
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else if (result.error) {
        // Gestion des erreurs avec le modal
        handleLoginError(result.error);
      }
    } catch (error: any) {
      // Capture toutes les erreurs non gérées
      showError(
        "Erreur inattendue",
        "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Gestion spécifique des erreurs de connexion
   */
  const handleLoginError = (error: any) => {
    // Si c'est une erreur d'identifiants incorrects
    if (error.type === "INVALID_CREDENTIALS" || error.status === 401) {
      showError(
        "Identifiants incorrects",
        "Le nom d'utilisateur ou le mot de passe que vous avez saisi est incorrect. Veuillez vérifier vos identifiants et réessayer."
      );
    }
    // Erreur de réseau
    else if (error.type === "NETWORK_ERROR") {
      showError(
        "Problème de connexion",
        "Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez."
      );
    }
    // Erreur de timeout
    else if (error.type === "TIMEOUT_ERROR") {
      showError(
        "Temps d'attente dépassé",
        "Le serveur met trop de temps à répondre. Veuillez vérifier votre connexion ou réessayer plus tard."
      );
    }
    // Erreur serveur
    else if (error.type === "SERVER_ERROR" || error.status >= 500) {
      showError(
        "Erreur serveur",
        "Le serveur rencontre actuellement des difficultés. Veuillez réessayer dans quelques instants."
      );
    }
    // Erreur générique
    else {
      showError(
        "Erreur de connexion",
        error.message || "Une erreur s'est produite lors de la tentative de connexion."
      );
    }
  };

  /**
   * Gestion des changements dans les champs
   */
  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Suppression de l'erreur quand l'utilisateur commence à taper
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
    setErrorTitle("Erreur de connexion");
  };

  const isFormDisabled = isSubmitting || !isConnected;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 p-1 shadow-2xl backdrop-blur-sm">
          <div className="rounded-2xl bg-gray-900/70 p-8 backdrop-blur-md">
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-amber-700/20 p-4"
              >
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-amber-600/30 text-2xl font-bold text-amber-200">
                  M
                </div>
              </motion.div>
              <h1 className="text-3xl font-bold text-amber-100">
                Gestion Peages
              </h1>
              <p className="mt-2 text-amber-200/70">Connexion à votre espace</p>

              {/* Indicateur de connectivité */}
              <div className="mt-4">
                {!isConnected ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center text-red-400 text-sm"
                  >
                    <WifiOff size={16} className="mr-2" />
                    <span>Connexion internet indisponible</span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center text-green-400 text-sm"
                  >
                    <Wifi size={16} className="mr-2" />
                    <span>Connexion active</span>
                  </motion.div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Identifiant"
                type="text"
                value={credentials.username}
                onChange={handleInputChange("username")}
                error={errors.username}
                placeholder="Votre identifiant"
                autoComplete="username"
                disabled={isFormDisabled}
                maxLength={50}
              />

              <div className="w-full">
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={handleInputChange("password")}
                    error={errors.password}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    className="pr-12"
                    disabled={isFormDisabled}
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400/70 hover:text-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isFormDisabled}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <ForgotPasswordTooltip />
              </div>

              <motion.button
                whileHover={{ scale: isFormDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isFormDisabled ? 1 : 0.98 }}
                type="submit"
                disabled={isFormDisabled}
                className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  isFormDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="ml-2">Connexion...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn size={20} className="mr-2" />
                    <span>Se connecter</span>
                  </div>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Modal de succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Modal d'erreur */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleCloseErrorModal}
        title={errorTitle}
        message={errorMessage}
      />
    </>
  );
}