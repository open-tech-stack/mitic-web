// @/services/compte-type/compte-type.service.ts

import { ErrorHandlerService, AppError } from '@/services/core/error-handler.service';
import { ServiceFactory } from '@/services/factory/factory.service';
import { ApiResponse, CompteType, CompteTypeState, CompteTypeValidator } from '@/types/typeCompte.types';

export class CompteTypeService {
    private static instance: CompteTypeService;
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();
    private apiEndpoint = 'type-comptes';

    private state: CompteTypeState = {
        types: [],
        loading: false,
        error: null
    };

    private subscribers: Array<(state: CompteTypeState) => void> = [];

    public static getInstance(): CompteTypeService {
        if (!CompteTypeService.instance) {
            CompteTypeService.instance = new CompteTypeService();
        }
        return CompteTypeService.instance;
    }

    /**
     * Obtient l'état actuel
     */
    public getState(): CompteTypeState {
        return { ...this.state };
    }

    /**
     * Souscrire aux changements d'état
     */
    public subscribe(callback: (state: CompteTypeState) => void): () => void {
        this.subscribers.push(callback);

        // Envoi immédiat de l'état actuel
        callback(this.state);

        // Retourne une fonction de désabonnement
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Notifie tous les abonnés du changement d'état
     */
    private notifySubscribers(): void {
        const currentState = this.getState();
        this.subscribers.forEach(callback => callback(currentState));
    }

    /**
     * Met à jour l'état de manière immuable
     */
    private setState(updater: (prevState: CompteTypeState) => CompteTypeState): void {
        this.state = updater(this.state);
        this.notifySubscribers();
    }

    /**
     * Gère les erreurs et met à jour l'état
     */
    private handleError(error: any, context: string): AppError {
        const normalizedError = this.errorHandler.normalizeError(error);

        this.setState(prev => ({
            ...prev,
            loading: false,
            error: this.errorHandler.getUserMessage(normalizedError)
        }));

        this.errorHandler.logError(normalizedError, `CompteTypeService - ${context}`);
        return normalizedError;
    }

    /**
     * Charge tous les types de comptes
     */
    public async loadAll(): Promise<CompteType[]> {
        this.setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await this.httpService.get<ApiResponse<CompteType[]>>(this.apiEndpoint);

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors du chargement des types de comptes');
            }

            this.setState(prev => ({
                ...prev,
                types: response.data || [],
                loading: false
            }));

            return response.data || [];
        } catch (error) {
            this.handleError(error, 'loadAll');
            throw error;
        }
    }

    /**
     * Crée un nouveau type de compte
     */
    public async create(type: Omit<CompteType, 'id'>): Promise<CompteType> {
        // Validation
        const errors = CompteTypeValidator.validateCreation(type);
        if (errors.length > 0) {
            const error = new Error(errors.join(', ')) as any;
            error.type = 'VALIDATION_ERROR';
            throw error;
        }

        this.setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await this.httpService.post<ApiResponse<CompteType>>(
                this.apiEndpoint,
                type
            );

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors de la création du type de compte');
            }

            const newType = response.data;

            this.setState(prev => ({
                ...prev,
                types: [...prev.types, newType],
                loading: false
            }));

            return newType;
        } catch (error) {
            this.handleError(error, 'create');
            throw error;
        }
    }

    /**
     * Met à jour un type de compte existant
     */
    public async update(type: CompteType): Promise<CompteType> {
        // Validation - Vérification plus robuste de l'ID
        if (!type || typeof type.id === 'undefined' || type.id === null) {
            const error = new Error('ID manquant pour la modification') as any;
            error.type = 'VALIDATION_ERROR';
            throw error;
        }

        const errors = CompteTypeValidator.validateUpdate(type);
        if (errors.length > 0) {
            const error = new Error(errors.join(', ')) as any;
            error.type = 'VALIDATION_ERROR';
            throw error;
        }

        this.setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await this.httpService.put<ApiResponse<CompteType>>(
                `${this.apiEndpoint}/${type.id}`,
                type
            );

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors de la mise à jour du type de compte');
            }

            // GESTION CORRIGÉE : Si l'API ne retourne pas les données, on utilise les données envoyées
            let updatedType: CompteType;

            if (response.data) {
                // Cas normal : l'API retourne les données mises à jour
                updatedType = response.data;
            } else {
                // Cas où l'API ne retourne pas de données : on utilise les données envoyées
                console.warn('Aucune donnée retournée par l\'API, utilisation des données locales');
                updatedType = type;
            }

            this.setState(prev => ({
                ...prev,
                types: prev.types.map(t => t.id === updatedType.id ? updatedType : t),
                loading: false
            }));

            return updatedType;
        } catch (error) {
            this.handleError(error, 'update');
            throw error;
        }
    }

    /**
     * Supprime un type de compte
     */
    public async delete(id: number): Promise<void> {
        this.setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await this.httpService.delete<ApiResponse<void>>(
                `${this.apiEndpoint}/${id}`
            );

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors de la suppression du type de compte');
            }

            this.setState(prev => ({
                ...prev,
                types: prev.types.filter(t => t.id !== id),
                loading: false
            }));
        } catch (error) {
            this.handleError(error, 'delete');
            throw error;
        }
    }

    /**
     * Réinitialise l'état d'erreur
     */
    public clearError(): void {
        this.setState(prev => ({ ...prev, error: null }));
    }

    /**
     * Récupère un type de compte par son ID
     */
    public getById(id: number): CompteType | undefined {
        return this.state.types.find(t => t.id === id);
    }

    /**
     * Récupère les types de comptes (getter)
     */
    public get types(): CompteType[] {
        return [...this.state.types];
    }

    /**
     * Vérifie si le service est en cours de chargement
     */
    public get isLoading(): boolean {
        return this.state.loading;
    }

    /**
     * Récupère l'erreur actuelle
     */
    public get error(): string | null {
        return this.state.error;
    }
}