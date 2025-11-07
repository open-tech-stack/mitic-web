// @/services/schema-comptable/schema-comptable.service.ts

import { SchemaComptable, CreateSchemaComptable, EcritureComptable, ApiResponse, SchemaComptableValidator } from "@/types/schemaComptable.types";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { CompteTypeService } from "@/services/comptes/type/typeCompte.service";
import { ModeReglementService } from "../reglement/modeReglement.service";
import { TypeOperationService } from "../type/typeOperation.service";
import { TypeMontantService } from "@/services/categories/typeMontant/type-montant.service";
import { ServiceFactory } from "@/services/factory/factory.service";

interface SchemaComptableState {
  schemas: SchemaComptable[];
  ecritures: EcritureComptable[];
  loading: boolean;
  error: string | null;
  selectedTypeOp: number;
  selectedModeReglement: number;
}

export class SchemaComptableService {
  private static instance: SchemaComptableService;
  private readonly endpoint = 'schema-comptable';
  private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
  private errorHandler = ErrorHandlerService.getInstance();
  private compteTypeService = CompteTypeService.getInstance();
  private modeReglementService = ModeReglementService.getInstance();
  private typeOperationService = TypeOperationService.getInstance();
  private typeMontantService = TypeMontantService.getInstance();

  private state: SchemaComptableState = {
    schemas: [],
    ecritures: [],
    loading: false,
    error: null,
    selectedTypeOp: 0,
    selectedModeReglement: 0
  };

  private stateUpdateCallbacks: ((state: SchemaComptableState) => void)[] = [];

  public static getInstance(): SchemaComptableService {
    if (!SchemaComptableService.instance) {
      SchemaComptableService.instance = new SchemaComptableService();
    }
    return SchemaComptableService.instance;
  }

