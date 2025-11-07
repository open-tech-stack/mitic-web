// @/services/periodicite/periodicite.service.ts

import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ApiResponse, Periodicite, PeriodiciteValidator } from "@/types/periodicity.types";
import { ServiceFactory } from "../factory/factory.service";

interface PeriodiciteState {
    periodicites: Periodicite[];
    loading: boolean;
    error: string | null;
    selectedPeriodicite: Periodicite | null;
}

export class PeriodiciteService {
    private static instance: PeriodiciteService;
    private readonly endpoint = 'periodicite-ticket';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();

    private state: PeriodiciteState = {
        periodicites: [],
        loading: false,
        error: null,
        selectedPeriodicite: null
    };

    private stateUpdateCallbacks: ((state: PeriodiciteState) => void)[] = [];

    public static getInstance(): PeriodiciteService {
        if (!PeriodiciteService.instance) {
            PeriodiciteService.instance = new PeriodiciteService();
        }
        return PeriodiciteService.instance;
    }

    subscribe(callback: (state: PeriodiciteState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        // Envoi immédiat de l'état actuel
        callback(this.state);

        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    private updateState(newState: Partial<PeriodiciteState>): void {
        this.state = { ...this.state, ...newState };
        // Notification immédiate de tous les abonnés
        this.stateUpdateCallbacks.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du callback:', error);
            }
        });
    }

    async loadAll(): Promise<Periodicite[]> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: ApiResponse<Periodicite[]> = await this.httpService.get(this.endpoint);
            const periodicites = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            this.updateState({
                periodicites: periodicites,
                loading: false,
                error: null
            });

            return periodicites;
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

    async create(periodiciteData: Omit<Periodicite, 'id'>): Promise<Periodicite> {
        this.updateState({ loading: true, error: null });

        try {
            // Validation
            const validationErrors = PeriodiciteValidator.validate(periodiciteData,
                this.state.periodicites.map(p => p.libelle.toLowerCase())
            );

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            // Si on active une nouvelle périodicité, désactiver toutes les autres
            let updatedPeriodicites = [...this.state.periodicites];

            if (periodiciteData.actif) {
                updatedPeriodicites = updatedPeriodicites.map(p => ({
                    ...p,
                    actif: false
                }));
            }

            // Préparer les données à envoyer
            const dataToSend = {
                libelle: periodiciteData.libelle,
                actif: periodiciteData.actif
            };

            const apiResponse: ApiResponse<Periodicite> = await this.httpService.post(this.endpoint, dataToSend);

            // Validation plus flexible de la réponse
            let newPeriodicite: Periodicite;

            if (apiResponse && apiResponse.data) {
                newPeriodicite = apiResponse.data;
            } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
                // Si la réponse directe contient l'objet créé
                const { id, libelle, actif } = apiResponse as any;
                newPeriodicite = { id, libelle, actif } as Periodicite;
            } else {
                // En dernier recours, rechargeons les données depuis le serveur
                console.warn('Réponse de création non standard, rechargement des données...');
                await this.loadAll();
                return this.state.periodicites[this.state.periodicites.length - 1];
            }

            this.updateState({
                periodicites: [...updatedPeriodicites, newPeriodicite],
                loading: false,
                error: null
            });

            return newPeriodicite;
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

    async update(periodiciteData: Periodicite): Promise<Periodicite> {
        // Vérification préalable
        if (!periodiciteData || !periodiciteData.id) {
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
            const validationErrors = PeriodiciteValidator.validate(periodiciteData,
                this.state.periodicites
                    .filter(p => p.id !== periodiciteData.id)
                    .map(p => p.libelle.toLowerCase())
            );

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            // Si on active cette périodicité, désactiver toutes les autres
            let updatedPeriodicites = [...this.state.periodicites];

            if (periodiciteData.actif) {
                updatedPeriodicites = updatedPeriodicites.map(p => ({
                    ...p,
                    actif: p.id === periodiciteData.id
                }));
            } else {
                // Si on désactive la seule périodicité active, on ne permet pas
                const activePeriodicites = updatedPeriodicites.filter(p => p.actif);
                if (activePeriodicites.length === 1 && activePeriodicites[0].id === periodiciteData.id) {
                    const errorMessage = "Il doit y avoir au moins une périodicité active.";
                    this.updateState({
                        error: errorMessage,
                        loading: false
                    });
                    throw new Error(errorMessage);
                }

                updatedPeriodicites = updatedPeriodicites.map(p =>
                    p.id === periodiciteData.id ? periodiciteData : p
                );
            }

            // Préparer les données à envoyer
            const dataToSend = {
                libelle: periodiciteData.libelle,
                actif: periodiciteData.actif
            };

            const url = `${this.endpoint}/${periodiciteData.id}`;
            const apiResponse: ApiResponse<Periodicite> = await this.httpService.put(url, dataToSend);

            // Validation plus flexible de la réponse
            let updatedPeriodicite: Periodicite;

            if (apiResponse && apiResponse.data) {
                updatedPeriodicite = apiResponse.data;
            } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
                // Si la réponse directe contient l'objet mis à jour
                const { id, libelle, actif } = apiResponse as any;
                updatedPeriodicite = { id, libelle, actif } as Periodicite;
            } else {
                // En dernier recours, utilisons les données que nous avons envoyées
                console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
                updatedPeriodicite = periodiciteData;
            }

            this.updateState({
                periodicites: updatedPeriodicites,
                loading: false,
                error: null
            });

            return updatedPeriodicite;
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

        const periodiciteToDelete = this.state.periodicites.find(p => p.id === id);

        // Empêcher la suppression si c'est la seule périodicité active
        if (periodiciteToDelete?.actif) {
            const activePeriodicites = this.state.periodicites.filter(p => p.actif);
            if (activePeriodicites.length === 1) {
                const errorMessage = "Impossible de supprimer la seule périodicité active. Activez d'abord une autre périodicité.";
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }
        }

        this.updateState({ loading: true, error: null });

        try {
            const url = `${this.endpoint}/${id}`;
            await this.httpService.delete(url);

            // Suppression réelle de la liste
            this.updateState({
                periodicites: this.state.periodicites.filter(p => p.id !== id),
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

    // Méthode pour sélectionner une périodicité
    selectPeriodicite(periodicite: Periodicite | null): void {
        this.updateState({ selectedPeriodicite: periodicite });
    }

    // Méthode pour récupérer l'état actuel
    getCurrentState(): PeriodiciteState {
        return { ...this.state };
    }

    // Méthode pour réinitialiser l'état d'erreur
    clearError(): void {
        this.updateState({ error: null });
    }
}