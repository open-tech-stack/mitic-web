import { Role, Permission, RolePermissionAssociation, SecurityState, SecurityOperationResult } from "@/types/security.types";
import { IHttpService } from "@/types/auth.types";

export class SecurityService {
  private static instance: SecurityService;
  private httpService: IHttpService;

  private state: SecurityState = {
    roles: [],
    permissions: [],
    associations: [],
    isLoading: false,
    error: null
  };

  private stateChangeCallbacks: ((state: SecurityState) => void)[] = [];

  private constructor(httpService: IHttpService) {
    this.httpService = httpService;
  }

  public static getInstance(httpService?: IHttpService): SecurityService {
    if (!SecurityService.instance) {
      if (!httpService) {
        throw new Error('SecurityService doit être initialisé avec un HttpService');
      }
      SecurityService.instance = new SecurityService(httpService);
    }
    return SecurityService.instance;
  }

  private updateState(newState: Partial<SecurityState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Erreur dans le callback de changement d\'état:', error);
      }
    });
  }

  public subscribe(callback: (state: SecurityState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    callback(this.state);

    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  public getCurrentState(): SecurityState {
    return { ...this.state };
  }

  // Charger toutes les données
  public async loadAllData(): Promise<SecurityOperationResult<{
    roles: Role[];
    permissions: Permission[];
    associations: RolePermissionAssociation[];
  }>> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Charger les rôles
      const rolesResponse = await this.httpService.get<{ success: boolean; data?: Role | Role[] }>('roles');
      const roles = Array.isArray(rolesResponse.data) ? rolesResponse.data : (rolesResponse.data ? [rolesResponse.data] : []);

      // Charger les permissions
      const permissionsResponse = await this.httpService.get<{ success: boolean; data?: Permission | Permission[] }>('permissions');
      const permissions = Array.isArray(permissionsResponse.data) ? permissionsResponse.data : (permissionsResponse.data ? [permissionsResponse.data] : []);

      // Charger les associations
      const associationsResponse = await this.httpService.get<{ success: boolean; data?: RolePermissionAssociation | RolePermissionAssociation[] }>('associations');
      const associations = Array.isArray(associationsResponse.data) ? associationsResponse.data : (associationsResponse.data ? [associationsResponse.data] : []);

      this.updateState({
        roles,
        permissions,
        associations,
        isLoading: false,
        error: null
      });

      return {
        success: true,
        data: { roles, permissions, associations }
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du chargement des données';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Créer un rôle
  public async createRole(name: string): Promise<SecurityOperationResult<Role>> {
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.httpService.post<{ success: boolean; data?: Role }>('roles', { name });

      if (response.success && response.data) {
        const newRole = response.data;
        const updatedRoles = [...this.state.roles, newRole];
        this.updateState({ roles: updatedRoles, isLoading: false });
        return { success: true, data: newRole };
      } else {
        throw new Error('Erreur lors de la création du rôle');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la création du rôle';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Créer une permission
  public async createPermission(name: string): Promise<SecurityOperationResult<Permission>> {
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.httpService.post<{ success: boolean; data?: Permission }>('permissions', { name });

      if (response.success && response.data) {
        const newPermission = response.data;
        const updatedPermissions = [...this.state.permissions, newPermission];
        this.updateState({ permissions: updatedPermissions, isLoading: false });
        return { success: true, data: newPermission };
      } else {
        throw new Error('Erreur lors de la création de la permission');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la création de la permission';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Sauvegarder une association
  public async saveAssociation(roleId: number, permissionIds: number[]): Promise<SecurityOperationResult<RolePermissionAssociation>> {
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.httpService.post<{ success: boolean; data?: RolePermissionAssociation }>('associations', {
        role: roleId,
        permissions: permissionIds
      });

      if (response.success && response.data) {
        const newAssociation = response.data;

        // Mettre à jour les associations (remplacer les anciennes pour ce rôle)
        const updatedAssociations = this.state.associations
          .filter(assoc => assoc.role !== roleId)
          .concat(newAssociation);

        this.updateState({
          associations: updatedAssociations,
          isLoading: false
        });

        return { success: true, data: newAssociation };
      } else {
        throw new Error('Erreur lors de la sauvegarde de l\'association');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la sauvegarde de l\'association';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Supprimer une association
  public async deleteAssociation(roleId: number, permissionId: number): Promise<SecurityOperationResult<void>> {
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.httpService.delete<{ success: boolean }>(
        `associations/${roleId}/${permissionId}`
      );

      if (response.success) {
        const updatedAssociations = this.state.associations.map(assoc => {
          if (assoc.role === roleId) {
            return {
              ...assoc,
              permissions: assoc.permission.filter(id => id !== permissionId)
            };
          }
          return assoc;
        }).filter(assoc => assoc.permission.length > 0);


        this.updateState({
          associations: updatedAssociations,
          isLoading: false
        });

        return { success: true };
      } else {
        throw new Error('Erreur lors de la suppression de l\'association');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la suppression de l\'association';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Supprimer toutes les associations d'un rôle
  public async deleteAssociationsByRole(roleId: number): Promise<SecurityOperationResult<void>> {
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.httpService.delete<{ success: boolean }>(
        `associations/role/${roleId}`
      );

      if (response.success) {
        const updatedAssociations = this.state.associations.filter(assoc => assoc.role !== roleId);
        this.updateState({
          associations: updatedAssociations,
          isLoading: false
        });

        return { success: true };
      } else {
        throw new Error('Erreur lors de la suppression des associations');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la suppression des associations';
      this.updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Obtenir les associations d'un rôle
  public async getAssociationsByRole(roleId: number): Promise<SecurityOperationResult<RolePermissionAssociation>> {
    try {
      const response = await this.httpService.get<{ success: boolean; data?: RolePermissionAssociation }>(
        `associations/role/${roleId}`
      );

      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: 'Association non trouvée' };
      }
    } catch (error: any) {
      return { success: false, error: 'Erreur lors de la récupération des associations' };
    }
  }


  public clearError(): void {
    this.updateState({ error: null });
  }
}