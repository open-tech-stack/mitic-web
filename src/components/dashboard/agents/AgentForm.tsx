// @/components/dashboard/agents/agentForm.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Save, UserPlus } from "lucide-react";
import { AgentCaisse, CreateAgentRequest, UpdateAgentRequest } from "@/types/agent.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface AgentFormProps {
  agent?: AgentCaisse | null;
  onSubmit: (data: CreateAgentRequest | UpdateAgentRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function AgentForm({ 
  agent, 
  onSubmit, 
  onCancel, 
  loading = false 
}: AgentFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    nom: '',
    prenom: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agentService = ServiceFactory.createAgentCaisseService();

  useEffect(() => {
    if (agent) {
      setFormData({
        username: agent.username,
        nom: agent.nom,
        prenom: agent.prenom,
        password: ''
      });
    } else {
      setFormData({
        username: '',
        nom: '',
        prenom: '',
        password: ''
      });
    }
  }, [agent]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (agentService.checkUsernameExists(formData.username, agent?.id)) {
      newErrors.username = "Ce nom d'utilisateur est déjà utilisé";
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!agent && !formData.password) {
      newErrors.password = 'Le mot de passe est requis pour la création';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = agent 
        ? { 
            username: formData.username,
            nom: formData.nom,
            prenom: formData.prenom,
            ...(formData.password && { password: formData.password })
          }
        : { 
            username: formData.username,
            nom: formData.nom,
            prenom: formData.prenom,
            password: formData.password
          };

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-blue-200/30 dark:border-blue-700/30">
      <div className="p-6 border-b border-blue-200/30 dark:border-blue-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-blue-900/30">
              {agent ? (
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {agent ? 'Modifier l\'agent' : 'Nouvel agent caissier'}
              </h3>
              <p className="text-blue-600/70 dark:text-blue-400/70 text-sm">
                {agent ? 'Modifiez les informations de l\'agent' : 'Remplissez les informations pour créer un nouvel agent'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || isSubmitting}
              placeholder="Entrez le nom d'utilisateur"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {agent ? 'Nouveau mot de passe' : 'Mot de passe *'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || isSubmitting}
              placeholder={agent ? 'Laisser vide pour ne pas modifier' : 'Entrez le mot de passe'}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || isSubmitting}
              placeholder="Entrez le nom"
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
            )}
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.prenom ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || isSubmitting}
              placeholder="Entrez le prénom"
            />
            {errors.prenom && (
              <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Enregistrement...' : agent ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}