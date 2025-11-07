// @/types/auth.types.ts - Version COMPLÈTEMENT corrigée
/**
 * Types et interfaces pour le système d'authentification
 */

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthTokens {
    bearer: string;
    refresh: string;
}

export interface ApiAuthResponse {
    data: AuthTokens;
    success: boolean;
    message: string;
    status: number;
}

export interface PermissionConfig {
  code: string;
  description: string;
  category: string;
}

export interface PermissionCheck {
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

export interface User {
    id?: string;
    username: string;
    role?: string;
    permissions?: string[];
    prenom?: string;
    nom?: string;
}


export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthActions {
    // Actions
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>;
    logout: () => Promise<void>;
    restoreSession: () => Promise<boolean>;
    refreshTokenAction: () => Promise<boolean>; // CHANGÉ : refreshToken → refreshTokenAction
    clearError: () => void;
    
    // Service
    authService: IAuthService | null;
    initialize: () => void;
}

// Interface combinée pour le store - CORRIGÉE
export interface AuthStore extends AuthState, Omit<AuthActions, 'refreshToken'> {
    refreshToken: string | null; // État
    refreshTokenAction: () => Promise<boolean>; // Action
}

export interface AuthError {
    message: string;
    status?: number;
    type: 'NETWORK_ERROR' | 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'SERVER_ERROR' | 'UNKNOWN_ERROR' | 'TIMEOUT_ERROR' | 'VALIDATION_ERROR' | 'ACCESS_DENIED';
}

export interface TokenPayload {
    sub: string;
    prenom?: string;
    nom?: string;
    role?: string;
    permissions?: string[];
    exp: number;
    iat?: number;
}

/**
 * Interface pour le service de stockage sécurisé
 */
export interface IStorageService {
    saveToken(token: string): Promise<void>;
    getToken(): Promise<string | null>;
    saveRefreshToken(refreshToken: string): Promise<void>;
    getRefreshToken(): Promise<string | null>;
    saveUser(user: User): Promise<void>;
    getUser(): Promise<User | null>;
    clearAll(): Promise<void>;
}

/**
 * Interface pour le service HTTP
 */
export interface HttpOptions {
    headers?: Record<string, string>;
    timeout?: number;
    skipAuth?: boolean;
}

export interface IHttpService {
    get<T>(endpoint: string, options?: HttpOptions): Promise<T>;
    post<T>(endpoint: string, data?: any, options?: HttpOptions): Promise<T>;
    put<T>(endpoint: string, data?: any, options?: HttpOptions): Promise<T>;
    delete<T>(endpoint: string, options?: HttpOptions): Promise<T>;
}

/**
 * Interface pour le service d'authentification
 */
export interface IAuthService {
    login(credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError }>;
    logout(): Promise<void>;
    refreshToken(): Promise<boolean>;
    restoreSession(): Promise<boolean>;
    ensureValidToken(): Promise<boolean>;
    isAuthenticated(): boolean;
    getCurrentUser(): User | null;
    getCurrentToken(): string | null;
    subscribe(callback: (state: AuthState) => void): () => void;
    onLogout(callback: () => void): () => void;
    getCurrentState(): AuthState;
}