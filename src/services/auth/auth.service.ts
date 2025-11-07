// services/auth/auth.service.ts
import { IAuthService, AuthState, LoginCredentials, AuthError, ApiAuthResponse, User } from "@/types/auth.types";
import { TokenService } from "./token.service";
import { SecureStorageService } from "../storage/storage.service";
import { HttpService } from "../core/http.service";

/**
 * Service d'authentification refondu avec gestion sécurisée - VERSION COMPLÈTEMENT CORRIGÉE
 */
export class AuthService implements IAuthService {
  private static instance: AuthService;

  private state: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  private stateChangeCallbacks: ((state: AuthState) => void)[] = [];
  private logoutCallbacks: (() => void)[] = [];

  private httpService: HttpService;
  private storageService: SecureStorageService;
  private tokenService: TokenService;

  private refreshInProgress: boolean = false;

  private constructor(
    httpService: HttpService,
    storageService: SecureStorageService,
    tokenService: TokenService
  ) {
    this.httpService = httpService;
    this.storageService = storageService;
    this.tokenService = tokenService;
  }

  public static getInstance(
    httpService: HttpService,
    storageService: SecureStorageService,
    tokenService: TokenService
  ): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(httpService, storageService, tokenService);
    }
    return AuthService.instance;
  }

  /**
   * Met à jour l'état et notifie les observateurs
   */
  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyStateChange();
  }

  /**
   * Notifie les observateurs du changement d'état
   */
  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Erreur dans le callback de changement d\'état:', error);
      }
    });
  }

  /**
   * Nettoie complètement l'état d'authentification
   */
  private async clearAuthState(): Promise<void> {
    try {
      await this.storageService.clearAll();

      this.updateState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
        isLoading: false
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage de l\'état:', error);
    }
  }

  /**
   * Valide les données de connexion
   */
  private validateCredentials(credentials: LoginCredentials): AuthError | null {
    const username = credentials.username?.trim();
    const password = credentials.password;

    if (!username || username.length < 3) {
      return {
        message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        type: 'VALIDATION_ERROR'
      };
    }

    if (!password || password.length < 4) {
      return {
        message: "Le mot de passe doit contenir au moins 4 caractères",
        type: 'VALIDATION_ERROR'
      };
    }

    return null;
  }

  /**
   * Gère les erreurs d'authentification
   */
  private handleAuthError(error: any): AuthError {
    console.error('Erreur d\'authentification:', error);

    // Erreur structurée du HttpService
    if (error.isCustomError) {
      return {
        message: error.message,
        type: error.type || 'UNKNOWN_ERROR',
        status: error.status
      };
    }

    // Détection du type d'erreur
    if (error.message?.includes('connexion') || error.message?.includes('Failed to fetch')) {
      return {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
        type: 'NETWORK_ERROR'
      };
    }

    if (error.status === 401 || error.message?.toLowerCase().includes('incorrect')) {
      return {
        message: 'Nom d\'utilisateur ou mot de passe incorrect',
        type: 'INVALID_CREDENTIALS',
        status: 401
      };
    }

    if (error.status === 403) {
      return {
        message: 'Accès non autorisé',
        type: 'ACCESS_DENIED',
        status: 403
      };
    }

    if (error.status >= 500) {
      return {
        message: 'Erreur du serveur. Veuillez réessayer plus tard.',
        type: 'SERVER_ERROR',
        status: error.status
      };
    }

    return {
      message: error.message || 'Une erreur s\'est produite lors de la connexion',
      type: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Processus de connexion principal
   */
  public async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError }> {
    // Nettoyer l'état précédent
    await this.clearAuthState();

    // Validation des données
    const validationError = this.validateCredentials(credentials);
    if (validationError) {
      this.updateState({ error: validationError.message });
      return { success: false, error: validationError };
    }

    this.updateState({ isLoading: true, error: null });

    try {
      const response: ApiAuthResponse = await this.httpService.post('connexion', {
        username: credentials.username.trim(),
        password: credentials.password
      }, { skipAuth: true });

      console.log("🛰️ Réponse brute du backend:", response);

      if (response.success && response.data) {
        await this.handleSuccessfulLogin(response.data);
        return { success: true };
      } else {
        const error: AuthError = {
          message: response.message || "Nom d'utilisateur ou mot de passe incorrect",
          status: response.status,
          type: 'INVALID_CREDENTIALS'
        };
        this.updateState({ error: error.message, isLoading: false });
        return { success: false, error };
      }
    } catch (err: any) {
      const error = this.handleAuthError(err);
      this.updateState({ error: error.message, isLoading: false });
      return { success: false, error };
    }
  }

  /**
   * Gère une connexion réussie - VERSION COMPLÈTEMENT CORRIGÉE
   */
  private async handleSuccessfulLogin(tokens: { bearer: string; refresh: string }): Promise<void> {
    try {
      console.log("🔐 === DÉBUT TRAITEMENT CONNEXION ===");
      console.log("📦 Token bearer reçu:", tokens.bearer ? `${tokens.bearer.substring(0, 30)}...` : 'NULL');
      console.log("📦 Refresh token reçu:", tokens.refresh ? `${tokens.refresh.substring(0, 30)}...` : 'NULL');

      // VALIDATION STRICTE DES TOKENS
      if (!tokens.bearer || !tokens.refresh) {
        throw new Error('Tokens manquants dans la réponse du serveur');
      }

     

      // Extraire les informations utilisateur du token
      const user = this.tokenService.extractUserFromToken(tokens.bearer) || {
        username: 'unknown',
        role: 'unknown'
      };

      console.log("👤 Utilisateur extrait:", user);
      console.log("🧩 Rôle détecté:", user.role);

      // SAUVEGARDE SÉQUENTIELLE ET ROBUSTE
      console.log("💾 Début sauvegarde séquentielle des données...");

      // 1. Sauvegarder le token principal (CRITIQUE)
      await this.storageService.saveToken(tokens.bearer);
      console.log("✅ Token principal sauvegardé");

      // 2. Sauvegarder le refresh token
      await this.storageService.saveRefreshToken(tokens.refresh);
      console.log("✅ Refresh token sauvegardé");

      // 3. Sauvegarder l'utilisateur
      await this.storageService.saveUser(user);
      console.log("✅ Utilisateur sauvegardé");

      // VÉRIFICATION FINALE COMPLÈTE
      console.log("🔍 VÉRIFICATION FINALE DES DONNÉES SAUVEGARDÉES:");

      const [savedToken, savedRefresh, savedUser] = await Promise.all([
        this.storageService.getToken(),
        this.storageService.getRefreshToken(),
        this.storageService.getUser()
      ]);

      console.log("✅ Token sauvegardé:", !!savedToken);
      console.log("✅ Refresh token sauvegardé:", !!savedRefresh);
      console.log("✅ Utilisateur sauvegardé:", !!savedUser);

      // VALIDATION CRITIQUE
      if (!savedToken) {
        const errorMsg = '🚨 CRITIQUE: Token non sauvegardé après connexion';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (!savedRefresh) {
        console.warn('⚠️ Refresh token non sauvegardé');
      }

      // Mettre à jour l'état
      this.updateState({
        user,
        token: tokens.bearer,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      console.log('✅ Connexion réussie et session démarrée');

    } catch (error) {
      console.error('❌ Erreur critique lors du traitement de la connexion:', error);

      // Nettoyage en cas d'erreur
      await this.clearAuthState();

      throw error;
    }
  }

  /**
   * Sauvegarde d'urgence du token
   */
  private async emergencyTokenSave(token: string): Promise<void> {
    try {
      // Essayer localStorage en fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('emergency_auth_token', token);
        console.log('🆘 Token sauvegardé en emergency dans localStorage');
      }
    } catch (error) {
      console.error('❌ Emergency save failed:', error);
    }
  }

  /**
   * Récupération d'urgence du token
   */
  private async emergencyTokenGet(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('emergency_auth_token');
      }
    } catch (error) {
      console.error('❌ Emergency get failed:', error);
    }
    return null;
  }

  /**
   * Déconnexion
   */
  public async logout(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      // Nettoyage d'urgence aussi
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('emergency_auth_token');
        }
      } catch (error) {
        console.log('Nettoyage emergency ignoré:', error);
      }

      // Tentative de déconnexion côté serveur (non bloquante)
      try {
        const token = await this.storageService.getToken();
        if (token) {
          await this.httpService.post('deconnexion', {}, {
            skipAuth: false,
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (error) {
        console.log('Déconnexion serveur ignorée (peut être normale si token expiré):', error);
      }
    } finally {
      await this.clearAuthState();
      this.notifyLogout();
      console.log('🚪 Déconnexion réussie');
    }
  }

  /**
   * Refresh token avec protection contre les boucles
   */
  public async refreshToken(): Promise<boolean> {
    if (this.refreshInProgress) {
      console.log('🔄 Refresh déjà en cours, attente...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.refreshInProgress) {
            clearInterval(checkInterval);
            resolve(this.state.isAuthenticated);
          }
        }, 100);
      });
    }

    this.refreshInProgress = true;

    try {
      const refreshToken = await this.storageService.getRefreshToken();

      if (!refreshToken) {
        console.log('❌ Aucun refresh token disponible');
        await this.logout();
        return false;
      }

      console.log('🔄 Tentative de refresh token...');

      const response: ApiAuthResponse = await this.httpService.post('refresh',
        { refresh: refreshToken },
        { skipAuth: true }
      );

      if (response.success && response.data) {
        await Promise.all([
          this.storageService.saveToken(response.data.bearer),
          this.storageService.saveRefreshToken(response.data.refresh)
        ]);

        // Extraire le nouvel utilisateur du token
        const user = this.tokenService.extractUserFromToken(response.data.bearer) || this.state.user;

        this.updateState({
          user,
          token: response.data.bearer,
          refreshToken: response.data.refresh,
          isAuthenticated: true
        });

        console.log('✅ Refresh token réussi');
        return true;
      } else {
        console.log('❌ Refresh token échoué - réponse invalide');
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors du refresh token:', error);
      await this.logout();
      return false;
    } finally {
      this.refreshInProgress = false;
    }
  }

  /**
   * Restauration de session - VERSION AMÉLIORÉE
   */
  public async restoreSession(): Promise<boolean> {
    if (this.state.isLoading) {
      return false;
    }

    this.updateState({ isLoading: true });

    try {
      const [token, refreshToken, user] = await Promise.all([
        this.storageService.getToken(),
        this.storageService.getRefreshToken(),
        this.storageService.getUser()
      ]);

      console.log("🔄 === TENTATIVE DE RESTAURATION DE SESSION ===");
      console.log("📦 Token présent:", !!token);
      console.log("📦 Refresh token présent:", !!refreshToken);
      console.log("📦 User présent:", !!user);

      // Vérifier la présence des tokens - AVEC FALLBACK D'URGENCE
      let finalToken = token;
      if (!token && refreshToken) {
        console.log('🆘 Token manquant mais refresh token présent, tentative de récupération d\'urgence...');
        finalToken = await this.emergencyTokenGet();
        if (finalToken) {
          console.log('✅ Token récupéré depuis le stockage d\'urgence');
          await this.storageService.saveToken(finalToken);
        }
      }

      if (!finalToken || !refreshToken) {
        console.log('ℹ️ Aucune session à restaurer - tokens manquants');
        this.updateState({ isLoading: false });
        return false;
      }

      // Vérifier la structure du token
      if (!this.tokenService.isValidTokenStructure(finalToken)) {
        console.log('❌ Structure de token invalide');
        await this.clearAuthState();
        this.updateState({ isLoading: false });
        return false;
      }

      // Vérifier l'expiration
      if (this.tokenService.isTokenExpired(finalToken)) {
        console.log('🔄 Token expiré, tentative de refresh...');
        const refreshSuccess = await this.refreshToken();

        if (refreshSuccess) {
          return true;
        } else {
          this.updateState({ isLoading: false });
          return false;
        }
      }

      // Vérifier si le token va bientôt expirer
      if (this.tokenService.willTokenExpireSoon(finalToken, 300)) {
        console.log('🔄 Token va expirer bientôt, refresh anticipé...');
        const refreshSuccess = await this.refreshToken();

        if (refreshSuccess) {
          return true;
        }
        // Continuer avec l'ancien token si le refresh échoue
      }

      console.log("✅ Session restaurée avec succès");
      console.log("👤 Utilisateur restauré:", user);
      console.log("🧩 Rôle restauré:", user?.role);

      this.updateState({
        user,
        token: finalToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la restauration de session:', error);
      await this.clearAuthState();
      this.updateState({ isLoading: false });
      return false;
    }
  }

  /**
   * S'assure que le token est valide
   */
  public async ensureValidToken(): Promise<boolean> {
    const token = await this.storageService.getToken();

    if (!token) {
      return false;
    }

    if (this.tokenService.isTokenExpired(token)) {
      return await this.refreshToken();
    }

    if (this.tokenService.willTokenExpireSoon(token, 300)) {
      return await this.refreshToken();
    }

    return true;
  }

  // Méthodes d'interface
  public isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token;
  }

  public getCurrentUser(): User | null {
    return this.state.user;
  }

  public getCurrentToken(): string | null {
    return this.state.token;
  }

  public getCurrentState(): AuthState {
    return { ...this.state };
  }

  public subscribe(callback: (state: AuthState) => void): () => void {
    this.stateChangeCallbacks.push(callback);

    // Appel immédiat avec l'état actuel
    try {
      callback(this.state);
    } catch (error) {
      console.error('Erreur dans le callback de souscription:', error);
    }

    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  public onLogout(callback: () => void): () => void {
    this.logoutCallbacks.push(callback);
    return () => {
      const index = this.logoutCallbacks.indexOf(callback);
      if (index > -1) {
        this.logoutCallbacks.splice(index, 1);
      }
    };
  }

  private notifyLogout(): void {
    this.logoutCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erreur dans le callback de déconnexion:', error);
      }
    });
  }
}