  subscribe(callback: (state: SchemaComptableState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    callback(this.state);
    
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private updateState(newState: Partial<SchemaComptableState>): void {
    this.state = { ...this.state, ...newState };
    this.stateUpdateCallbacks.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du callback:', error);
      }
    });
  }

  async loadAllDependencies(): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      await Promise.all([
        this.compteTypeService.loadAll(),
        this.modeReglementService.loadAll(),
        this.typeOperationService.loadAll(),
        this.typeMontantService.loadAll() // Ajout du service TypeMontant
      ]);
      
      this.updateState({ loading: false, error: null });
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  async loadAll(): Promise<SchemaComptable[]> {
    this.updateState({ loading: true, error: null });

    try {
      const apiResponse: ApiResponse<SchemaComptable[]> = await this.httpService.get(this.endpoint);
      const schemas = Array.isArray(apiResponse.data) ? this.mapApiResponseToSchemas(apiResponse.data) : [];
      
      this.updateState({ 
        schemas: schemas,
        loading: false,
        error: null
      });
      
      return schemas;
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  async getEcrituresByTypeOpAndModeReglement(typeOpId: number, modeReglementId: number): Promise<EcritureComptable[]> {
    if (!typeOpId || !modeReglementId) {
      this.updateState({ ecritures: [] });
      return [];
    }

    this.updateState({ 
      loading: true, 
      selectedTypeOp: typeOpId,
      selectedModeReglement: modeReglementId
    });

    try {
      // Si les schémas sont déjà chargés, on les utilise
      if (this.state.schemas.length === 0) {
        await this.loadAll();
      }

      const ecritures = this.findEcrituresLocally(typeOpId, modeReglementId);
      this.updateState({ 
        ecritures: ecritures,
        loading: false,
        error: null
      });
      
      return ecritures;
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  private findEcrituresLocally(typeOpId: number, modeReglementId: number): EcritureComptable[] {
    const schema = this.state.schemas.find(s =>
      s.id_tyOp === typeOpId &&
      s.id_reglement === modeReglementId
    );

    return schema ? [...schema.ecritures] : [];
  }

  async create(schemaData: CreateSchemaComptable): Promise<SchemaComptable> {
    this.updateState({ loading: true, error: null });

    try {
      // Validation
      const validationErrors = SchemaComptableValidator.validate(schemaData);
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({ 
          error: errorMessage,
          loading: false 
        });
        throw new Error(errorMessage);
      }

      const apiResponse: ApiResponse<SchemaComptable> = await this.httpService.post(this.endpoint, schemaData);
      
      let newSchema: SchemaComptable;
      
      if (apiResponse && apiResponse.data) {
        newSchema = apiResponse.data;
      } else {
        console.warn('Réponse de création non standard, rechargement des données...');
        await this.loadAll();
        return this.state.schemas[this.state.schemas.length - 1];
      }

      this.updateState({ 
        schemas: [...this.state.schemas, newSchema],
        loading: false,
        error: null
      });
      
      return newSchema;
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  async update(schemaData: SchemaComptable): Promise<SchemaComptable> {
    if (!schemaData || !schemaData.id) {
      const error = new Error('Données invalides: ID manquant pour la mise à jour');
      this.updateState({ 
        error: 'ID manquant pour la modification',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      // Validation
      const validationErrors = SchemaComptableValidator.validate(schemaData);
      
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        this.updateState({ 
          error: errorMessage,
          loading: false 
        });
        throw new Error(errorMessage);
      }

      const url = `${this.endpoint}/${schemaData.id}`;
      const apiResponse: ApiResponse<SchemaComptable> = await this.httpService.put(url, schemaData);
      
      let updatedSchema: SchemaComptable;
      
      if (apiResponse && apiResponse.data) {
        updatedSchema = apiResponse.data;
      } else {
        console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
        updatedSchema = schemaData;
      }

      this.updateState({
        schemas: this.state.schemas.map(s => 
          s.id === updatedSchema.id ? updatedSchema : s
        ),
        loading: false,
        error: null
      });
      
      return updatedSchema;
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    if (!id) {
      const error = new Error('ID manquant pour la suppression');
      this.updateState({ 
        error: 'ID manquant pour la suppression',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      const url = `${this.endpoint}/${id}`;
      await this.httpService.delete(url);
      
      this.updateState({
        schemas: this.state.schemas.filter(s => s.id !== id),
        loading: false,
        error: null
      });
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  async deleteMultiple(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      const error = new Error('IDs manquants pour la suppression multiple');
      this.updateState({ 
        error: 'IDs manquants pour la suppression multiple',
        loading: false 
      });
      throw error;
    }

    this.updateState({ loading: true, error: null });

    try {
      await this.httpService.post(`${this.endpoint}/delete-multiple`, { ids });
      
      this.updateState({
        schemas: this.state.schemas.filter(s => !ids.includes(s.id!)),
        loading: false,
        error: null
      });
    } catch (error) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      
      this.updateState({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  }

  getById(id: number): SchemaComptable | undefined {
    return this.state.schemas.find(schema => schema.id === id);
  }

  schemaExists(typeOpId: number, modeReglementId: number, excludeId?: number): boolean {
    return this.state.schemas.some(schema =>
      schema.id_tyOp === typeOpId &&
      schema.id_reglement === modeReglementId &&
      schema.id !== excludeId
    );
  }

  resetSelection(): void {
    this.updateState({
      selectedTypeOp: 0,
      selectedModeReglement: 0,
      ecritures: []
    });
  }

  private mapApiResponseToSchemas(data: any[]): SchemaComptable[] {
      console.log('API Response data:', data); // ← Ajoutez cette ligne
    return data.map(item => {
      const schema: SchemaComptable = {
        id: item.id,
        id_reglement: item.id_reglement || 0,
        id_tyOp: item.id_tyOp || 0,
        ecritures: item.ecritures?.map((ecriture: any) => {
          return {
            id: ecriture.id ?? undefined,
            sens: ecriture.sens?.toUpperCase() || 'DEBIT',
            id_typeCompte: ecriture.id_typeCompte || 0,
            type_detenteur: ecriture.type_detenteur === true || ecriture.type_detenteur === 'true',
            id_typeMontant: ecriture.id_typeMontant || 0 // Ajout du nouveau champ
          };
        }) || []
      };

      return schema;
    });
  }

  getCurrentState(): SchemaComptableState {
    return { ...this.state };
  }

  clearError(): void {
    this.updateState({ error: null });
  }
}