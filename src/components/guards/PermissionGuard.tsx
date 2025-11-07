// @/components/ui/PermissionGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  anyPermission?: string[];
  role?: string;
  fallback?: ReactNode;
  mode?: 'all' | 'any';
}

/**
 * Composant guard pour l'affichage conditionnel basé sur les permissions
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  anyPermission,
  role,
  fallback = null,
  mode = 'all'
}: PermissionGuardProps) {
  const { hasPermission, hasRole, hasAllPermissions, hasAnyPermission } = useAuth();

  let isAuthorized = true;

  // Vérification du rôle
  if (role && !hasRole(role)) {
    isAuthorized = false;
  }

  // Vérification d'une permission unique
  if (permission && !hasPermission(permission)) {
    isAuthorized = false;
  }

  // Vérification de plusieurs permissions (toutes requises)
  if (permissions && permissions.length > 0 && mode === 'all' && !hasAllPermissions(permissions)) {
    isAuthorized = false;
  }

  // Vérification de plusieurs permissions (au moins une requise)
  if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(anyPermission)) {
    isAuthorized = false;
  }

  return <>{isAuthorized ? children : fallback}</>;
}