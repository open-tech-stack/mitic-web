// services/storage/storage.service.ts
import { IStorageService, User } from "@/types/auth.types";
import { CookieService } from "./cookie.service";

/**
 * Service de stockage sécurisé utilisant les cookies - VERSION PRO CORRIGÉE
 */
export class SecureStorageService implements IStorageService {
  private static instance: SecureStorageService;
  private cookieService: CookieService;

  // Clés pour les cookies
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';

  private constructor() {
    this.cookieService = CookieService.getInstance();
  }

  public static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Sauvegarde le token JWT - VERSION ROBUSTE
   */
  public async saveToken(token: string): Promise<void> {
    console.log('💾 Sauvegarde du token:', token ? `${token.substring(0, 20)}...` : 'NULL');

    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.error('❌ Token invalide pour sauvegarde:', token);
      throw new Error('Token invalide');
    }

    try {
      // Vérifier la structure du token avant sauvegarde
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Structure de token invalide');
        throw new Error('Structure de token invalide');
      }

      // Stockage dans un cookie sécurisé
      this.cookieService.setCookie(this.TOKEN_KEY, token, {
        maxAge: 30 * 60, // 30 minutes
        sameSite: 'strict',
        httpOnly: false,
        path: '/'
      });

      // VÉRIFICATION AVEC TOLÉRANCE POUR LES TOKENS LONGS
      await this.verifyTokenSaveWithFallback(token);

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du token:', error);

      // Tentative de fallback pour les tokens longs
      await this.tryFallbackTokenSave(token);
    }
  }

  /**
     * Vérification avec tolérance pour les tokens longs
     */
  private async verifyTokenSaveWithFallback(originalToken: string): Promise<void> {
    // Attendre un peu pour que le cookie soit écrit
    await new Promise(resolve => setTimeout(resolve, 50));

    const savedToken = await this.getToken();

    if (!savedToken) {
      console.warn('⚠️ Token non récupéré immédiatement après sauvegarde, tentative de fallback');
      await this.tryFallbackTokenSave(originalToken);
      return;
    }

    if (savedToken !== originalToken) {
      console.warn('⚠️ Token corrompu lors de la sauvegarde, tentative de fallback');
      await this.tryFallbackTokenSave(originalToken);
      return;
    }

    console.log('✅ Token sauvegardé et vérifié avec succès');
  }

  /**
   * Fallback pour les tokens longs
   */
  private async tryFallbackTokenSave(token: string): Promise<void> {
    try {
      console.log('🔄 Tentative de sauvegarde de fallback pour token long...');

      // Utiliser une clé différente pour les tokens longs
      const longTokenKey = 'auth_token_long';
      this.cookieService.setCookie(longTokenKey, token, {
        maxAge: 30 * 60,
        sameSite: 'strict',
        httpOnly: false,
        path: '/'
      });

      // Vérifier la sauvegarde fallback
      await new Promise(resolve => setTimeout(resolve, 50));
      const fallbackToken = this.cookieService.getCookie(longTokenKey);

      if (fallbackToken === token) {
        console.log('✅ Token long sauvegardé avec succès (fallback)');
        return;
      }

      throw new Error('Échec de la sauvegarde même en fallback');

    } catch (fallbackError) {
      console.error('❌ Échec de la sauvegarde fallback:', fallbackError);
      throw new Error('Impossible de sauvegarder le token (trop long)');
    }
  }

  /**
   * Vérification robuste de la sauvegarde
   */
  private async verifyTokenSave(originalToken: string): Promise<void> {
    // Attendre un peu pour que le cookie soit écrit
    await new Promise(resolve => setTimeout(resolve, 10));

    const savedToken = await this.getToken();

    if (!savedToken) {
      console.error('🚨 CRITIQUE: Token non sauvegardé après écriture');
      throw new Error('Échec de la sauvegarde du token');
    }

    if (savedToken !== originalToken) {
      console.error('🚨 CRITIQUE: Token corrompu lors de la sauvegarde');
      throw new Error('Token corrompu lors de la sauvegarde');
    }

    console.log('✅ Token sauvegardé et vérifié avec succès');
  }

  /**
     * Récupère le token JWT avec fallback
     */
  public async getToken(): Promise<string | null> {
    try {
      // Essayer d'abord le token standard
      let token = this.cookieService.getCookie(this.TOKEN_KEY);

      // Si non trouvé, essayer le fallback pour tokens longs
      if (!token) {
        token = this.cookieService.getCookie('auth_token_long');
        if (token) {
          console.log('🔁 Token récupéré depuis le stockage fallback');
        }
      }

      if (token && this.isValidToken(token)) {
        return token;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Validation du token
   */
  private isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Vérifier que c'est du base64 valide
      atob(parts[1]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sauvegarde le refresh token
   */
  public async saveRefreshToken(refreshToken: string): Promise<void> {
    console.log('💾 Sauvegarde du refresh token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NULL');

    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
      console.error('❌ Refresh token invalide pour sauvegarde');
      throw new Error('Refresh token invalide');
    }

    try {
      this.cookieService.setCookie(this.REFRESH_TOKEN_KEY, refreshToken, {
        maxAge: 7 * 24 * 60 * 60, // 7 jours
        sameSite: 'strict',
        httpOnly: false,
        path: '/'
      });

      console.log('✅ Refresh token sauvegardé');

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du refresh token:', error);
      throw error;
    }
  }

  /**
   * Récupère le refresh token
   */
  public async getRefreshToken(): Promise<string | null> {
    return this.cookieService.getCookie(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Sauvegarde les informations utilisateur
   */
  public async saveUser(user: User): Promise<void> {
    console.log('💾 Sauvegarde de l\'utilisateur:', user);

    try {
      const userJson = JSON.stringify(user);
      this.cookieService.setCookie(this.USER_KEY, userJson, {
        maxAge: 30 * 60, // 30 minutes (même durée que le token)
        sameSite: 'strict',
        httpOnly: false,
        path: '/'
      });

      console.log('✅ Utilisateur sauvegardé');

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations utilisateur
   */
  public async getUser(): Promise<User | null> {
    try {
      const userData = this.cookieService.getCookie(this.USER_KEY);
      if (!userData) return null;

      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('❌ Erreur lors du parsing de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Supprime toutes les données d'authentification
   */
  public async clearAll(): Promise<void> {
    console.log('🗑️ Nettoyage de tous les cookies d\'auth');

    try {
      this.cookieService.deleteCookie(this.TOKEN_KEY, '/');
      this.cookieService.deleteCookie(this.REFRESH_TOKEN_KEY, '/');
      this.cookieService.deleteCookie(this.USER_KEY, '/');

      console.log('✅ Tous les cookies d\'auth supprimés');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des cookies:', error);
    }
  }

  /**
   * Vérifie si le stockage est disponible
   */
  public isStorageAvailable(): boolean {
    return this.cookieService.areCookiesEnabled();
  }
}