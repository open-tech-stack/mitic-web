"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Plus, X } from "lucide-react";

// Types
interface CategorieType {
  id: number;
  libelle: string;
}

interface Categorie {
  id: number;
  typeCategorie: number;
  nbreEssieux: number;
  montant: number;
}

interface CategorieFormProps {
  show: boolean;
  categorie: Partial<Categorie>;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (categorie: Omit<Categorie, "id"> | Categorie) => void; // Changé ici
  types: CategorieType[];
}

// Utilitaires de validation
class CategorieValidator {
  static isPoidsLourd(typeLibelle: string): boolean {
    return typeLibelle.toLowerCase().includes('poids lourd') || 
           typeLibelle.toLowerCase().includes('camion') ||
           typeLibelle.toLowerCase().includes('articulé');
  }

  static validate(categorie: Partial<Categorie>, isPoidsLourd: boolean): string[] {
    const errors: string[] = [];

    if (!categorie.typeCategorie || categorie.typeCategorie === 0) {
      errors.push('Le type de catégorie est requis');
    }

    if (!categorie.montant || categorie.montant < 25) {
      errors.push('Le montant doit être d\'au moins 25 FCFA');
    }

    if (isPoidsLourd && (!categorie.nbreEssieux || categorie.nbreEssieux < 1)) {
      errors.push('Le nombre d\'essieux est requis pour les poids lourds');
    }

    return errors;
  }
}

export default function CategorieForm({ show, categorie, isEdit, onClose, onSubmit, types }: CategorieFormProps) {
  const [formData, setFormData] = useState<Partial<Categorie>>({
    typeCategorie: 0,
    nbreEssieux: 0,
    montant: 25,
    ...categorie
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showEssieuxField, setShowEssieuxField] = useState(false);

  useEffect(() => {
    setFormData({ typeCategorie: 0, nbreEssieux: 0, montant: 25, ...categorie });
  }, [categorie]);

  useEffect(() => {
    updateEssieuxFieldVisibility();
  }, [formData.typeCategorie, types]);

  const updateEssieuxFieldVisibility = () => {
    if (!formData.typeCategorie || formData.typeCategorie === 0) {
      setShowEssieuxField(false);
      return;
    }

    const selectedType = types.find(t => t.id === formData.typeCategorie);
    if (selectedType) {
      const isPoidsLourd = CategorieValidator.isPoidsLourd(selectedType.libelle);
      setShowEssieuxField(isPoidsLourd);
      
      if (isPoidsLourd && !isEdit && formData.nbreEssieux === 0) {
        setFormData(prev => ({ ...prev, nbreEssieux: 2 }));
      } else if (!isPoidsLourd) {
        setFormData(prev => ({ ...prev, nbreEssieux: 0 }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedType = types.find(t => t.id === formData.typeCategorie);
    const isPoidsLourd = selectedType ? CategorieValidator.isPoidsLourd(selectedType.libelle) : false;
    
    const validationErrors = CategorieValidator.validate(formData, isPoidsLourd);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      // Préparer les données pour l'envoi
      const submitData = {
        typeCategorie: formData.typeCategorie!,
        nbreEssieux: formData.nbreEssieux || 0,
        montant: formData.montant!,
        ...(isEdit && formData.id && { id: formData.id })
      };
      
      onSubmit(submitData);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
              {isEdit ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {isEdit ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
            >
              <X className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de catégorie */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100">
              Type de catégorie
            </label>
            <select
              value={formData.typeCategorie || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, typeCategorie: Number(e.target.value) }))}
              required
              className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value={0} disabled>-- Sélectionnez un type --</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.libelle}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre d'essieux */}
          {showEssieuxField && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-amber-900 dark:text-amber-100">
                Nombre d'essieux (pour poids lourd uniquement)
              </label>
              <input
                type="number"
                value={formData.nbreEssieux || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, nbreEssieux: Number(e.target.value) }))}
                min="1"
                max="20"
                required
                className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Montant */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100">
              Montant (FCFA)
            </label>
            <input
              type="number"
              value={formData.montant || 25}
              onChange={(e) => setFormData(prev => ({ ...prev, montant: Number(e.target.value) }))}
              min="25"
              step="any"
              required
              className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Messages d'erreur */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
            >
              {isEdit ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}