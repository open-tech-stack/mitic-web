import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "../factory/factory.service";
import { Abonne, AbonneCreate, AbonneUpdate, AbonneValidator, ApiResponse } from "@/types/abonne.types";

interface AbonneState {
    abonnes: Abonne[];
    loading: boolean;
    error: string | null;
    selectedAbonne: Abonne | null;
}

export class AbonneService {
    private static instance: AbonneService;
    private readonly endpoint = 'abonnes';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();

    private state: AbonneState = {
        abonnes: [],
        loading: false,
        error: null,
        selectedAbonne: null
    };

    private stateUpdateCallbacks: ((state: AbonneState) => void)[] = [];

    public static getInstance(): AbonneService {
        if (!AbonneService.instance) {
            AbonneService.instance = new AbonneService();
        }
        return AbonneService.instance;
    }

    subscribe(callback: (state: AbonneState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        callback(this.state);

        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    private updateState(newState: Partial<AbonneState>): void {
        this.state = { ...this.state, ...newState };
        this.stateUpdateCallbacks.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du callback:', error);
            }
        });
    }

    async loadAll(): Promise<Abonne[]> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: ApiResponse<Abonne[]> = await this.httpService.get(this.endpoint);
            const abonnes = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            this.updateState({
                abonnes: abonnes,
                loading: false,
                error: null
            });

            return abonnes;
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

    async create(abonneData: AbonneCreate): Promise<Abonne> {
        this.updateState({ loading: true, error: null });

        try {
            // Validation
            const existingImatriculations = this.state.abonnes.map(a => a.immatriculation.toLowerCase());
            const existingCnibs = this.state.abonnes.map(a => a.cnib.toLowerCase());

            const validationErrors = AbonneValidator.validate(abonneData, existingImatriculations, existingCnibs);

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            const apiResponse: ApiResponse<Abonne> = await this.httpService.post(this.endpoint, abonneData);

            let newAbonne: Abonne;

            if (apiResponse && apiResponse.data) {
                newAbonne = apiResponse.data;
            } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
                const { id, nom, prenom, cnib, nbreTel, immatriculation } = apiResponse as any;
                newAbonne = { id, nom, prenom, cnib, nbreTel, immatriculation } as Abonne;
            } else {
                console.warn('Réponse de création non standard, rechargement des données...');
                await this.loadAll();
                return this.state.abonnes[this.state.abonnes.length - 1];
            }

            this.updateState({
                abonnes: [...this.state.abonnes, newAbonne],
                loading: false,
                error: null
            });

            return newAbonne;
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

    async update(abonneData: AbonneUpdate): Promise<Abonne> {
        if (!abonneData || !abonneData.id) {
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
            const existingImatriculations = this.state.abonnes
                .filter(a => a.id !== abonneData.id)
                .map(a => a.immatriculation.toLowerCase());

            const existingCnibs = this.state.abonnes
                .filter(a => a.id !== abonneData.id)
                .map(a => a.cnib.toLowerCase());

            const validationErrors = AbonneValidator.validate(abonneData, existingImatriculations, existingCnibs);

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            const url = `${this.endpoint}/${abonneData.id}`;
            const apiResponse: ApiResponse<Abonne> = await this.httpService.put(url, abonneData);

            let updatedAbonne: Abonne;

            if (apiResponse && apiResponse.data) {
                updatedAbonne = apiResponse.data;
            } else if (apiResponse && typeof apiResponse === 'object' && 'id' in apiResponse) {
                const { id, nom, prenom, cnib, nbreTel, immatriculation } = apiResponse as any;
                updatedAbonne = { id, nom, prenom, cnib, nbreTel, immatriculation } as Abonne;
            } else {
                console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
                updatedAbonne = { ...abonneData } as Abonne;
            }

            const updatedAbonnes = this.state.abonnes.map(abonne =>
                abonne.id === abonneData.id ? updatedAbonne : abonne
            );

            this.updateState({
                abonnes: updatedAbonnes,
                loading: false,
                error: null
            });

            return updatedAbonne;
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
                abonnes: this.state.abonnes.filter(a => a.id !== id),
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

    selectAbonne(abonne: Abonne | null): void {
        this.updateState({ selectedAbonne: abonne });
    }

    getCurrentState(): AbonneState {
        return { ...this.state };
    }

    clearError(): void {
        this.updateState({ error: null });
    }

    // Recherche d'abonné par immatriculation
    findByImatriculation(immatriculation: string): Abonne | undefined {
        return this.state.abonnes.find(a =>
            a.immatriculation.toLowerCase() === immatriculation.toLowerCase()
        );
    }

    // Recherche d'abonné par CNIB
    findByCnib(cnib: string): Abonne | undefined {
        return this.state.abonnes.find(a =>
            a.cnib.toLowerCase() === cnib.toLowerCase()
        );
    }
}