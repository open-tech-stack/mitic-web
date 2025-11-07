// hooks/useAuth.ts - Version avec permissions
import { useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { LoginCredentials } from '@/types/auth.types';
import { PermissionService } from '@/services/auth/permission.service';

/**
 * Hook personnalisé pour l'authentification avec gestion des permissions
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    authService,
    initialize,
    login,
    logout,
    restoreSession,
    refreshTokenAction,
    clearError
  } = useAuthStore();

  const permissionService = PermissionService.getInstance();

  // Référence pour éviter les effets en boucle
  const initializedRef = useRef(false);
  const sessionRestoredRef = useRef(false);

  // Initialisation au montage
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initialize();
    }
  }, [initialize]);

  // Restauration de session
  useEffect(() => {
    if (!sessionRestoredRef.current && 
        authService && 
        initializedRef.current) {
      
      sessionRestoredRef.current = true;
      
      const timer = setTimeout(() => {
        console.log('🔄 useAuth: Tentative de restauration de session...');
        restoreSession();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [authService, restoreSession]);

  // Wrapper pour la connexion avec gestion d'erreur
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    clearError();
    return await login(credentials);
  }, [login, clearError]);

  // Wrapper pour la déconnexion avec gestion d'erreur
  const handleLogout = useCallback(async () => {
    try {
      clearError();
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }, [logout, clearError]);

  // Vérification des permissions
  const hasPermission = useCallback((permission: string): boolean => {
    return permissionService.hasPermission(user, permission);
  }, [user, permissionService]);

  // Vérification des rôles
  const hasRole = useCallback((role: string): boolean => {
    return permissionService.hasRole(user, role);
  }, [user, permissionService]);

  // Vérification de plusieurs permissions
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissionService.hasAllPermissions(user, permissions);
  }, [user, permissionService]);

  // Vérification d'au moins une permission
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissionService.hasAnyPermission(user, permissions);
  }, [user, permissionService]);

  // Objet de vérification des permissions
  const permissionCheck = useCallback(() => {
    return permissionService.createPermissionCheck(user);
  }, [user, permissionService]);

  return {
    // État
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    refreshToken: refreshTokenAction, 
    clearError,
    
    // Vérifications d'accès
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    permissionCheck,
    
    // Service
    authService,
    permissionService
  };
}