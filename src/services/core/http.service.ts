import { IHttpService, IStorageService, ApiAuthResponse, HttpOptions } from "@/types/auth.types";
import { TokenService } from "../auth/token.service";

/**
 * Service HTTP avec gestion automatique de l'authentification - Version corrigée
 */
export class HttpService implements IHttpService {
  private static instance: HttpService;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private tokenService: TokenService;
  private storageService: IStorageService;

  private refreshRetryCount = 0;
  private readonly MAX_REFRESH_RETRIES = 2;

  // Gestion de la file d'attente pour les requêtes pendant le refresh
  private refreshPromise: Promise<boolean> | null = null;
  private requestQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    request: () => Promise<any>;
  }> = [];

  private constructor(
    baseUrl: string,
    timeout: number = 10000,
    tokenService: TokenService,
    storageService: IStorageService
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeout = timeout;
    this.tokenService = tokenService;
    this.storageService = storageService;
  }

  public static getInstance(
    baseUrl?: string,
    timeout?: number,
    tokenService?: TokenService,
    storageService?: IStorageService
  ): HttpService {
    if (!HttpService.instance) {
      if (!baseUrl || !tokenService || !storageService) {
        throw new Error('HttpService doit être initialisé avec tous les paramètres requis');
      }
      HttpService.instance = new HttpService(baseUrl, timeout, tokenService, storageService);
    }
    return HttpService.instance;
  }

  /**
   * Construit l'URL complète pour un endpoint
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return `${this.baseUrl}/api/${cleanEndpoint}`;
  }

  /**
   * Exécute une requête fetch avec timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          isCustomError: true,
          message: 'Délai d\'attente dépassé. Vérifiez votre connexion.',
          type: 'TIMEOUT_ERROR'
        };
      }

      throw {
        isCustomError: true,
        message: 'Erreur de connexion. Vérifiez que le serveur est accessible.',
        type: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Traite la réponse HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}`;
      let errorType = 'UNKNOWN_ERROR';

      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorType = errorData.type || errorType;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch {
        // Messages d'erreur par défaut selon le code HTTP
        switch (response.status) {
          case 401:
            errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
            errorType = 'INVALID_CREDENTIALS';
            break;
          case 400:
            errorMessage = "Données de connexion invalides";
            errorType = 'VALIDATION_ERROR';
            break;
          case 403:
            errorMessage = "Accès refusé";
            errorType = 'ACCESS_DENIED';
            break;
          case 500:
            errorMessage = "Erreur interne du serveur";
            errorType = 'SERVER_ERROR';
            break;
          case 502:
          case 503:
            errorMessage = "Service temporairement indisponible";
            errorType = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = "Une erreur s'est produite lors de la connexion";
            break;
        }
      }

      throw {
        isCustomError: true,
        message: errorMessage,
        status: response.status,
        type: errorType
      };
    }

    try {
      if (contentType?.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {} as T;
      }
      return {} as T;
    } catch (error) {
      throw {
        isCustomError: true,
        message: 'Réponse du serveur invalide',
        status: 500,
        type: 'PARSING_ERROR'
      };
    }
  }

  /**
   * Ajoute les headers d'authentification si nécessaire
   */
  private async addAuthHeaders(headers: Record<string, string>, skipAuth: boolean): Promise<Record<string, string>> {
    if (skipAuth) {
      return headers;
    }

    const token = await this.storageService.getToken();

    if (token && this.tokenService.isValidTokenStructure(token)) {
      return {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }

    return headers;
  }

  /**
   * Gère les erreurs 401 avec file d'attente améliorée
   */
  private async handleUnauthorizedError<T>(
    request: () => Promise<T>,
    skipAuth: boolean
  ): Promise<T> {
    if (skipAuth) {
      throw new Error('Authentification requise');
    }

    // Si un refresh est déjà en cours, ajouter à la file d'attente
    if (this.refreshPromise) {
      console.log('⏳ Requête mise en file d\'attente pendant le refresh');
      return new Promise((resolve, reject) => {
        this.requestQueue.push({
          resolve,
          reject,
          request: request as () => Promise<any>
        });
      });
    }

    // Démarrer le processus de refresh
    const refreshSuccess = await this.performTokenRefresh();

    if (refreshSuccess) {
      // Traiter la file d'attente
      await this.processRequestQueue();

      // Réessayer la requête originale
      console.log('🔄 Réessai de la requête originale après refresh réussi');
      return await request();
    } else {
      // Échec du refresh, rejeter toutes les requêtes en attente
      const error = {
        isCustomError: true,
        message: 'Session expirée. Veuillez vous reconnecter.',
        type: 'TOKEN_EXPIRED'
      };
      this.rejectQueuedRequests(error);
      throw error;
    }
  }

  /**
   * Effectue le refresh du token avec gestion des retries
   */
  private async performTokenRefresh(): Promise<boolean> {
    // Éviter les refresh concurrents
    if (this.refreshPromise) {
      console.log('⏳ Refresh déjà en cours, attente...');
      return await this.refreshPromise;
    }

    // Vérifier le nombre de tentatives
    if (this.refreshRetryCount >= this.MAX_REFRESH_RETRIES) {
      console.error('🚨 Nombre maximum de tentatives de refresh atteint');
      this.refreshRetryCount = 0;
      return false;
    }

    this.refreshRetryCount++;
    console.log(`🔄 Tentative de refresh token (${this.refreshRetryCount}/${this.MAX_REFRESH_RETRIES})`);

    this.refreshPromise = this.doTokenRefresh();

    try {
      const result = await this.refreshPromise;
      this.refreshRetryCount = 0; // Réinitialiser en cas de succès
      return result;
    } catch (error) {
      this.refreshRetryCount++;
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Implémentation réelle du refresh token
   */
  private async doTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = await this.storageService.getRefreshToken();

      if (!refreshToken) {
        console.warn('⚠️ Aucun refresh token disponible');
        return false;
      }

      console.log('🔄 Envoi requête refresh token...');
      const response = await this.post<ApiAuthResponse>('refresh',
        { refresh: refreshToken },
        { skipAuth: true }
      );

      if (response.success && response.data) {
        await Promise.all([
          this.storageService.saveToken(response.data.bearer),
          this.storageService.saveRefreshToken(response.data.refresh)
        ]);

        console.log('✅ Refresh token réussi');
        return true;
      } else {
        console.warn('❌ Refresh token échoué - réponse non valide:', response.message);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du refresh token:', {
        message: error.message,
        status: error.status,
        type: error.type
      });

      // Si c'est une erreur 401 sur le refresh, déconnecter l'utilisateur
      if (error.status === 401) {
        console.log('🔒 Refresh token invalide, déconnexion nécessaire');
        await this.forceLogout();
      }

      return false;
    }
  }

  /**
   * Force la déconnexion en cas de refresh impossible
   */
  private async forceLogout(): Promise<void> {
    try {
      await this.storageService.clearAll();
      console.log('🚪 Déconnexion forcée suite à l\'échec du refresh');

      // Émettre un événement global pour notifier la déconnexion
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:forceLogout'));
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion forcée:', error);
    }
  }

  /**
   * Traite toutes les requêtes en file d'attente
   */
  private async processRequestQueue(): Promise<void> {
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    for (const { resolve, reject, request } of queue) {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }

  /**
   * Rejette toutes les requêtes en file d'attente
   */
  private rejectQueuedRequests(error: any): void {
    const queue = [...this.requestQueue];
    this.requestQueue = [];

    queue.forEach(({ reject }) => reject(error));
  }

  /**
   * S'assure que le token est valide avant une requête
   */
  private async ensureValidToken(): Promise<boolean> {
    try {
      const token = await this.storageService.getToken();

      if (!token) {
        console.warn('⚠️ Aucun token disponible');
        return false;
      }

      // Vérifier si le token est expiré ou va bientôt expirer
      if (this.tokenService.isTokenExpired(token)) {
        console.log('🔁 Token expiré, refresh nécessaire');
        return await this.performTokenRefresh();
      }

      if (this.tokenService.willTokenExpireSoon(token, 300)) { // 5 minutes
        console.log('🔄 Token va expirer bientôt, refresh anticipé');
        return await this.performTokenRefresh();
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la validation du token:', error);
      return false;
    }
  }

  /**
   * Exécute une requête HTTP générique
   */
  private async executeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: HttpOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const headers = await this.addAuthHeaders(defaultHeaders, options.skipAuth || false);

    const fetchOptions: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    const executeRequest = async (): Promise<T> => {
      console.log(`🌐 Envoi requête ${method} vers ${endpoint}`);

      // Vérifier et rafraîchir le token si nécessaire avant la requête
      if (!options.skipAuth) {
        await this.ensureValidToken();
      }

      const response = await this.fetchWithTimeout(url, fetchOptions);
      return this.handleResponse<T>(response);
    };

    try {
      return await executeRequest();
    } catch (error: any) {
      console.error(`❌ Erreur requête ${method} ${endpoint}:`, error);

      // Gestion des erreurs 401 avec refresh automatique
      if (error.status === 401 && !options.skipAuth) {
        console.log('🔄 Tentative de refresh token suite à 401');
        return this.handleUnauthorizedError(executeRequest, options.skipAuth || false);
      }

      throw error;
    }
  }

  public async get<T>(endpoint: string, options?: HttpOptions): Promise<T> {
    return this.executeRequest<T>('GET', endpoint, undefined, options);
  }

  public async post<T>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    return this.executeRequest<T>('POST', endpoint, data, options);
  }

  public async put<T>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    return this.executeRequest<T>('PUT', endpoint, data, options);
  }

  public async patch<T>(endpoint: string, data?: any, options?: HttpOptions): Promise<T> {
    return this.executeRequest<T>('PATCH', endpoint, data, options);
  }

  public async delete<T>(endpoint: string, options?: HttpOptions): Promise<T> {
    return this.executeRequest<T>('DELETE', endpoint, undefined, options);
  }
}