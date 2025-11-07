// @/services/auth/token.service.ts

import { TokenPayload, User } from "@/types/auth.types";

/**
 * Service de gestion des tokens JWT
 * Respecte le principe de responsabilité unique (SRP)
 */
export class TokenService {
  private static instance: TokenService;

  private constructor() { }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Décode un token JWT sans vérification de signature
   */
  public decodeToken(token: string): TokenPayload | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));

      // Validation des champs obligatoires
      if (!decoded.sub || typeof decoded.exp !== 'number') {
        return null;
      }

      return decoded as TokenPayload;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Vérifie si un token est expiré
   */
  public isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp <= currentTime;
  }

  /**
   * Vérifie si un token va expirer bientôt
   */
  public willTokenExpireSoon(token: string, thresholdSeconds: number = 300): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return (payload.exp - currentTime) <= thresholdSeconds;
  }

  /**
   * Extrait les informations utilisateur du token
   */
  public extractUserFromToken(token: string): User | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      username: payload.sub,
      prenom: payload.prenom,
      nom: payload.nom,
      role: payload.role || '',
      permissions: payload.permissions || []
    };
  }

  /**
   * Calcule le temps restant avant expiration (en secondes)
   */
  public getTimeUntilExpiration(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = payload.exp - currentTime;

    return Math.max(0, timeRemaining);
  }

  /**
   * Valide la structure d'un token
   */
  public isValidTokenStructure(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    try {
      // Vérification que chaque partie est bien encodée en base64
      atob(parts[0]); // header
      atob(parts[1]); // payload
      // On ne vérifie pas la signature car on n'a pas la clé

      return true;
    } catch {
      return false;
    }
  }
}
