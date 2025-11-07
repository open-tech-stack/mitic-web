// @/services/operation-montant-type/operation-montant-type.service.ts

import {
    OperationMontantType,
    OperationMontantTypeValidator,
    ApiResponse,
    DeleteOperationMontantTypeRequest,
    UpdateOperationMontantTypeRequest
} from "@/types/operationMontantType.types";
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { TypeOperation } from "@/types/typeOperation.types";
import { TypeMontant } from "@/types/typeMontant.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface OperationMontantTypeState {
    associations: OperationMontantType[];
    typesOperation: TypeOperation[];
    typesMontant: TypeMontant[];
    loading: boolean;
    error: string | null;
    selectedAssociation: OperationMontantType | null;
}

export class OperationMontantTypeService {
    private static instance: OperationMontantTypeService;
    private readonly endpoint = 'associationtypeMontant-typeOperation';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();
    private typeOperationService = ServiceFactory.createTypeOperationService();
    private typeMontantService = ServiceFactory.createTypeMontantService();

    private state: OperationMontantTypeState = {
        associations: [],
        typesOperation: [],
        typesMontant: [],
        loading: false,
        error: null,
        selectedAssociation: null
    };

    private stateUpdateCallbacks: ((state: OperationMontantTypeState) => void)[] = [];

    public static getInstance(): OperationMontantTypeService {
        if (!OperationMontantTypeService.instance) {
            OperationMontantTypeService.instance = new OperationMontantTypeService();
        }
        return OperationMontantTypeService.instance;
    }

