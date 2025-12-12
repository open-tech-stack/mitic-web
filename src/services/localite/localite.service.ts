// @/services/localite/localite.service.ts

import { ErrorHandlerService } from "@/services/core/error-handler.service";
import {
    Localite,
    LocaliteCreateRequest,
    LocaliteUpdateRequest,
    LocaliteApiResponse,
    LocaliteStats,
    LocaliteState,
    UoSimple
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
    private readonly uoEndpoint = 'arbre'; // Endpoint pour récupérer les UOs
    private httpService: any;
    private errorHandler: ErrorHandlerService;

    // État du service
    private state: LocaliteState = {
        localites: [],
        loading: false,
        selectedLocalite: null,
        error: null
    };

    // Cache pour les UOs
    private uos: UoSimple[] = [];

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

    // Nouvelle méthode pour récupérer les UOs
    async getUos(): Promise<UoSimple[]> {
        try {
            // Si déjà chargées, retourner depuis le cache
            if (this.uos.length > 0) {
                return this.uos;
            }

            const response = await this.httpService.get(this.uoEndpoint);

            // Convertir la réponse en tableau d'UOs simples
            const uosData = response.data || [];
            this.uos = this.flattenUos(uosData);

            return this.uos;
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            console.error("Erreur lors du chargement des UOs:", errorMessage);
            return []; // Retourner tableau vide en cas d'erreur
        }
    }

    // Méthode pour aplatir la hiérarchie des UOs
    private flattenUos(uosData: any[]): UoSimple[] {
        const result: UoSimple[] = [];

        const flatten = (nodes: any[]) => {
            nodes.forEach(node => {
                result.push({
                    codeUo: node.codeUo,
                    libUo: node.libUo
                });

                if (node.enfants && node.enfants.length > 0) {
                    flatten(node.enfants);
                }
            });
        };

        flatten(uosData);
        return result;
    }

    // Méthode pour obtenir le libellé d'une UO par son code
    getUoLibelle(codeUo: string): string {
        const uo = this.uos.find(u => u.codeUo === codeUo);
        return uo ? uo.libUo : codeUo; // Retourner le code si non trouvé
    }

    // Méthode pour récupérer les tronçons
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
            // Charger les UOs d'abord
            await this.getUos();

            const apiResponse: LocaliteApiResponse = await this.httpService.get(this.endpoint);

            const localitesFiltrees = (apiResponse.data || []).filter(
                loc => loc.codeLoc !== null && loc.codeLoc !== undefined && loc.codeLoc !== ''
            );

            // Ajouter le libellé UO à chaque localité
            const localitesEnrichies = localitesFiltrees.map(loc => ({
                ...loc,
                libelleUo: loc.codeUo ? this.getUoLibelle(loc.codeUo) : undefined
            }));

            const uniques = localitesEnrichies.filter(
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

    async createLocalite(localiteData: LocaliteCreateRequest): Promise<Localite> {
        this.updateState({ loading: true, error: null });

        try {
            // S'assurer que codeUo est présent
            if (!localiteData.codeUo) {
                throw new Error("L'UO est obligatoire pour créer une localité");
            }

            // S'assurer que tronconId est un tableau même si vide
            const dataToSend = {
                ...localiteData,
                tronconId: localiteData.tronconId || []
            };

            console.log('🔄 DONNÉES ENVOYÉES AU BACKEND:', {
                endpoint: this.endpoint,
                data: dataToSend,
                codeUo: dataToSend.codeUo
            });

            const createdLocalite: Localite = await this.httpService.post(this.endpoint, dataToSend);

            // Ajouter le libellé UO à la localité créée
            const localiteWithUo = {
                ...createdLocalite,
                libelleUo: createdLocalite.codeUo ? this.getUoLibelle(createdLocalite.codeUo) : undefined
            };

            this.updateState({
                localites: [...this.state.localites, localiteWithUo],
                loading: false
            });

            return localiteWithUo;
        } catch (error: any) {
            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);
            this.updateState({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    }

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

            // Ajouter le libellé UO à la localité mise à jour
            const localiteWithUo = {
                ...updatedLocalite,
                libelleUo: updatedLocalite.codeUo ? this.getUoLibelle(updatedLocalite.codeUo) : undefined
            };

            const updatedLocalites = this.state.localites.map(l =>
                l.id === id ? { ...l, ...localiteWithUo } : l
            );

            const updatedSelectedLocalite = this.state.selectedLocalite?.id === id
                ? { ...this.state.selectedLocalite, ...localiteWithUo }
                : this.state.selectedLocalite;

            this.updateState({
                localites: updatedLocalites,
                selectedLocalite: updatedSelectedLocalite,
                loading: false
            });

            return localiteWithUo;
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

    // Méthode pour obtenir les UOs formatées pour les dropdowns
    getUosForDropdown(): Array<{ value: string; label: string }> {
        return this.uos.map(uo => ({
            value: uo.codeUo,
            label: `${uo.codeUo} - ${uo.libUo}`
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
        this.uos = [];
    }
}