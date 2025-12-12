import { ErrorHandlerService } from "@/services/core/error-handler.service";
import { ServiceFactory } from "../factory/factory.service";
import { ApiResponse } from "@/types/categorie.types";
import { Client, ClientCreate, ClientValidator, ClientUpdate } from "@/types/client.types";

interface ClientState {
    clients: Client[];
    loading: boolean;
    error: string | null;
    selectedClient: Client | null;
}

export class ClientService {
    private static instance: ClientService;
    private readonly endpoint = 'clients';
    private httpService = ServiceFactory.createHttpService({ baseUrl: process.env.NEXT_PUBLIC_API_URL || '' });
    private errorHandler = ErrorHandlerService.getInstance();

    private state: ClientState = {
        clients: [],
        loading: false,
        error: null,
        selectedClient: null
    };

    private stateUpdateCallbacks: ((state: ClientState) => void)[] = [];

    public static getInstance(): ClientService {
        if (!ClientService.instance) {
            ClientService.instance = new ClientService();
        }
        return ClientService.instance;
    }

    subscribe(callback: (state: ClientState) => void): () => void {
        this.stateUpdateCallbacks.push(callback);
        callback(this.state);

        return () => {
            const index = this.stateUpdateCallbacks.indexOf(callback);
            if (index > -1) {
                this.stateUpdateCallbacks.splice(index, 1);
            }
        };
    }

    private updateState(newState: Partial<ClientState>): void {
        this.state = { ...this.state, ...newState };
        this.stateUpdateCallbacks.forEach(callback => {
            try {
                callback(this.state);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du callback:', error);
            }
        });
    }

    async loadAll(): Promise<Client[]> {
        this.updateState({ loading: true, error: null });

        try {
            const apiResponse: ApiResponse<Client[]> = await this.httpService.get(this.endpoint);
            const clients = Array.isArray(apiResponse.data) ? apiResponse.data : [];

            this.updateState({
                clients: clients,
                loading: false,
                error: null
            });

            return clients;
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

    async create(clientData: ClientCreate): Promise<Client> {
        this.updateState({ loading: true, error: null });

        try {
            // Validation
            const existingCnibs = this.state.clients.map(c => c.numeroCNIB.toLowerCase());
            const existingUsernames = this.state.clients.map(c => c.username.toLowerCase());
            const existingEmails = this.state.clients
                .filter(c => c.email)
                .map(c => c.email.toLowerCase());

            const validationErrors = ClientValidator.validate(
                clientData,
                existingCnibs,
                existingUsernames,
                existingEmails
            );

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            const apiResponse: ApiResponse<Client> = await this.httpService.post(this.endpoint, clientData);

            let newClient: Client;

            if (apiResponse && apiResponse.data) {
                newClient = apiResponse.data;
            } else {
                console.warn('Réponse de création non standard, rechargement des données...');
                await this.loadAll();
                return this.state.clients[this.state.clients.length - 1];
            }

            this.updateState({
                clients: [...this.state.clients, newClient],
                loading: false,
                error: null
            });

            return newClient;
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

    async update(clientData: ClientUpdate): Promise<Client> {
        if (!clientData || !clientData.id) {
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
            const existingCnibs = this.state.clients
                .filter(c => c.id !== clientData.id)
                .map(c => c.numeroCNIB.toLowerCase());

            const existingUsernames = this.state.clients
                .filter(c => c.id !== clientData.id)
                .map(c => c.username.toLowerCase());

            const existingEmails = this.state.clients
                .filter(c => c.id !== clientData.id && c.email)
                .map(c => c.email.toLowerCase());

            const validationErrors = ClientValidator.validate(
                clientData,
                existingCnibs,
                existingUsernames,
                existingEmails
            );

            if (validationErrors.length > 0) {
                const errorMessage = validationErrors.join(', ');
                this.updateState({
                    error: errorMessage,
                    loading: false
                });
                throw new Error(errorMessage);
            }

            const url = `${this.endpoint}/${clientData.id}`;
            const apiResponse: ApiResponse<Client> = await this.httpService.put(url, clientData);

            let updatedClient: Client;

            if (apiResponse && apiResponse.data) {
                updatedClient = apiResponse.data;
            } else {
                console.warn('Réponse de mise à jour non standard, utilisation des données locales...');
                updatedClient = { ...clientData } as Client;
            }

            const updatedClients = this.state.clients.map(client =>
                client.id === clientData.id ? updatedClient : client
            );

            this.updateState({
                clients: updatedClients,
                loading: false,
                error: null
            });

            return updatedClient;
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
                clients: this.state.clients.filter(c => c.id !== id),
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

    selectClient(client: Client | null): void {
        this.updateState({ selectedClient: client });
    }

    getCurrentState(): ClientState {
        return { ...this.state };
    }

    clearError(): void {
        this.updateState({ error: null });
    }

    // Recherche de client par CNIB
    findByCnib(cnib: string): Client | undefined {
        return this.state.clients.find(c =>
            c.numeroCNIB.toLowerCase() === cnib.toLowerCase()
        );
    }

    // Recherche de client par username
    findByUsername(username: string): Client | undefined {
        return this.state.clients.find(c =>
            c.username.toLowerCase() === username.toLowerCase()
        );
    }

    // Filtrer par type de client
    getAbonnes(): Client[] {
        return this.state.clients.filter(c => c.abonne);
    }

    getClientsOrdinaires(): Client[] {
        return this.state.clients.filter(c => !c.abonne);
    }
}