    subscribe(callback: (state: OperationMontantTypeState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        callback(this.state);

        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    private updateState(newState: Partial<OperationMontantTypeState>): void {
        this.state = { ...this.state, ...newState };
        this.stateUpdateCallbacks.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du callback:', error);
            }
        });
    }

    async loadAll(): Promise<OperationMontantType[]> {
        this.updateState({ loading: true, error: null });

        try {
            await this.loadDependencies();

            const apiResponse: ApiResponse<OperationMontantType[]> = await this.httpService.get(this.endpoint);
            const associations = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            const enrichedAssociations = associations.map(association => ({
                ...association,
                libelleTypeOperation: this.getTypeOperationLibelle(association.idTypeOperation),
                libelleTypeMontant: this.getTypeMontantLibelle(association.idTypeMontant)
            }));

            this.updateState({
                associations: enrichedAssociations,
                loading: false,
                error: null
            });

            return enrichedAssociations;
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

    private async loadDependencies(): Promise<void> {
        try {
            const [typesOperation, typesMontant] = await Promise.all([
                this.typeOperationService.loadAll(),
                this.typeMontantService.loadAll()
            ]);

            this.updateState({ typesOperation, typesMontant });
        } catch (error) {
            console.error('Erreur lors du chargement des dépendances:', error);
            throw error;
        }
    }

    async create(associationData: Omit<OperationMontantType, 'id'>): Promise<OperationMontantType> {
        this.updateState({ loading: true, error: null });

        try {
            const validationErrors = OperationMontantTypeValidator.validate(
                associationData,
                this.state.associations
            );

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }

            const dataToSend = {
                idTypeOperation: associationData.idTypeOperation,
                idTypeMontant: associationData.idTypeMontant
            };

            const apiResponse: ApiResponse<OperationMontantType> = await this.httpService.post(this.endpoint, dataToSend);

            let newAssociation: OperationMontantType;

            if (apiResponse && apiResponse.data) {
                newAssociation = apiResponse.data;
            } else {
                await this.loadAll();
                return this.state.associations[this.state.associations.length - 1];
            }

            const enrichedAssociation: OperationMontantType = {
                ...newAssociation,
                libelleTypeOperation: this.getTypeOperationLibelle(newAssociation.idTypeOperation),
                libelleTypeMontant: this.getTypeMontantLibelle(newAssociation.idTypeMontant)
            };

            this.updateState({
                associations: [...this.state.associations, enrichedAssociation],
                loading: false,
                error: null
            });

            return enrichedAssociation;
        } catch (error) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);

            this.updateState({ error: errorMessage, loading: false });
            throw error;
        }
    }

    async update(updateRequest: UpdateOperationMontantTypeRequest): Promise<OperationMontantType> {
        if (!updateRequest.currentIdTypeOperation || !updateRequest.currentIdTypeMontant) {
            const error = new Error('IDs actuels manquants pour la modification');
            this.updateState({ error: 'IDs actuels manquants pour la modification', loading: false });
            throw error;
        }

        this.updateState({ loading: true, error: null });

        try {
            // Validation des nouvelles données
            const validationErrors = OperationMontantTypeValidator.validate(
                {
                    idTypeOperation: updateRequest.newIdTypeOperation,
                    idTypeMontant: updateRequest.newIdTypeMontant
                },
                this.state.associations.filter(a => 
                    !(a.idTypeOperation === updateRequest.currentIdTypeOperation && 
                      a.idTypeMontant === updateRequest.currentIdTypeMontant)
                ) // Exclure l'association en cours de modification
            );

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({ error: errorMessage, loading: false });
                throw new Error(errorMessage);
            }

            const dataToSend = {
                idTypeOperation: updateRequest.newIdTypeOperation,
                idTypeMontant: updateRequest.newIdTypeMontant
            };

            // Envoyer la requête PUT avec les IDs actuels comme paramètres
            const apiResponse: ApiResponse<OperationMontantType> = await this.httpService.put(
                `${this.endpoint}?idTypeOperation=${updateRequest.currentIdTypeOperation}&idTypeMontant=${updateRequest.currentIdTypeMontant}`,
                dataToSend
            );

            let updatedAssociation: OperationMontantType;

            if (apiResponse && apiResponse.data) {
                updatedAssociation = apiResponse.data;
            } else {
                // Si l'API ne retourne pas les données mises à jour, on reconstruit localement
                // On trouve l'association originale pour garder son ID
                const originalAssociation = this.state.associations.find(a =>
                    a.idTypeOperation === updateRequest.currentIdTypeOperation &&
                    a.idTypeMontant === updateRequest.currentIdTypeMontant
                );

                updatedAssociation = {
                    id: originalAssociation?.id || 0,
                    idTypeOperation: updateRequest.newIdTypeOperation,
                    idTypeMontant: updateRequest.newIdTypeMontant,
                    libelleTypeOperation: this.getTypeOperationLibelle(updateRequest.newIdTypeOperation),
                    libelleTypeMontant: this.getTypeMontantLibelle(updateRequest.newIdTypeMontant)
                };
            }

            // Enrichir avec les libellés
            const enrichedAssociation: OperationMontantType = {
                ...updatedAssociation,
                libelleTypeOperation: this.getTypeOperationLibelle(updatedAssociation.idTypeOperation),
                libelleTypeMontant: this.getTypeMontantLibelle(updatedAssociation.idTypeMontant)
            };

            // Mettre à jour l'état local
            this.updateState({
                associations: this.state.associations.map(a =>
                    (a.idTypeOperation === updateRequest.currentIdTypeOperation && 
                     a.idTypeMontant === updateRequest.currentIdTypeMontant) 
                        ? enrichedAssociation 
                        : a
                ),
                loading: false,
                error: null
            });

            return enrichedAssociation;
        } catch (error) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);

            this.updateState({ error: errorMessage, loading: false });
            throw error;
        }
    }

    async delete(deleteRequest: DeleteOperationMontantTypeRequest): Promise<void> {
        if (!deleteRequest.idTypeOperation || !deleteRequest.idTypeMontant) {
            const error = new Error('IDs manquants pour la suppression');
            this.updateState({ error: 'IDs manquants pour la suppression', loading: false });
            throw error;
        }

        this.updateState({ loading: true, error: null });

        try {
            // Envoyer les IDs comme paramètres de requête pour la suppression
            await this.httpService.delete(
                `${this.endpoint}?idTypeOperation=${deleteRequest.idTypeOperation}&idTypeMontant=${deleteRequest.idTypeMontant}`
            );

            // Supprimer de l'état local
            this.updateState({
                associations: this.state.associations.filter(a =>
                    !(a.idTypeOperation === deleteRequest.idTypeOperation &&
                        a.idTypeMontant === deleteRequest.idTypeMontant)
                ),
                loading: false,
                error: null
            });
        } catch (error) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);

            this.updateState({ error: errorMessage, loading: false });
            throw error;
        }
    }

    // Méthodes utilitaires
    getTypeOperationLibelle(id: number): string {
        const type = this.state.typesOperation.find(t => t.id === id);
        return type?.libelle || 'Inconnu';
    }

    getTypeMontantLibelle(id: number): string {
        const type = this.state.typesMontant.find(t => t.id === id);
        return type?.libelle || 'Inconnu';
    }

    selectAssociation(association: OperationMontantType | null): void {
        this.updateState({ selectedAssociation: association });
    }

    getCurrentState(): OperationMontantTypeState {
        return { ...this.state };
    }

    clearError(): void {
        this.updateState({ error: null });
    }
}