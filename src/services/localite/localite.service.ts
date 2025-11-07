// @/services/localite/localite.service.ts
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import {
    Localite,
    LocaliteCreateRequest,
    LocaliteUpdateRequest,
    LocaliteApiResponse,
    LocaliteStats,
    LocaliteState
} from "@/types/localite.types";
import { ServiceFactory } from "../factory/factory.service";

export interface Troncon {
    id: number;
    libelleTroncon: string;
}

export class LocaliteService {
    private static instance: LocaliteService;
    private readonly endpoint = 'localites';
    private readonly tronconEndpoint = 'troncons/allTroncons';
    private httpService: any;
    private errorHandler: ErrorHandlerService;

    // État du service
    private state: LocaliteState = {
        localites: [],
        loading: false,
        selectedLocalite: null,
        error: null
    };

    // Callbacks pour les mises à jour d'état
    private stateUpdateCallbacks: ((state: LocaliteState) => void)[] = [];

    private constructor() {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        this.httpService = ServiceFactory.createHttpService({ baseUrl });
        this.errorHandler = ErrorHandlerService.getInstance();
    }

    public static getInstance(): LocaliteService {
        if (!LocaliteService.instance) {
            LocaliteService.instance = new LocaliteService();
        }
        return LocaliteService.instance;
    }

    // Méthode pour s'abonner aux changements d'état
    subscribe(callback: (state: LocaliteState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        callback(this.state);
        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    // Mettre à jour l'état et notifier les abonnés
    private updateState(newState: Partial<LocaliteState>): void {
        this.state = { ...this.state, ...newState };
        this.stateUpdateCallbacks.forEach(callback => callback(this.state));
    }

    // Accesseurs
    get localites(): Localite[] {
        return this.state.localites;
    }

    get loading(): boolean {
        return this.state.loading;
    }

    get selectedLocalite(): Localite | null {
        return this.state.selectedLocalite;
    }

    get error(): string | null {
        return this.state.error;
    }

    // Computed pour les statistiques
    get stats(): LocaliteStats {
        const localites = this.state.localites;
        const total = localites.length;
        const virtuelles = localites.filter(l => l.virtuel).length;
        const reelles = total - virtuelles;

        return { total, virtuelles, reelles };
    }

    // Nouvelle méthode pour récupérer les tronçons
    async getTroncons(): Promise<Troncon[]> {
        try {
            const response = await this.httpService.get(this.tronconEndpoint);
            return response.data || [];
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            throw new Error(errorMessage);
        }
    }

    async loadAllLocalites(): Promise<Localite[]> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: LocaliteApiResponse = await this.httpService.get(this.endpoint);

            const localitesFiltrees = (apiResponse.data || []).filter(
                loc => loc.codeLoc !== null && loc.codeLoc !== undefined && loc.codeLoc !== ''
            );

            const uniques = localitesFiltrees.filter(
                (loc, index, self) =>
                    index === self.findIndex(l => l.codeLoc === loc.codeLoc)
            );

            this.updateState({
                localites: uniques,
                loading: false
            });

            return uniques;
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            this.updateState({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    }

    // Dans la méthode createLocalite
    async createLocalite(localiteData: LocaliteCreateRequest): Promise<Localite> {
        this.updateState({ loading: true, error: null });

        try {
            // S'assurer que tronconId est un tableau même si vide
            const dataToSend = {
                ...localiteData,
                tronconId: localiteData.tronconId || []
            };

            // 🔥 CONSOLE LOG - Voir ce qui est envoyé au backend
            console.log('🔄 DONNÉES ENVOYÉES AU BACKEND:', {
                endpoint: this.endpoint,
                data: dataToSend,
                tronconId: dataToSend.tronconId,
                typeTronconId: typeof dataToSend.tronconId,
                isArray: Array.isArray(dataToSend.tronconId),
                arrayLength: Array.isArray(dataToSend.tronconId) ? dataToSend.tronconId.length : 'N/A'
            });

            const createdLocalite: Localite = await this.httpService.post(this.endpoint, dataToSend);

            this.updateState({
                localites: [...this.state.localites, createdLocalite],
                loading: false
            });

            return createdLocalite;
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            this.updateState({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    }

    // Dans la méthode updateLocalite
    async updateLocalite(id: number, localiteData: Partial<LocaliteUpdateRequest>): Promise<Localite> {
        this.updateState({ loading: true, error: null });

        try {
            // S'assurer que tronconId est un tableau même si vide
            const dataToSend = {
                ...localiteData,
                tronconId: localiteData.tronconId || []
            };

            const url = `${this.endpoint}/${id}`;
            const updatedLocalite: Localite = await this.httpService.put(url, dataToSend);

            const updatedLocalites = this.state.localites.map(l =>
                l.id === id ? { ...l, ...updatedLocalite } : l
            );

            const updatedSelectedLocalite = this.state.selectedLocalite?.id === id
                ? { ...this.state.selectedLocalite, ...updatedLocalite }
                : this.state.selectedLocalite;

            this.updateState({
                localites: updatedLocalites,
                selectedLocalite: updatedSelectedLocalite,
                loading: false
            });

            return updatedLocalite;
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            this.updateState({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    }

    async deleteLocalite(id: number): Promise<void> {
        this.updateState({ loading: true, error: null });

        try {
            const url = `${this.endpoint}/${id}`;
            await this.httpService.delete(url);

            const filteredLocalites = this.state.localites.filter(l => l.id !== id);
            const updatedSelectedLocalite = this.state.selectedLocalite?.id === id
                ? null
                : this.state.selectedLocalite;

            this.updateState({
                localites: filteredLocalites,
                selectedLocalite: updatedSelectedLocalite,
                loading: false
            });
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            this.updateState({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    }

    async deleteLocalites(ids: number[]): Promise<void> {
        this.updateState({ loading: true, error: null });

        try {
            const deletePromises = ids.map(async id => {
                try {
                    await this.deleteLocalite(id);
                    return { success: true, id };
                } catch (error) {
                    console.error(`Error deleting localite ${id}:`, error);
                    return { success: false, id, error };
                }
            });

            await Promise.all(deletePromises);
            this.updateState({ loading: false });
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            this.updateState({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    }

    selectLocalite(localite: Localite | null): void {
        this.updateState({ selectedLocalite: localite });
    }

    // Méthodes pour vérifier l'unicité
    checkCodeLocExists(codeLoc: string, excludeId?: number): boolean {
        return this.state.localites.some(l =>
            l.codeLoc === codeLoc && l.id !== excludeId
        );
    }

    checkLibLocExists(libLoc: string, excludeId?: number): boolean {
        return this.state.localites.some(l =>
            l.libLoc.toLowerCase() === libLoc.toLowerCase() && l.id !== excludeId
        );
    }

    getLocaliteByCodeLoc(codeLoc: string): Localite | undefined {
        return this.state.localites.find(l => l.codeLoc === codeLoc);
    }

    getLocaliteById(id: number): Localite | undefined {
        return this.state.localites.find(l => l.id === id);
    }

    // Méthode pour obtenir les localités formatées pour les dropdowns
    getLocalitesForDropdown(): Array<{ id: string; libLoc: string }> {
        return this.state.localites.map(localite => ({
            id: localite.id.toString(),
            libLoc: localite.libLoc
        }));
    }

    // Réinitialiser l'état du service
    resetState(): void {
        this.updateState({
            localites: [],
            loading: false,
            selectedLocalite: null,
            error: null
        });
    }
}