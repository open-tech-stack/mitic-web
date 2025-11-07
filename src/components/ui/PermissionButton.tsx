// @/components/ui/PermissionButton.tsx
'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  anyPermission?: string[];
  role?: string;
  mode?: 'all' | 'any';
  hideIfUnauthorized?: boolean;
}

/**
 * Bouton avec contrôle de permission
 */
export function PermissionButton({
  children,
  permission,
  permissions,
  anyPermission,
  role,
  mode = 'all',
  hideIfUnauthorized = true,
  ...buttonProps
}: PermissionButtonProps) {
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

  // Si on doit cacher le bouton et que non autorisé
  if (!isAuthorized && hideIfUnauthorized) {
    return null;
  }

  return (
    <button
      {...buttonProps}
      disabled={!isAuthorized || buttonProps.disabled}
      style={{
        ...buttonProps.style,
        opacity: !isAuthorized ? 0.5 : 1,
        cursor: !isAuthorized ? 'not-allowed' : buttonProps.style?.cursor
      }}
    >
      {children}
    </button>
  );
}