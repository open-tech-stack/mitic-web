"use client";

import { useState, useEffect } from "react";
import { Save, X, AlertCircle, Plus, Trash2 } from "lucide-react";
import { CompteType } from "@/types/typeCompte.types";
import { ModeReglement } from "@/types/modeReglement.types";
import { TypeOperation } from "@/types/typeOperation.types";
import { TypeMontant } from "@/types/typeMontant.types";
import {
  SchemaComptable,
  EcritureComptable,
  EcritureComptableValidator,
  SchemaComptableValidator,
} from "@/types/schemaComptable.types";

interface EditSchemaComptableProps {
  schema: SchemaComptable | null;
  typesOperation: TypeOperation[];
  modesReglement: ModeReglement[];
  typesCompte: CompteType[];
  typesMontant: TypeMontant[];
  onSubmit: (schema: SchemaComptable) => void;
  onCancel: () => void;
}

export default function EditSchemaComptable({
  schema,
  typesOperation,
  modesReglement,
  typesCompte,
  typesMontant,
  onSubmit,
  onCancel,
}: EditSchemaComptableProps) {
  const [selectedTypeOp, setSelectedTypeOp] = useState<number>(0);
  const [selectedModeReglement, setSelectedModeReglement] = useState<number>(0);
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    selectedTypeOp > 0 && selectedModeReglement > 0 && ecritures.length > 0;

  const isFormValid = () => {
    if (!canSubmit) return false;
    return ecritures.every(
      (ecriture) => EcritureComptableValidator.validate(ecriture).length === 0
    );
  };

  // Charge le schéma pour l'édition
  useEffect(() => {
    if (schema) {
      loadSchemaForEdit(schema);
    } else {
      resetForm();
    }
  }, [schema]);

  const loadSchemaForEdit = (schema: SchemaComptable) => {
    // Copie profonde des écritures
    const ecrituresCopy = schema.ecritures.map((ecriture) => ({
      id: ecriture.id,
      sens: ecriture.sens,
      id_typeCompte: ecriture.id_typeCompte,
      type_detenteur: ecriture.type_detenteur,
      id_typeMontant: ecriture.id_typeMontant,
    }));

    setSelectedTypeOp(schema.id_tyOp);
    setSelectedModeReglement(schema.id_reglement);
    setEcritures(ecrituresCopy);
  };

  // Gestion de la sélection du type d'opération
  const onTypeOperationChange = (typeOpId: number) => {
    setSelectedTypeOp(typeOpId);
  };

  // Gestion de la sélection du mode de règlement
  const onModeReglementChange = (modeReglementId: number) => {
    setSelectedModeReglement(modeReglementId);
  };

  // Créé une nouvelle écriture vide
  const createNewEcriture = (): EcritureComptable => ({
    sens: "DEBIT",
    id_typeCompte: 0,
    type_detenteur: true,
    id_typeMontant: 0,
  });

  // Ajoute une nouvelle écriture
  const addEcriture = () => {
    if (ecritures.length >= 20) {
      alert("Maximum 20 écritures par schéma comptable");
      return;
    }

    setEcritures([...ecritures, createNewEcriture()]);
  };

  // Supprime une écriture
  const removeEcriture = (index: number) => {
    if (ecritures.length <= 1) {
      alert("Au moins une écriture est requise");
      return;
    }

    setEcritures(ecritures.filter((_, i) => i !== index));
  };

  // Met à jour une écriture
  const updateEcriture = (
    index: number,
    field: keyof EcritureComptable,
    value: any
  ) => {
    setEcritures(
      ecritures.map((ecriture, i) =>
        i === index ? { ...ecriture, [field]: value } : ecriture
      )
    );
  };

  // Validation et soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!schema) return;

    const updatedSchema: SchemaComptable = {
      id: schema.id,
      id_reglement: selectedModeReglement,
      id_tyOp: selectedTypeOp,
      ecritures: ecritures.map((ecriture) => ({
        id: ecriture.id,
        sens: ecriture.sens,
        id_typeCompte: ecriture.id_typeCompte,
        type_detenteur: ecriture.type_detenteur,
        id_typeMontant: ecriture.id_typeMontant,
      })),
    };

    const validationErrors = SchemaComptableValidator.validate(updatedSchema);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setIsSubmitting(true);
      onSubmit(updatedSchema);
    }
  };

  // Réinitialise le formulaire
  const resetForm = () => {
    setSelectedTypeOp(0);
    setSelectedModeReglement(0);
    setEcritures([]);
    setErrors([]);
  };

  // Méthodes utilitaires pour les templates
  const getTypeOperationLibelle = (id: number): string => {
    return typesOperation.find((t) => t.id === id)?.libelle || "";
  };

  const getModeReglementLibelle = (id: number): string => {
    return modesReglement.find((m) => m.id === id)?.libelle || "";
  };

  const getTypeCompteLibelle = (id: number): string => {
    return typesCompte.find((t) => t.id === id)?.libelle || "";
  };

  const getTypeMontantLibelle = (id: number): string => {
    return typesMontant.find((t) => t.id === id)?.libelle || "";
  };

  if (!schema) {
    return null;
  }

  return (
    <div className="edit-schema-container bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-amber-200/30 dark:border-amber-700/30">
      <div className="form-header mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
            Modifier le Schéma Comptable
          </h3>
          <div className="current-schema-info bg-amber-100/50 dark:bg-amber-900/30 px-3 py-2 rounded-lg">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Schéma actuel : {getTypeOperationLibelle(schema.id_tyOp)} -{" "}
              {getModeReglementLibelle(schema.id_reglement)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="schema-form">
        {/* Section de sélection Type d'opération et Mode de règlement */}
        <div className="selection-section mb-6">
          <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Type d'Opération *
              </label>
              <select
                value={selectedTypeOp}
                onChange={(e) => onTypeOperationChange(Number(e.target.value))}
                className="form-input w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value={0}>Sélectionnez un type d'opération...</option>
                {typesOperation.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label flex items-center text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Mode de Règlement *
              </label>
              <select
                value={selectedModeReglement}
                onChange={(e) => onModeReglementChange(Number(e.target.value))}
                className="form-input w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value={0}>Sélectionnez un mode de règlement...</option>
                {modesReglement.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section des écritures comptables */}
        <div className="ecritures-section mb-6">
          <div className="section-header flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Écritures Comptables
            </h4>
            <button
              type="button"
              className="btn-add-ecriture flex items-center gap-2 px-3 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
              onClick={addEcriture}
              disabled={ecritures.length >= 20}
            >
              <Plus className="w-4 h-4" />
              Ajouter une écriture
            </button>
          </div>

          <div className="ecritures-table-container overflow-x-auto">
            <table className="ecritures-table w-full">
              <thead>
                <tr className="border-b border-amber-200/30 dark:border-amber-700/30">
                  <th className="p-3 text-left font-medium text-amber-900 dark:text-amber-100 w-12">
                    #
                  </th>
                  <th className="p-3 text-left font-medium text-amber-900 dark:text-amber-100">
                    Sens *
                  </th>
                  <th className="p-3 text-left font-medium text-amber-900 dark:text-amber-100">
                    Type de Compte *
                  </th>
                  <th className="p-3 text-left font-medium text-amber-900 dark:text-amber-100">
                    Type de Montant *
                  </th>
                  <th className="p-3 text-left font-medium text-amber-900 dark:text-amber-100">
                    Détenteur *
                  </th>
                  <th className="p-3 text-left font-medium text-amber-900 dark:text-amber-100 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ecritures.map((ecriture, index) => (
                  <tr
                    key={ecriture.id || index}
                    className="border-b border-amber-100/50 dark:border-amber-800/30"
                  >
                    <td className="p-3">
                      <span className="ecriture-number inline-flex items-center justify-center w-6 h-6 bg-amber-100/50 dark:bg-amber-900/30 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300">
                        {index + 1}
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={ecriture.sens}
                        onChange={(e) =>
                          updateEcriture(index, "sens", e.target.value)
                        }
                        className="form-input w-full px-2 py-1 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                        required
                      >
                        <option value="DEBIT">Débit</option>
                        <option value="CREDIT">Crédit</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <select
                        value={ecriture.id_typeCompte}
                        onChange={(e) =>
                          updateEcriture(
                            index,
                            "id_typeCompte",
                            Number(e.target.value)
                          )
                        }
                        className="form-input w-full px-2 py-1 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                        required
                      >
                        <option value={0}>Sélectionnez...</option>
                        {typesCompte.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.libelle}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <select
                        value={ecriture.id_typeMontant}
                        onChange={(e) =>
                          updateEcriture(
                            index,
                            "id_typeMontant",
                            Number(e.target.value)
                          )
                        }
                        className="form-input w-full px-2 py-1 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                        required
                      >
                        <option value={0}>Sélectionnez...</option>
                        {typesMontant.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.libelle}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <select
                        value={ecriture.type_detenteur.toString()}
                        onChange={(e) =>
                          updateEcriture(
                            index,
                            "type_detenteur",
                            e.target.value === "true"
                          )
                        }
                        className="form-input w-full px-2 py-1 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                        required
                      >
                        <option value="true">UO</option>
                        <option value="false">User</option>
                      </select>
                    </td>

                    <td className="p-3">
                      {ecritures.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-table p-1 text-red-600 hover:text-red-700 hover:bg-red-100/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          onClick={() => removeEcriture(index)}
                          title="Supprimer cette écriture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {errors.length > 0 && (
          <div className="error-messages space-y-2 mb-6">
            {errors.map((error, index) => (
              <div
                key={index}
                className="error-message flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Actions du formulaire */}
        <div className="form-actions flex gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel flex-1 flex items-center justify-center gap-2 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>

          <button
            type="submit"
            disabled={!canSubmit || !isFormValid() || isSubmitting}
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
                Mettre à jour le Schéma
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
