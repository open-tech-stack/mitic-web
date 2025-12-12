import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "../factory/factory.service";
import { Abonnement, AbonnementCreate, AbonnementValidator, AbonnementUpdate, ApiResponse } from "@/types/abonnement.types";

interface AbonnementState {
    abonnements: Abonnement[];
    loading: boolean;
    error: string | null;
    selectedAbonnement: Abonnement | null;
}

export class AbonnementService {
    private static instance: AbonnementService;
    private readonly endpoint = 'abonnements';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();

    private state: AbonnementState = {
        abonnements: [],
        loading: false,
        error: null,
        selectedAbonnement: null
    };

    private stateUpdateCallbacks: ((state: AbonnementState) => void)[] = [];

    public static getInstance(): AbonnementService {
        if (!AbonnementService.instance) {
            AbonnementService.instance = new AbonnementService();
        }
        return AbonnementService.instance;
    }

    subscribe(callback: (state: AbonnementState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        callback(this.state);

        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    private updateState(newState: Partial<AbonnementState>): void {
        this.state = { ...this.state, ...newState };
        this.stateUpdateCallbacks.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du callback:', error);
            }
        });
    }

    async loadAll(): Promise<Abonnement[]> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: ApiResponse<Abonnement[]> = await this.httpService.get(this.endpoint);
            const abonnements = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            this.updateState({
                abonnements: abonnements,
                loading: false,
                error: null
            });

            return abonnements;
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

    async create(abonnementData: AbonnementCreate): Promise<Abonnement> {
        this.updateState({ loading: true, error: null });

        try {
            // Validation
            const validationErrors = AbonnementValidator.validate(abonnementData);

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            const apiResponse: ApiResponse<Abonnement> = await this.httpService.post(this.endpoint, abonnementData);

            let newAbonnement: Abonnement;

            if (apiResponse && apiResponse.data) {
                newAbonnement = apiResponse.data;
            } else {
                console.warn('Réponse de création non standard, rechargement des données...');
                await this.loadAll();
                return this.state.abonnements[this.state.abonnements.length - 1];
            }

            this.updateState({
                abonnements: [...this.state.abonnements, newAbonnement],
                loading: false,
                error: null
            });

            return newAbonnement;
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

    async update(abonnementData: AbonnementUpdate): Promise<Abonnement> {
        if (!abonnementData || !abonnementData.id) {
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
            const validationErrors = AbonnementValidator.validate(abonnementData);

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            const url = `${this.endpoint}/${abonnementData.id}`;
            const apiResponse: ApiResponse<Abonnement> = await this.httpService.put(url, abonnementData);

            let updatedAbonnement: Abonnement;

            if (apiResponse && apiResponse.data) {
                updatedAbonnement = apiResponse.data;
            } else {
                console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
                updatedAbonnement = { ...abonnementData } as Abonnement;
            }

            const updatedAbonnements = this.state.abonnements.map(abonnement =>
                abonnement.id === abonnementData.id ? updatedAbonnement : abonnement
            );

            this.updateState({
                abonnements: updatedAbonnements,
                loading: false,
                error: null
            });

            return updatedAbonnement;
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
                abonnements: this.state.abonnements.filter(a => a.id !== id),
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

    selectAbonnement(abonnement: Abonnement | null): void {
        this.updateState({ selectedAbonnement: abonnement });
    }

    getCurrentState(): AbonnementState {
        return { ...this.state };
    }

    clearError(): void {
        this.updateState({ error: null });
    }

    // Récupérer les abonnements d'un abonné spécifique
    getByAbonneId(abonneId: number): Abonnement[] {
        return this.state.abonnements.filter(a => a.abonneId === abonneId);
    }

    // Vérifier si un abonné a des abonnements actifs
    hasActiveAbonnements(abonneId: number): boolean {
        return this.state.abonnements.some(a =>
            a.abonneId === abonneId && a.actif
        );
    }

    // Activer/désactiver un abonnement
    async toggleActif(id: number, actif: boolean): Promise<void> {
        if (!id) {
            throw new Error('ID manquant pour la modification du statut');
        }

        this.updateState({ loading: true, error: null });

        try {
            const url = `${this.endpoint}/${id}/actif`;
            const apiResponse: ApiResponse<Abonnement> = await this.httpService.patch(url, { actif });

            const updatedAbonnements = this.state.abonnements.map(abonnement =>
                abonnement.id === id ? { ...abonnement, actif } : abonnement
            );

            this.updateState({
                abonnements: updatedAbonnements,
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
}