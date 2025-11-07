"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, CreditCard, Filter, X, Zap } from "lucide-react";
import type { HistoriqueFilters } from "@/types/historiqueCompte.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface HistoriqueFiltersProps {
  onFiltersChange: (filters: HistoriqueFilters) => void;
  loading: boolean;
}

export default function HistoriqueFilters({ onFiltersChange, loading }: HistoriqueFiltersProps) {
  const [filters, setFilters] = useState<HistoriqueFilters>({
    numeroCompte: '',
    dateDebut: '',
    dateFin: ''
  });

  const [autoSearch, setAutoSearch] = useState(false);
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const historiqueService = ServiceFactory.createHistoriqueCompteService();

  // Recherche automatique quand autoSearch est activé et les filtres sont valides
  useEffect(() => {
    if (autoSearch && historiqueService.canAutoSearch(filters) && !loading) {
      const timer = setTimeout(() => {
        console.log('🔍 RECHERCHE AUTOMATIQUE déclenchée:', filters);
        const errors = validateFilters(filters);
        setLocalErrors(errors);
        
        if (errors.length === 0) {
          setHasSearched(true);
          onFiltersChange(filters);
        }
      }, 1000); // Délai de 1 seconde pour éviter les recherches trop fréquentes

      return () => clearTimeout(timer);
    }
  }, [filters, autoSearch, loading, onFiltersChange]);

  const validateFilters = (filters: HistoriqueFilters): string[] => {
    const errors: string[] = [];
    
    if (!filters.numeroCompte?.trim()) {
      errors.push('Le numéro de compte est requis');
    }
    
    if (!filters.dateDebut) {
      errors.push('La date de début est requise');
    }
    
    if (!filters.dateFin) {
      errors.push('La date de fin est requise');
    }
    
    if (filters.dateDebut && filters.dateFin) {
      const debut = new Date(filters.dateDebut);
      const fin = new Date(filters.dateFin);
      
      if (debut > fin) {
        errors.push('La date de début ne peut pas être après la date de fin');
      }
    }

    return errors;
  };

  const handleFilterChange = (key: keyof HistoriqueFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Réinitialiser l'état de recherche si on modifie les filtres
    if (hasSearched) {
      setHasSearched(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFilters(filters);
    setLocalErrors(errors);
    
    if (errors.length === 0) {
      setHasSearched(true);
      onFiltersChange(filters);
    }
  };

  const clearFilters = () => {
    setFilters({
      numeroCompte: '',
      dateDebut: '',
      dateFin: ''
    });
    setLocalErrors([]);
    setHasSearched(false);
    setAutoSearch(false);
  };

  const toggleAutoSearch = () => {
    setAutoSearch(!autoSearch);
    if (!autoSearch) {
      console.log('✅ Mode automatique activé');
    } else {
      console.log('❌ Mode automatique désactivé');
    }
  };

  const hasFilters = filters.numeroCompte || filters.dateDebut || filters.dateFin;
  const canSearch = historiqueService.canAutoSearch(filters);

  return (
    <div className="filters-container mb-6">
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="filters-header mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres de recherche
          </h3>
          
          {/* Checkbox Automatique */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoSearch}
                  onChange={toggleAutoSearch}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  autoSearch ? 'bg-amber-600' : 'bg-amber-200 dark:bg-amber-700'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    autoSearch ? 'transform translate-x-5' : 'transform translate-x-1'
                  }`} />
                </div>
              </div>
              <Zap className={`w-4 h-4 ${autoSearch ? 'text-amber-600' : 'text-amber-400'}`} />
              <span className="font-medium">Automatique</span>
            </label>
          </div>
        </div>

        <div className="filters-grid grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Numéro de compte */}
          <div className="filter-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Numéro de compte
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="text"
                value={filters.numeroCompte}
                onChange={(e) => handleFilterChange('numeroCompte', e.target.value)}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: 1234567890"
                maxLength={15}
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>

          {/* Date de début */}
          <div className="filter-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Date de début
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="date"
                value={filters.dateDebut}
                onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>

          {/* Date de fin */}
          <div className="filter-field">
            <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Date de fin
              <span className="required text-red-500 ml-1">*</span>
            </label>
            <div className="input-wrapper relative">
              <input
                type="date"
                value={filters.dateFin}
                onChange={(e) => handleFilterChange('dateFin', e.target.value)}
                className="form-input w-full px-3 py-2 pl-10 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>

          {/* Actions */}
          <div className="filter-actions flex items-end gap-2">
            <button
              type="submit"
              disabled={loading || !canSearch || (autoSearch && hasSearched)}
              className="btn-search flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={autoSearch && hasSearched ? "Recherche automatique activée" : ""}
            >
              <Search className="w-4 h-4" />
              {loading ? 'Recherche...' : autoSearch && hasSearched ? 'Auto ✓' : 'Rechercher'}
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-clear p-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
                title="Effacer les filtres"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Indicateur de mode automatique */}
        {autoSearch && canSearch && (
          <div className="auto-search-indicator mt-3 p-2 bg-amber-100/30 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Mode automatique activé - La recherche se déclenchera automatiquement</span>
            </div>
          </div>
        )}

        {/* Messages d'erreur */}
        {localErrors.length > 0 && (
          <div className="error-messages mt-4 space-y-2">
            {localErrors.map((error, index) => (
              <div
                key={index}
                className="error-message flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <X className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}