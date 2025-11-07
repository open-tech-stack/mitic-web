'use client';

import { ReactNode } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback = <Loader />,
  requireAuth = true,
  requiredPermissions = [],
  requiredRole,
  redirectTo = '/login'
}: AuthGuardProps) {
  const {
    isLoading,
    isAuthorized,
    isAuthenticated,
    user
  } = useAuthGuard({
    requireAuth,
    requiredPermissions,
    requiredRole,
    redirectTo
  });

  const { logout } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  // Si non autorisé après chargement, afficher le fallback
  if (requireAuth && (!isAuthenticated || !isAuthorized)) {
    return <>{fallback}</>;
  }

  // Si déjà connecté et essaye d'accéder à une page publique
  if (!requireAuth && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}