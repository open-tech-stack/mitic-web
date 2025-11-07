// @/app/dashboard/operations/schemas-comptables/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import CreateSchemaComptableComponent from "@/components/dashboard/operations/schema-comptable/CreateSchemasComptable";
import EditSchemaComptable from "@/components/dashboard/operations/schema-comptable/EditSchemaComptable";
import ListEcritures from "@/components/dashboard/operations/schema-comptable/ListEcritures";
import { SchemaComptable, CreateSchemaComptable } from "@/types/schemaComptable.types";
import { CompteType } from "@/types/typeCompte.types";
import { ModeReglement } from "@/types/modeReglement.types";
import { TypeOperation } from "@/types/typeOperation.types";
import { TypeMontant } from "@/types/typeMontant.types";
import { CompteTypeService } from "@/services/comptes/type/typeCompte.service";
import { ModeReglementService } from "@/services/operations/reglement/modeReglement.service";
import { SchemaComptableService } from "@/services/operations/schemaComptables/schemaComptables.service";
import { TypeOperationService } from "@/services/operations/type/typeOperation.service";
import { TypeMontantService } from "@/services/categories/typeMontant/type-montant.service";
import { useAuth } from "@/hooks/useAuth";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

export default function SchemasComptablesPage() {
  const [editingSchema, setEditingSchema] = useState<SchemaComptable | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [schemas, setSchemas] = useState<SchemaComptable[]>([]);
  const [typesCompte, setTypesCompte] = useState<CompteType[]>([]);
  const [modesReglement, setModesReglement] = useState<ModeReglement[]>([]);
  const [typesOperation, setTypesOperation] = useState<TypeOperation[]>([]);
  const [typesMontant, setTypesMontant] = useState<TypeMontant[]>([]);
  const [loading, setLoading] = useState(true);



  const { hasPermission, hasAnyPermission } = useAuth();

  // Vérifications des permissions schémas comptables
  const canReadSchemaComptable = hasPermission('READ_SCHEMA_COMPTABLE') || hasPermission('CRUD_SCHEMA_COMPTABLE');
  const canCreateSchemaComptable = hasPermission('CREATE_SCHEMA_COMPTABLE') || hasPermission('CRUD_SCHEMA_COMPTABLE');
  const canUpdateSchemaComptable = hasPermission('UPDATE_SCHEMA_COMPTABLE') || hasPermission('CRUD_SCHEMA_COMPTABLE');
  const canDeleteSchemaComptable = hasPermission('DELETE_SCHEMA_COMPTABLE') || hasPermission('CRUD_SCHEMA_COMPTABLE');

  // Initialisation des services
  const schemaComptableService = SchemaComptableService.getInstance();
  const compteTypeService = CompteTypeService.getInstance();
  const modeReglementService = ModeReglementService.getInstance();
  const typeOperationService = TypeOperationService.getInstance();
  const typeMontantService = TypeMontantService.getInstance();

  useEffect(() => {
    if (!canReadSchemaComptable) {
      setLoading(false);
      return;
    }

    loadAllData();
  }, [canReadSchemaComptable]);

  const loadAllData = async () => {
    if (!canReadSchemaComptable) return;

    try {
      setLoading(true);
      await schemaComptableService.loadAllDependencies();
      
      const [
        schemasData,
        typesCompteData,
        modesReglementData,
        typesOperationData,
        typesMontantData
      ] = await Promise.all([
        schemaComptableService.loadAll(),
        compteTypeService.loadAll(),
        modeReglementService.loadAll(),
        typeOperationService.loadAll(),
        typeMontantService.loadAll()
      ]);

      setSchemas(schemasData);
      setTypesCompte(typesCompteData);
      setModesReglement(modesReglementData);
      setTypesOperation(typesOperationData);
      setTypesMontant(typesMontantData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'a aucune permission schéma comptable
  if (!hasAnyPermission(['READ_SCHEMA_COMPTABLE', 'CREATE_SCHEMA_COMPTABLE', 'UPDATE_SCHEMA_COMPTABLE', 'DELETE_SCHEMA_COMPTABLE', 'CRUD_SCHEMA_COMPTABLE'])) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-amber-400">📊</div>
          <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  // Gestion de l'ouverture du modal de création
  const handleOpenCreateModal = () => {
    if (!canCreateSchemaComptable) {
      alert("Vous n'avez pas la permission de créer un schéma comptable");
      return;
    }
    setShowCreateModal(true);
  };

  // Gestion de la fermeture du modal de création
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  // Gestion de la création d'un nouveau schéma comptable
  const handleSchemaCreated = async (newSchema: CreateSchemaComptable) => {
    if (!canCreateSchemaComptable) {
      alert("Vous n'avez pas la permission de créer un schéma comptable");
      return;
    }

    try {
      const createdSchema = await schemaComptableService.create(newSchema);
      setSchemas(prev => [...prev, createdSchema]);
      handleCloseCreateModal();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  // Gestion de l'édition d'un schéma comptable
  const handleSchemaEdit = (schema: SchemaComptable) => {
    if (!canUpdateSchemaComptable) {
      alert("Vous n'avez pas la permission de modifier un schéma comptable");
      return;
    }
    setEditingSchema(schema);
  };

  // Gestion de la mise à jour d'un schéma comptable
  const handleSchemaUpdated = async (updatedSchema: SchemaComptable) => {
    if (!canUpdateSchemaComptable) {
      alert("Vous n'avez pas la permission de modifier un schéma comptable");
      return;
    }

    try {
      const result = await schemaComptableService.update(updatedSchema);
      setSchemas(prev => prev.map(s => s.id === result.id ? result : s));
      setEditingSchema(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Annulation de l'édition
  const handleEditCancelled = () => {
    setEditingSchema(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-900 dark:text-amber-100">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schemas-comptables-page min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      <div className="page-content max-w-7xl mx-auto">
        
        {/* Section d'édition */}
        {editingSchema && (
          <PermissionGuard permission="UPDATE_SCHEMA_COMPTABLE">
            <section className="edit-section mb-8">
              <EditSchemaComptable
                schema={editingSchema}
                typesOperation={typesOperation}
                modesReglement={modesReglement}
                typesCompte={typesCompte}
                typesMontant={typesMontant}
                onSubmit={handleSchemaUpdated}
                onCancel={handleEditCancelled}
              />
            </section>
          </PermissionGuard>
        )}

        {/* Section principale - Liste des écritures */}
        {!editingSchema && (
          <PermissionGuard permission="READ_SCHEMA_COMPTABLE">
            <section className="main-management-section">
              <ListEcritures
                schemas={schemas}
                typesOperation={typesOperation}
                modesReglement={modesReglement}
                typesCompte={typesCompte}
                typesMontant={typesMontant}
                onSchemaEdit={handleSchemaEdit}
                onOpenCreateModal={handleOpenCreateModal}
                canUpdate={canUpdateSchemaComptable}
                canDelete={canDeleteSchemaComptable}
              />
            </section>
          </PermissionGuard>
        )}

      </div>

      {/* Modal de création */}
      <PermissionGuard permission="CREATE_SCHEMA_COMPTABLE">
        <AnimatePresence>
          {showCreateModal && (
            <div className="modal-overlay fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="modal-container bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header p-6 border-b border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouveau Schéma Comptable
                    </h2>
                    <button
                      onClick={handleCloseCreateModal}
                      className="p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    >
                      <X className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                </div>
                
                <div className="modal-content p-6">
                  <CreateSchemaComptableComponent
                    typesOperation={typesOperation}
                    modesReglement={modesReglement}
                    typesCompte={typesCompte}
                    typesMontant={typesMontant}
                    onSubmit={handleSchemaCreated}
                    onCancel={handleCloseCreateModal}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PermissionGuard>
    </div>
  );
}