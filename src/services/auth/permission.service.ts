// @/services/auth/permission.service.ts

import { PermissionConfig, PermissionCheck, User } from "@/types/auth.types";

/**
 * Service de gestion des permissions - Respecte le principe SRP
 */
export class PermissionService {
  private static instance: PermissionService;
  private permissionRegistry: Map<string, PermissionConfig> = new Map();

  private constructor() {
    this.initializeDefaultPermissions();
  }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Initialise les permissions par défaut de l'application
   */
  private initializeDefaultPermissions(): void {
    const defaultPermissions: PermissionConfig[] = [
      // Permissions pour les Unités Organisationnelles (ARBRE)
      { code: 'CRUD_ARBRE', description: 'Accès complet aux Unités Organisationnelles', category: 'ARBRE' },
      { code: 'CREATE_ARBRE', description: 'Créer une Unité Organisationnelle', category: 'ARBRE' },
      { code: 'READ_ARBRE', description: 'Lire les Unités Organisationnelles', category: 'ARBRE' },
      { code: 'UPDATE_ARBRE', description: 'Modifier une Unité Organisationnelle', category: 'ARBRE' },
      { code: 'DELETE_ARBRE', description: 'Supprimer une Unité Organisationnelle', category: 'ARBRE' },

      // Permissions pour les utilisateurs
      { code: 'CRUD_USER', description: 'Accès complet aux Utilisateurs', category: 'USER' },
      { code: 'CREATE_USER', description: 'Créer un Utilisateur', category: 'USER' },
      { code: 'READ_USER', description: 'Lire les Utilisateurs', category: 'USER' },
      { code: 'UPDATE_USER', description: 'Modifier un Utilisateur', category: 'USER' },
      { code: 'DELETE_USER', description: 'Supprimer un Utilisateur', category: 'USER' },

      // Permissions pour le Plan Comptable Général (PCG)
      { code: 'CRUD_PCG', description: 'Accès complet au Plan Comptable Général', category: 'PCG' },
      { code: 'CREATE_PCG', description: 'Créer un compte comptable', category: 'PCG' },
      { code: 'READ_PCG', description: 'Lire le Plan Comptable Général', category: 'PCG' },
      { code: 'UPDATE_PCG', description: 'Modifier un compte comptable', category: 'PCG' },
      { code: 'DELETE_PCG', description: 'Supprimer un compte comptable', category: 'PCG' },

      // Permissions pour les périodicités
      { code: 'CRUD_PERIODICITE', description: 'Accès complet aux périodicités', category: 'PERIODICITE' },
      { code: 'CREATE_PERIODICITE', description: 'Créer une périodicité', category: 'PERIODICITE' },
      { code: 'READ_PERIODICITE', description: 'Lire les périodicités', category: 'PERIODICITE' },
      { code: 'UPDATE_PERIODICITE', description: 'Modifier une périodicité', category: 'PERIODICITE' },
      { code: 'DELETE_PERIODICITE', description: 'Supprimer une périodicité', category: 'PERIODICITE' },

      // Permissions pour les associations rôles-permissions
      { code: 'CRUD_ASSOCIATION_ROLE_PERMISSION', description: 'Accès complet aux associations rôles-permissions', category: 'SECURITY' },
      { code: 'CREATE_ASSOCIATION_ROLE_PERMISSION', description: 'Créer une association rôle-permission', category: 'SECURITY' },
      { code: 'READ_ASSOCIATION_ROLE_PERMISSION', description: 'Lire les associations rôles-permissions', category: 'SECURITY' },
      { code: 'UPDATE_ASSOCIATION_ROLE_PERMISSION', description: 'Modifier une association rôle-permission', category: 'SECURITY' },
      { code: 'DELETE_ASSOCIATION_ROLE_PERMISSION', description: 'Supprimer une association rôle-permission', category: 'SECURITY' },

      // Permissions pour les tarifs par période
      { code: 'CRUD_PERIOD_TARIF', description: 'Accès complet aux tarifs par période', category: 'PERIOD_TARIF' },
      { code: 'CREATE_PERIOD_TARIF', description: 'Créer un tarif par période', category: 'PERIOD_TARIF' },
      { code: 'READ_PERIOD_TARIF', description: 'Lire les tarifs par période', category: 'PERIOD_TARIF' },
      { code: 'UPDATE_PERIOD_TARIF', description: 'Modifier un tarif par période', category: 'PERIOD_TARIF' },
      { code: 'DELETE_PERIOD_TARIF', description: 'Supprimer un tarif par période', category: 'PERIOD_TARIF' },

      // Permissions pour les localités
      { code: 'CRUD_LOCALITE', description: 'Accès complet aux localités', category: 'LOCALITE' },
      { code: 'CREATE_LOCALITE', description: 'Créer une localité', category: 'LOCALITE' },
      { code: 'READ_LOCALITE', description: 'Lire les localités', category: 'LOCALITE' },
      { code: 'UPDATE_LOCALITE', description: 'Modifier une localité', category: 'LOCALITE' },
      { code: 'DELETE_LOCALITE', description: 'Supprimer une localité', category: 'LOCALITE' },

      // Permissions pour les péages
      { code: 'CRUD_PEAGE', description: 'Accès complet aux péages', category: 'PEAGE' },
      { code: 'CREATE_PEAGE', description: 'Créer un péage', category: 'PEAGE' },
      { code: 'READ_PEAGE', description: 'Lire les péages', category: 'PEAGE' },
      { code: 'UPDATE_PEAGE', description: 'Modifier un péage', category: 'PEAGE' },
      { code: 'DELETE_PEAGE', description: 'Supprimer un péage', category: 'PEAGE' },

      // Permissions pour les abonnés
      { code: 'CRUD_ABONNE', description: 'Accès complet aux abonnés', category: 'ABONNE' },
      { code: 'CREATE_ABONNE', description: 'Créer un abonné', category: 'ABONNE' },
      { code: 'READ_ABONNE', description: 'Lire les abonnés', category: 'ABONNE' },
      { code: 'UPDATE_ABONNE', description: 'Modifier un abonné', category: 'ABONNE' },
      { code: 'DELETE_ABONNE', description: 'Supprimer un abonné', category: 'ABONNE' },

      // Permissions pour les abonnements
      { code: 'CRUD_ABONNEMENT', description: 'Accès complet aux abonnements', category: 'ABONNEMENT' },
      { code: 'CREATE_ABONNEMENT', description: 'Créer un abonnement', category: 'ABONNEMENT' },
      { code: 'READ_ABONNEMENT', description: 'Lire les abonnements', category: 'ABONNEMENT' },
      { code: 'UPDATE_ABONNEMENT', description: 'Modifier un abonnement', category: 'ABONNEMENT' },
      { code: 'DELETE_ABONNEMENT', description: 'Supprimer un abonnement', category: 'ABONNEMENT' },

      // Permissions pour les catégories
      { code: 'CRUD_CATEGORIE', description: 'Accès complet aux catégories', category: 'CATEGORIE' },
      { code: 'CREATE_CATEGORIE', description: 'Créer une catégorie', category: 'CATEGORIE' },
      { code: 'READ_CATEGORIE', description: 'Lire les catégories', category: 'CATEGORIE' },
      { code: 'UPDATE_CATEGORIE', description: 'Modifier une catégorie', category: 'CATEGORIE' },
      { code: 'DELETE_CATEGORIE', description: 'Supprimer une catégorie', category: 'CATEGORIE' },

      //permissions pour les types de categories
      { code: 'CRUD_TYPE_CATEGORIE', description: 'Acces complet aux types de categories', category: 'TYPE_CATEGORIE' },


      // Permissions pour les types de montant
      { code: 'CRUD_TYPE_MONTANT', description: 'Accès complet aux types de montant', category: 'TYPE_MONTANT' },
      { code: 'CREATE_TYPE_MONTANT', description: 'Créer un type de montant', category: 'TYPE_MONTANT' },
      { code: 'READ_TYPE_MONTANT', description: 'Lire les types de montant', category: 'TYPE_MONTANT' },
      { code: 'UPDATE_TYPE_MONTANT', description: 'Modifier un type de montant', category: 'TYPE_MONTANT' },
      { code: 'DELETE_TYPE_MONTANT', description: 'Supprimer un type de montant', category: 'TYPE_MONTANT' },


      // Permissions pour les types de compte
      { code: 'CRUD_COMPTE_TYPE', description: 'Accès complet aux types de compte', category: 'COMPTE_TYPE' },
      { code: 'CREATE_COMPTE_TYPE', description: 'Créer un type de compte', category: 'COMPTE_TYPE' },
      { code: 'READ_COMPTE_TYPE', description: 'Lire les types de compte', category: 'COMPTE_TYPE' },
      { code: 'UPDATE_COMPTE_TYPE', description: 'Modifier un type de compte', category: 'COMPTE_TYPE' },
      { code: 'DELETE_COMPTE_TYPE', description: 'Supprimer un type de compte', category: 'COMPTE_TYPE' },

      // Permissions pour les comptes
      { code: 'CRUD_COMPTE', description: 'Accès complet aux comptes', category: 'COMPTE' },
      { code: 'CREATE_COMPTE', description: 'Créer un compte', category: 'COMPTE' },
      { code: 'READ_COMPTE', description: 'Lire les comptes', category: 'COMPTE' },
      { code: 'UPDATE_COMPTE', description: 'Modifier un compte', category: 'COMPTE' },
      { code: 'DELETE_COMPTE', description: 'Supprimer un compte', category: 'COMPTE' },

      // Permissions pour les types d'opération
      { code: 'CRUD_TYPE_OPERATION', description: 'Accès complet aux types d\'opération', category: 'TYPE_OPERATION' },
      { code: 'CREATE_TYPE_OPERATION', description: 'Créer un type d\'opération', category: 'TYPE_OPERATION' },
      { code: 'READ_TYPE_OPERATION', description: 'Lire les types d\'opération', category: 'TYPE_OPERATION' },
      { code: 'UPDATE_TYPE_OPERATION', description: 'Modifier un type d\'opération', category: 'TYPE_OPERATION' },
      { code: 'DELETE_TYPE_OPERATION', description: 'Supprimer un type d\'opération', category: 'TYPE_OPERATION' },

      // Permissions pour les modes de règlement
      { code: 'CRUD_MODE_REGLEMENT', description: 'Accès complet aux modes de règlement', category: 'MODE_REGLEMENT' },
      { code: 'CREATE_MODE_REGLEMENT', description: 'Créer un mode de règlement', category: 'MODE_REGLEMENT' },
      { code: 'READ_MODE_REGLEMENT', description: 'Lire les modes de règlement', category: 'MODE_REGLEMENT' },
      { code: 'UPDATE_MODE_REGLEMENT', description: 'Modifier un mode de règlement', category: 'MODE_REGLEMENT' },
      { code: 'DELETE_MODE_REGLEMENT', description: 'Supprimer un mode de règlement', category: 'MODE_REGLEMENT' },

      // Permissions pour les associations type opération - type montant
      { code: 'CRUD_OPERATION_MONTANT_TYPE', description: 'Accès complet aux associations type opération-type montant', category: 'OPERATION_MONTANT_TYPE' },
      { code: 'CREATE_OPERATION_MONTANT_TYPE', description: 'Créer une association type opération-type montant', category: 'OPERATION_MONTANT_TYPE' },
      { code: 'READ_OPERATION_MONTANT_TYPE', description: 'Lire les associations type opération-type montant', category: 'OPERATION_MONTANT_TYPE' },
      { code: 'UPDATE_OPERATION_MONTANT_TYPE', description: 'Modifier une association type opération-type montant', category: 'OPERATION_MONTANT_TYPE' },
      { code: 'DELETE_OPERATION_MONTANT_TYPE', description: 'Supprimer une association type opération-type montant', category: 'OPERATION_MONTANT_TYPE' },



      // Permissions pour les schémas comptables
      { code: 'CRUD_SCHEMA_COMPTABLE', description: 'Accès complet aux schémas comptables', category: 'SCHEMA_COMPTABLE' },
      { code: 'CREATE_SCHEMA_COMPTABLE', description: 'Créer un schéma comptable', category: 'SCHEMA_COMPTABLE' },
      { code: 'READ_SCHEMA_COMPTABLE', description: 'Lire les schémas comptables', category: 'SCHEMA_COMPTABLE' },
      { code: 'UPDATE_SCHEMA_COMPTABLE', description: 'Modifier un schéma comptable', category: 'SCHEMA_COMPTABLE' },
      { code: 'DELETE_SCHEMA_COMPTABLE', description: 'Supprimer un schéma comptable', category: 'SCHEMA_COMPTABLE' },

      // Permissions pour l'historique
      { code: 'READ_HISTORIQUE', description: 'Lire l\'historique des comptes', category: 'HISTORIQUE' },
      { code: 'CREATE_HISTORIQUE', description: 'Créer une entrée dans l\'historique des comptes', category: 'HISTORIQUE' },
      { code: 'UPDATE_HISTORIQUE', description: 'Modifier une entrée dans l\'historique des comptes', category: 'HISTORIQUE' },
      { code: 'DELETE_HISTORIQUE', description: 'Supprimer des entrées de l\'historique des comptes', category: 'HISTORIQUE' },
      { code: 'CRUD_HISTORIQUE', description: 'Accès complet à l\'historique des comptes', category: 'HISTORIQUE' },

      // Permissions pour la gestion des caisses caissier principale
      { code: 'CRUD_CAISSE', description: 'Accès complet à la gestion des caisses', category: 'CAISSE' },
      { code: 'READ_CAISSE', description: 'Lire les informations des caisses', category: 'CAISSE' },
      { code: 'UPDATE_CAISSE', description: 'Modifier l\'état des caisses', category: 'CAISSE' },
      { code: 'CLOSE_CAISSE', description: 'Fermer les caisses', category: 'CAISSE' },

      // Permissions pour les agents caissiers
      { code: 'CRUD_AGENT_CAISSE', description: 'Accès complet aux agents caissiers', category: 'AGENT_CAISSE' },
      { code: 'CREATE_AGENT_CAISSE', description: 'Créer un agent caissier', category: 'AGENT_CAISSE' },
      { code: 'READ_AGENT_CAISSE', description: 'Lire les agents caissiers', category: 'AGENT_CAISSE' },
      { code: 'UPDATE_AGENT_CAISSE', description: 'Modifier un agent caissier', category: 'AGENT_CAISSE' },
      { code: 'DELETE_AGENT_CAISSE', description: 'Supprimer un agent caissier', category: 'AGENT_CAISSE' },
      { code: 'RESET_PASSWORD_AGENT_CAISSE', description: 'Réinitialiser le mot de passe d\'un agent caissier', category: 'AGENT_CAISSE' },

      //permissions pour les stats
      { code: 'READ_DASHBOARD', description: 'Acces au etat du compte', category: 'AGENT_CAISSE' }


    ];

    defaultPermissions.forEach(permission => {
      this.registerPermission(permission);
    });
  }

