import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "../factory/factory.service";
import {
    AbonnementTarif,
    AbonnementTarifCreate,
    AbonnementTarifUpdate,
    AbonnementTarifCreateBackend,
    AbonnementTarifValidator,
    ApiResponse,
    CreationInfo
} from "@/types/period-tarif.types";

interface AbonnementTarifState {
    tarifs: AbonnementTarif[];
    creationInfo: CreationInfo | null;
    loading: boolean;
    error: string | null;
    selectedTarif: AbonnementTarif | null;
}

export class AbonnementTarifService {
    private static instance: AbonnementTarifService;
    private readonly endpoint = 'tarifs-abonnement';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();

    private state: AbonnementTarifState = {
        tarifs: [],
        creationInfo: null,
        loading: false,
        error: null,
        selectedTarif: null
    };

    private stateUpdateCallbacks: ((state: AbonnementTarifState) => void)[] = [];

    public static getInstance(): AbonnementTarifService {
        if (!AbonnementTarifService.instance) {
            AbonnementTarifService.instance = new AbonnementTarifService();
        }
        return AbonnementTarifService.instance;
    }

    subscribe(callback: (state: AbonnementTarifState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        callback(this.state);

        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    private updateState(newState: Partial<AbonnementTarifState>): void {
        this.state = { ...this.state, ...newState };
        this.stateUpdateCallbacks.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du callback:', error);
            }
        });
    }

    async loadCreationInfo(): Promise<CreationInfo> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: ApiResponse<CreationInfo> = await this.httpService.get(`${this.endpoint}/info-creation`);
            const creationInfo = apiResponse.data;
            console.log('Creation Info:', apiResponse.data);
            this.updateState({
                creationInfo: creationInfo,
                loading: false,
                error: null
            });

            return creationInfo;
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

    async loadAll(): Promise<AbonnementTarif[]> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: ApiResponse<AbonnementTarif[]> = await this.httpService.get(this.endpoint);
            const tarifs = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            this.updateState({
                tarifs: tarifs,
                loading: false,
                error: null
            });

            return tarifs;
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

    // Convertir les données du formulaire pour le backend
    private convertToBackendFormat(formData: AbonnementTarifCreate, creationInfo: CreationInfo): AbonnementTarifCreateBackend {
        // Trouver l'ID de la catégorie
        const categorie = creationInfo.categorieDto.find(cat =>
            cat.libelle[0] === formData.type
        );

        if (!categorie) {
            throw new Error('Catégorie non trouvée');
        }

        // Trouver l'ID de la périodicité
        const periodicite = creationInfo.periodicityAbonnementDtos.find(period =>
            period.periodicityName === formData.periodicite
        );

        if (!periodicite) {
            throw new Error('Périodicité non trouvée');
        }

        return {
            categoryId: categorie.id,
            periodeId: periodicite.id,
            nbreEssieux: formData.nombre_essieux,
            montant: formData.montant
        };
    }

    // Convertir les données du backend vers le format du formulaire
    private convertToFormFormat(backendData: AbonnementTarif, creationInfo: CreationInfo): AbonnementTarifCreate {
        // Trouver le libellé de la catégorie
        const categorie = creationInfo.categorieDto.find(cat =>
            cat.id === backendData.categoryId
        );

        // Trouver le libellé de la périodicité
        const periodicite = creationInfo.periodicityAbonnementDtos.find(period =>
            period.id === backendData.periodeId
        );

        return {
            type: categorie?.libelle[0] || backendData.libelle,
            periodicite: periodicite?.periodicityName || backendData.periodelibelle,
            nombre_essieux: backendData.nbreEssieux,
            montant: backendData.montant
        };
    }

    async create(tarifData: AbonnementTarifCreate): Promise<AbonnementTarif> {
        this.updateState({ loading: true, error: null });

        try {
            // Validation
            const validationErrors = AbonnementTarifValidator.validate(tarifData, this.state.tarifs);

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            // Vérifier que creationInfo est disponible
            if (!this.state.creationInfo) {
                throw new Error('Informations de création non disponibles');
            }

            // Convertir les données pour le backend
            const backendData = this.convertToBackendFormat(tarifData, this.state.creationInfo);
            console.log('Données envoyées au backend:', backendData);

            const apiResponse: ApiResponse<AbonnementTarif> = await this.httpService.post(this.endpoint, backendData);

            let newTarif: AbonnementTarif;

            if (apiResponse && apiResponse.data) {
                newTarif = apiResponse.data;
            } else {
                console.warn('Réponse de création non standard, rechargement des données...');
                await this.loadAll();
                return this.state.tarifs[this.state.tarifs.length - 1];
            }

            this.updateState({
                tarifs: [...this.state.tarifs, newTarif],
                loading: false,
                error: null
            });

            return newTarif;
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

    async update(tarifData: AbonnementTarifUpdate): Promise<AbonnementTarif> {
        if (!tarifData || !tarifData.id) {
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
            const otherTarifs = this.state.tarifs.filter(t => t.id !== tarifData.id);
            const validationErrors = AbonnementTarifValidator.validate(tarifData, otherTarifs);

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            // Vérifier que creationInfo est disponible
            if (!this.state.creationInfo) {
                throw new Error('Informations de création non disponibles');
            }

            // Convertir les données pour le backend
            const backendData = this.convertToBackendFormat(tarifData, this.state.creationInfo);
            console.log('Données de mise à jour envoyées au backend:', backendData);

            const url = `${this.endpoint}/${tarifData.id}`;
            const apiResponse: ApiResponse<AbonnementTarif> = await this.httpService.put(url, backendData);

            let updatedTarif: AbonnementTarif;

            if (apiResponse && apiResponse.data) {
                updatedTarif = apiResponse.data;
            } else {
                console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
                // Construire l'objet avec les données disponibles
                const existingTarif = this.state.tarifs.find(t => t.id === tarifData.id);
                updatedTarif = {
                    ...existingTarif,
                    ...tarifData,
                    libelle: tarifData.type,
                    periodelibelle: tarifData.periodicite
                } as AbonnementTarif;
            }

            // Mettre à jour la liste
            const updatedTarifs = this.state.tarifs.map(t =>
                t.id === tarifData.id ? updatedTarif : t
            );

            this.updateState({
                tarifs: updatedTarifs,
                loading: false,
                error: null
            });

            return updatedTarif;
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
                tarifs: this.state.tarifs.filter(t => t.id !== id),
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

    // Méthode pour préparer les données pour l'édition
    prepareForEdit(tarif: AbonnementTarif): AbonnementTarifCreate {
        if (!this.state.creationInfo) {
            return {
                type: tarif.libelle,
                periodicite: tarif.periodelibelle,
                nombre_essieux: tarif.nbreEssieux,
                montant: tarif.montant
            };
        }

        return this.convertToFormFormat(tarif, this.state.creationInfo);
    }

    selectTarif(tarif: AbonnementTarif | null): void {
        this.updateState({ selectedTarif: tarif });
    }

    getCurrentState(): AbonnementTarifState {
        return { ...this.state };
    }

    clearError(): void {
        this.updateState({ error: null });
    }
}