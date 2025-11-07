// @/services/caisse/caisse.service.ts
import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "../factory/factory.service";
import { ApiResponse, Caisse } from "@/types/caissier.types";

interface CaisseState {
    caisses: Caisse[];
    loading: boolean;
    error: string | null;
    selectedCaisse: Caisse | null;
}

export class CaisseService {
    private static instance: CaisseService;
    private readonly endpoint = 'affiche';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();

    private state: CaisseState = {
        caisses: [],
        loading: false,
        error: null,
        selectedCaisse: null
    };

    private stateUpdateCallbacks: ((state: CaisseState) => void)[] = [];

    public static getInstance(): CaisseService {
        if (!CaisseService.instance) {
            CaisseService.instance = new CaisseService();
        }
        return CaisseService.instance;
    }

    subscribe(callback: (state: CaisseState) => void): () => void {
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

    private updateState(newState: Partial<CaisseState>): void {
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

    async loadAll(): Promise<Caisse[]> {
        this.updateState({ loading: true, error: null });

        try {
            console.log('🔄 [CaisseService] Chargement des caisses depuis:', this.endpoint);

            const apiResponse: ApiResponse<Caisse[]> = await this.httpService.get(this.endpoint);

            console.log('✅ [CaisseService] Réponse API reçue:', {
                success: apiResponse.success,
                status: apiResponse.status,
                message: apiResponse.message,
                dataLength: Array.isArray(apiResponse.data) ? apiResponse.data.length : 'Not an array'
            });

            const caisses = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            this.updateState({
                caisses: caisses,
                loading: false,
                error: null
            });

            return caisses;
        } catch (error: any) {
            console.error('❌ [CaisseService] Erreur lors du chargement:', error);

            if (error.status === 401) {
                console.log('🔄 [CaisseService] Erreur 401 - Session expirée');
                this.updateState({
                    error: 'Votre session a expiré. Veuillez vous reconnecter.',
                    loading: false
                });
                throw error;
            }

            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);

            this.updateState({
                error: errorMessage,
                loading: false
            });

            throw error;
        }
    }

    async updateStateCaisse(idCaisse: number, montantPhysique: number, montantTheorique: number): Promise<Caisse> {
        // Récupérer les données de la caisse existante
        const existingCaisse = this.state.caisses.find(c => c.idCaisse === idCaisse);

        if (!existingCaisse) {
            const error = new Error('Caisse non trouvée');
            this.updateState({
                error: 'Caisse non trouvée pour la mise à jour',
                loading: false
            });
            throw error;
        }

        // Utiliser les montants existants de la caisse
        const finalMontantPhysique = montantPhysique !== undefined ? montantPhysique : existingCaisse.montantPhysique;
        const finalMontantTheorique = montantTheorique !== undefined ? montantTheorique : existingCaisse.montantTheorique;

        this.updateState({ loading: true, error: null });

        try {
            console.log('🔄 [CaisseService] Mise à jour de la caisse:', {
                idCaisse,
                montantPhysique: finalMontantPhysique,
                montantTheorique: finalMontantTheorique
            });

            const url = `${this.endpoint}`;
            const dataToSend = {
                idCaisse,
                montantPhysique: finalMontantPhysique,
                montantTheorique: finalMontantTheorique
            };

            // LOG DÉTAILLÉ POUR VOIR CE QUI EST ENVOYÉ
            console.log('📤 [CaisseService] Données à envoyer au format JSON:');
            console.log('🔹 URL:', url);
            console.log('🔹 Méthode: POST');
            console.log('🔹 Headers:', { 'Content-Type': 'application/json' });
            console.log('🔹 Body:', JSON.stringify(dataToSend, null, 2));
            console.log('🔹 Données structurées:', dataToSend);

            const apiResponse: ApiResponse<Caisse> = await this.httpService.post(url, dataToSend);

            console.log('✅ [CaisseService] Réponse de mise à jour reçue:');
            console.log('🔹 Status:', apiResponse.status);
            console.log('🔹 Success:', apiResponse.success);
            console.log('🔹 Message:', apiResponse.message);
            console.log('🔹 Données reçues:', apiResponse.data);

            let updatedCaisse: Caisse;

            if (apiResponse && apiResponse.data) {
                updatedCaisse = apiResponse.data;
                console.log('📊 [CaisseService] Caisse mise à jour avec succès:', updatedCaisse);
                
                // Recharger automatiquement la liste après une fermeture
                if (updatedCaisse.etatCompte === "FERME") {
                    console.log('🔄 [CaisseService] Rechargement automatique après fermeture');
                    setTimeout(() => {
                        this.loadAll();
                    }, 500);
                }
            } else {
                // Mise à jour locale si la réponse n'est pas standard
                updatedCaisse = { ...existingCaisse };
                updatedCaisse.montantPhysique = finalMontantPhysique;
                updatedCaisse.montantTheorique = finalMontantTheorique;
                console.log('⚠️ [CaisseService] Mise à jour locale effectuée:', updatedCaisse);
            }

            this.updateState({
                caisses: this.state.caisses.map(c =>
                    c.idCaisse === idCaisse ? updatedCaisse : c
                ),
                loading: false,
                error: null
            });

            return updatedCaisse;
        } catch (error: any) {
            console.error('❌ [CaisseService] Erreur lors de la mise à jour:');
            console.error('🔹 Error details:', error);
            console.error('🔹 Error status:', error.status);
            console.error('🔹 Error message:', error.message);

            if (error.status === 401) {
                console.log('🔄 [CaisseService] Erreur 401 - Session expirée lors de la mise à jour');
                this.updateState({
                    error: 'Votre session a expiré. Veuillez vous reconnecter.',
                    loading: false
                });
                throw error;
            }

            const appError = this.errorHandler.normalizeError(error);
            const errorMessage = this.errorHandler.getUserMessage(appError);

            this.updateState({
                error: errorMessage,
                loading: false
            });

            throw error;
        }
    }

    // Méthode pour sélectionner une caisse
    selectCaisse(caisse: Caisse | null): void {
        this.updateState({ selectedCaisse: caisse });
    }

    // Méthode pour récupérer l'état actuel
    getCurrentState(): CaisseState {
        return { ...this.state };
    }

    // Méthode pour réinitialiser l'état d'erreur
    clearError(): void {
        this.updateState({ error: null });
    }
}