  /**
   * Enregistre une nouvelle permission dans le registre
   */
  public registerPermission(permission: PermissionConfig): void {
    this.permissionRegistry.set(permission.code, permission);
  }

  /**
   * Récupère la configuration d'une permission
   */
  public getPermissionConfig(permissionCode: string): PermissionConfig | undefined {
    return this.permissionRegistry.get(permissionCode);
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  public hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;

    // Si l'utilisateur a toutes les permissions (super admin)
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Vérification des permissions spécifiques
    return user.permissions?.includes(permission) || false;
  }

  /**
   * Vérifie si un utilisateur a toutes les permissions demandées
   */
  public hasAllPermissions(user: User | null, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Vérifie si un utilisateur a au moins une des permissions demandées
   */
  public hasAnyPermission(user: User | null, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique
   */
  public hasRole(user: User | null, role: string): boolean {
    return user?.role === role;
  }

  /**
   * Crée un objet de vérification des permissions pour un utilisateur
   */
  public createPermissionCheck(user: User | null): PermissionCheck {
    return {
      hasPermission: (permission: string) => this.hasPermission(user, permission),
      hasAllPermissions: (permissions: string[]) => this.hasAllPermissions(user, permissions),
      hasAnyPermission: (permissions: string[]) => this.hasAnyPermission(user, permissions),
      hasRole: (role: string) => this.hasRole(user, role),
    };
  }

  /**
   * Filtre les éléments basés sur les permissions
   */
  public filterByPermission<T>(
    items: T[],
    user: User | null,
    permissionField: keyof T,
    requiredPermission: string
  ): T[] {
    if (!user) return [];

    if (this.hasPermission(user, requiredPermission)) {
      return items;
    }

    return items.filter(item => {
      const itemPermission = item[permissionField];
      return typeof itemPermission === 'string' &&
        this.hasPermission(user, itemPermission as string);
    });
  }

  /**
   * Récupère toutes les permissions enregistrées
   */
  public getAllPermissions(): PermissionConfig[] {
    return Array.from(this.permissionRegistry.values());
  }

  /**
   * Récupère les permissions par catégorie
   */
  public getPermissionsByCategory(category: string): PermissionConfig[] {
    return this.getAllPermissions().filter(permission =>
      permission.category === category
    );
  }
}