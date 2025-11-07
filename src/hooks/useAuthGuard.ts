// hooks/useAuthGuard.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
  redirectTo?: string;
}

export function useAuthGuard({
  requireAuth = true,
  requiredPermissions = [],
  requiredRole,
  redirectTo = '/login'
}: UseAuthGuardOptions = {}) {
  const {
    isAuthenticated,
    isLoading,
    user,
    hasPermission,
    hasRole,
    hasAllPermissions
  } = useAuth();

  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Vérifier l'authentification
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Redirection - Utilisateur non authentifié');
      router.push(redirectTo);
      return;
    }

    // Vérifier les permissions si nécessaire
    let authorized = true;

    if (requireAuth && isAuthenticated) {
      // Vérifier le rôle
      if (requiredRole && !hasRole(requiredRole)) {
        authorized = false;
      }

      // Vérifier les permissions
      if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        authorized = false;
      }
    }

    // Si déjà connecté et essaye d'accéder à une page publique
    if (!requireAuth && isAuthenticated) {
      console.log('🔒 Redirection - Utilisateur déjà authentifié');
      router.push('/dashboard/home');
      return;
    }

    setIsAuthorized(authorized);

    if (!authorized) {
      console.log('🔒 Accès refusé - Permissions insuffisantes');
      router.push('/unauthorized');
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    requiredPermissions,
    requiredRole,
    redirectTo,
    router,
    hasPermission,
    hasRole,
    hasAllPermissions
  ]);

  return {
    isLoading,
    isAuthenticated,
    isAuthorized,
    user
  };
}