// @/services/user/user.service.ts

import { ErrorHandlerService } from "@/services/core/error-handler.service";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserApiResponse,
  UserState,
  UserStats
} from "@/types/user.types";
import { LocaliteService } from "../localite/localite.service";
import { PeageService } from "../peage/peage.service";
import { SecurityService } from "../security/security.service";
import { UoService } from "../uo/uo.service";
import { Role, SecurityState } from "@/types/security.types";
import { ServiceFactory } from "../factory/factory.service";

export class UserService {
  private static instance: UserService;
  private readonly endpoint = 'users';
  private httpService: any;
  private errorHandler: ErrorHandlerService;
  private localiteService: LocaliteService;
  private peageService: PeageService;
  private securityService: SecurityService;
  private uoService: UoService;

  // État du service
  private state: UserState = {
    users: [],
    loading: false,
    selectedUser: null,
    error: null
  };

  // État de sécurité pour suivre les rôles
  private securityState: SecurityState | null = null;

  // Callbacks pour les mises à jour d'état
  private stateUpdateCallbacks: ((state: UserState) => void)[] = [];

  private constructor() {
    // Récupérer l'URL de base depuis les variables d'environnement
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

    // Initialiser les services via la factory
    this.httpService = ServiceFactory.createHttpService({ baseUrl });
    this.errorHandler = ErrorHandlerService.getInstance();
    this.localiteService = ServiceFactory.createLocaliteService();
    this.peageService = ServiceFactory.createPeageService();
    this.securityService = ServiceFactory.createSecurityService();
    this.uoService = ServiceFactory.createUoService();

    // S'abonner aux changements du SecurityService
    this.initializeSecuritySubscription();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Initialise la subscription au SecurityService pour suivre les rôles
   */
  private initializeSecuritySubscription(): void {
    this.securityService.subscribe((securityState: SecurityState) => {
      this.securityState = securityState;
    });
  }

  /**
   * Charge les données de sécurité si nécessaire
   */
  private async ensureSecurityDataLoaded(): Promise<void> {
    if (!this.securityState || this.securityState.roles.length === 0) {
      await this.securityService.loadAllData();
    }
  }

  /**
   * Récupère un rôle par son ID
   */
  public getRoleById(roleId: number): Role | undefined {
    if (!this.securityState) return undefined;
    return this.securityState.roles.find(role => role.id === roleId);
  }

  /**
   * Récupère le nom d'un rôle par son ID
   */
  public getRoleName(roleId: number): string {
    const role = this.getRoleById(roleId);
    return role ? role.name : `Rôle #${roleId}`;
  }

  /**
   * Récupère tous les rôles disponibles
   */
  public async getAvailableRoles(): Promise<Role[]> {
    await this.ensureSecurityDataLoaded();
    return this.securityState?.roles || [];
  }

  /**
   * Vérifie si un rôle a des permissions spécifiques
   */
  public async roleHasPermission(roleId: number, permissionName: string): Promise<boolean> {
    await this.ensureSecurityDataLoaded();

    const association = this.securityState?.associations.find(assoc => assoc.role === roleId);
    if (!association) return false;

    const permission = this.securityState?.permissions.find(perm =>
      perm.name === permissionName
    );

    if (!permission) return false;

    return association.permission.includes(permission.id);
  }

  /**
   * Vérifie si le rôle est "agent" basé sur les permissions ou le nom
   */
  public async isAgentRole(roleId: number): Promise<boolean> {
    const role = this.getRoleById(roleId);
    if (!role) return false;

    // Vérification par nom de rôle
    const roleName = role.name.toLowerCase();
    if (roleName.includes('agent')) {
      return true;
    }

    // Vérification par permissions spécifiques
    const hasAgentPermission = await this.roleHasPermission(roleId, 'AGENT_ACCESS');
    const hasCaissePermission = await this.roleHasPermission(roleId, 'CAISSE_ACCESS');

    return hasAgentPermission && !hasCaissePermission;
  }

  /**
   * Vérifie si le rôle est "caisse" basé sur les permissions ou le nom
   */
  public async isCaisseRole(roleId: number): Promise<boolean> {
    const role = this.getRoleById(roleId);
    if (!role) return false;

    // Vérification par nom de rôle
    const roleName = role.name.toLowerCase();
    if (roleName.includes('caisse')) {
      return true;
    }

    // Vérification par permissions spécifiques
    const hasCaissePermission = await this.roleHasPermission(roleId, 'CAISSE_ACCESS');
    const hasAgentPermission = await this.roleHasPermission(roleId, 'AGENT_ACCESS');

    return hasCaissePermission && !hasAgentPermission;
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique
   */
  public async userHasRole(user: User, roleName: string): Promise<boolean> {
    const role = this.getRoleById(user.roleId);
    return role ? role.name.toLowerCase() === roleName.toLowerCase() : false;
  }

  /**
   * Récupère les permissions d'un utilisateur via son rôle
   */
  public async getUserPermissions(user: User): Promise<string[]> {
    await this.ensureSecurityDataLoaded();

    const association = this.securityState?.associations.find(assoc => assoc.role === user.roleId);
    if (!association) return [];

    return this.securityState?.permissions
      .filter(perm => association.permission.includes(perm.id))
      .map(perm => perm.name) || [];
  }

  /**
   * Valide si un rôle peut être assigné à un utilisateur
   */
  public async validateRoleAssignment(roleId: number, userData?: Partial<User>): Promise<boolean> {
    const role = this.getRoleById(roleId);
    if (!role) return false;

    // Logique de validation métier supplémentaire si nécessaire
    return true;
  }

  /**
   * Obtient les rôles disponibles pour un type d'utilisateur spécifique
   */
  public async getRolesByType(roleType: 'agent' | 'caisse' | 'admin' | 'all'): Promise<Role[]> {
    await this.ensureSecurityDataLoaded();

    const roles = this.securityState?.roles || [];

    switch (roleType) {
      case 'agent':
        return roles.filter(role =>
          role.name.toLowerCase().includes('agent') ||
          role.name.toLowerCase().includes('operateur')
        );
      case 'caisse':
        return roles.filter(role =>
          role.name.toLowerCase().includes('caisse') ||
          role.name.toLowerCase().includes('caissier')
        );
      case 'admin':
        return roles.filter(role =>
          role.name.toLowerCase().includes('admin') ||
          role.name.toLowerCase().includes('administrateur')
        );
      default:
        return roles;
    }
  }

  // Méthode pour s'abonner aux changements d'état
  subscribe(callback: (state: UserState) => void): () => void {
    this.stateUpdateCallbacks.push(callback);
    callback(this.state); // Appel immédiat avec l'état actuel

    // Retourner une fonction de désabonnement
    return () => {
      const index = this.stateUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateUpdateCallbacks.splice(index, 1);
      }
    };
  }

  // Mettre à jour l'état et notifier les abonnés
  private updateState(newState: Partial<UserState>): void {
    this.state = { ...this.state, ...newState };
    this.stateUpdateCallbacks.forEach(callback => callback(this.state));
  }

  // Accesseurs
  get users(): User[] {
    return this.state.users;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get selectedUser(): User | null {
    return this.state.selectedUser;
  }

  get error(): string | null {
    return this.state.error;
  }

  // Méthode pour normaliser les données utilisateur
  private normalizeUserData(userData: any): User {
    return {
      id: userData.id?.toString() || '',
      nom: userData.nom || '',
      prenom: userData.prenom || '',
      username: userData.username || '',
      password: userData.password,
      codeUo: userData.codeUo || null,
      roleId: userData.roleId,
      localiteId: userData.localiteId || null,
      peageId: userData.peageId || null,
      sens: userData.sens || null,
      hasPassword: userData.hasPassword || false
    };
  }

  // Méthode pour préparer les données de création/mise à jour
  private prepareUserData(userData: CreateUserRequest | UpdateUserRequest): any {
    const preparedData: any = {
      nom: userData.nom,
      prenom: userData.prenom,
      username: userData.username,
      codeUo: userData.codeUo,
      roleId: userData.roleId
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (userData.localiteId !== undefined) {
      preparedData.localiteId = userData.localiteId;
    }

    if (userData.peageId !== undefined) {
      preparedData.peageId = userData.peageId;
    }

    if (userData.sens !== undefined) {
      preparedData.sens = userData.sens;
    }

    // Ajouter le mot de passe seulement s'il est fourni
    if (userData.password) {
      preparedData.password = userData.password;
    }

    return preparedData;
  }

  async loadAllUsers(): Promise<User[]> {
    this.updateState({ loading: true, error: null });

    try {
      // Charger les données de sécurité en parallèle
      await this.ensureSecurityDataLoaded();

      const apiResponse: UserApiResponse = await this.httpService.get(this.endpoint);

      let users: User[] = [];

      // Gestion des différentes structures de réponse
      if (apiResponse.success && apiResponse.data) {
        users = Array.isArray(apiResponse.data)
          ? apiResponse.data.map(user => this.normalizeUserData(user))
          : [this.normalizeUserData(apiResponse.data)];
      } else if (Array.isArray(apiResponse)) {
        users = apiResponse.map(user => this.normalizeUserData(user));
      }

      this.updateState({
        users: users,
        loading: false
      });

      return users;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    this.updateState({ loading: true, error: null });

    try {
      // Valider le rôle avant création
      const isValidRole = await this.validateRoleAssignment(userData.roleId);
      if (!isValidRole) {
        throw new Error('Le rôle sélectionné n\'est pas valide');
      }

      const preparedData = this.prepareUserData(userData);
      const apiResponse: any = await this.httpService.post(this.endpoint, preparedData);

      let createdUser: User;
      if (apiResponse.success && apiResponse.data) {
        createdUser = this.normalizeUserData(apiResponse.data);
      } else {
        createdUser = this.normalizeUserData(apiResponse);
      }

      this.updateState({
        users: [...this.state.users, createdUser],
        loading: false
      });

      return createdUser;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async updateUser(id: string, userData: Partial<UpdateUserRequest>): Promise<User> {
    this.updateState({ loading: true, error: null });

    try {
      // Valider le rôle si fourni
      if (userData.roleId) {
        const isValidRole = await this.validateRoleAssignment(userData.roleId);
        if (!isValidRole) {
          throw new Error('Le rôle sélectionné n\'est pas valide');
        }
      }

      const url = `${this.endpoint}/${id}`;
      const preparedData = this.prepareUserData(userData as UpdateUserRequest);

      const apiResponse: any = await this.httpService.put(url, preparedData);

      let updatedUser: User;
      if (apiResponse.success && apiResponse.data) {
        updatedUser = this.normalizeUserData(apiResponse.data);
      } else {
        updatedUser = this.normalizeUserData(apiResponse);
      }

      const updatedUsers = this.state.users.map(u =>
        u.id === id ? { ...u, ...updatedUser } : u
      );

      const updatedSelectedUser = this.state.selectedUser?.id === id
        ? { ...this.state.selectedUser, ...updatedUser }
        : this.state.selectedUser;

      this.updateState({
        users: updatedUsers,
        selectedUser: updatedSelectedUser,
        loading: false
      });

      return updatedUser;
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      const url = `${this.endpoint}/${id}`;
      await this.httpService.delete(url);

      const filteredUsers = this.state.users.filter(u => u.id !== id);
      const updatedSelectedUser = this.state.selectedUser?.id === id
        ? null
        : this.state.selectedUser;

      this.updateState({
        users: filteredUsers,
        selectedUser: updatedSelectedUser,
        loading: false
      });
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  async deleteUsers(ids: string[]): Promise<void> {
    this.updateState({ loading: true, error: null });

    try {
      const deletePromises = ids.map(async id => {
        try {
          await this.deleteUser(id);
          return { success: true, id };
        } catch (error) {
          console.error(`Error deleting user ${id}:`, error);
          return { success: false, id, error };
        }
      });

      await Promise.all(deletePromises);
      this.updateState({ loading: false });
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  }

  selectUser(user: User | null): void {
    this.updateState({ selectedUser: user });
  }

  // Méthodes pour vérifier l'unicité
  checkUsernameExists(username: string, excludeId?: string): boolean {
    return this.state.users.some(u =>
      u.username === username && u.id !== excludeId
    );
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.state.users.find(u => u.username === username);
  }

  // Réinitialiser l'état du service
  resetState(): void {
    this.updateState({
      users: [],
      loading: false,
      selectedUser: null,
      error: null
    });
  }

  // Méthode pour obtenir les données formatées pour l'affichage
  getDisplayValue(value: any, defaultValue: string = '-'): string {
    return value !== null && value !== undefined ? value.toString() : defaultValue;
  }

  // Méthode pour obtenir la valeur d'affichage de la localité
  getLocaliteDisplay(localiteId: number | null | undefined): string {
    if (!localiteId) return '-';

    // Implémentation avec le service de localités
    const localite = this.localiteService.getLocaliteById(localiteId);
    return localite ? localite.libLoc : localiteId.toString();
  }

  // Méthode pour obtenir la valeur d'affichage du péage
  getPeageDisplay(peageId: number | null | undefined): string {
    if (!peageId) return '-';

    // Implémentation avec le service de péages
    const peage = this.peageService.peages.find(p => p.id === peageId);
    return peage ? peage.libPeage : peageId.toString();
  }

  // Méthode pour obtenir la valeur d'affichage du sens
  getSensDisplay(sens: 'IN' | 'OUT' | null | undefined): string {
    if (!sens) return '-';
    return sens === 'IN' ? 'Entrée' : 'Sortie';
  }

  // Méthode pour obtenir la valeur d'affichage du rôle
  getRoleDisplay(roleId: number): string {
    return this.getRoleName(roleId);
  }

  // Méthode pour obtenir les statistiques des utilisateurs
  async getUserStats(): Promise<UserStats> {
    await this.loadAllUsers();

    const users = this.state.users;
    const total = users.length;
    const withUo = users.filter(u => u.codeUo).length;
    const withoutUo = total - withUo;
    const withPassword = users.filter(u => u.hasPassword).length;
    const withoutPassword = total - withPassword;

    // Utiliser les rôles du SecurityService
    const roles = await this.getAvailableRoles();

    // Récupérer les UOs depuis le service UO
    await this.uoService.loadAll();
    const uos = this.uoService.getUnits();

    const byRole = roles.map(role => ({
      role: role.name,
      count: users.filter(u => u.roleId === role.id).length,
      code: role.name
    }));

    const byUo = uos.map(uo => ({
      uo: uo.libUo,
      count: users.filter(u => u.codeUo === uo.codeUo).length,
      code: uo.codeUo
    }));

    return {
      total,
      withUo,
      withoutUo,
      withPassword,
      withoutPassword,
      byRole,
      byUo
    };
  }

  // Méthode pour réinitialiser le mot de passe d'un utilisateur
  async resetUserPassword(id: string, newPassword: string): Promise<boolean> {
    this.updateState({ loading: true, error: null });

    try {
      const url = `${this.endpoint}/${id}/reset-password`;
      const apiResponse: any = await this.httpService.post(url, { password: newPassword });

      if (apiResponse.success) {
        // Mettre à jour l'état local
        const updatedUsers = this.state.users.map(u =>
          u.id === id ? { ...u, hasPassword: true } : u
        );

        const updatedSelectedUser = this.state.selectedUser?.id === id
          ? { ...this.state.selectedUser, hasPassword: true }
          : this.state.selectedUser;

        this.updateState({
          users: updatedUsers,
          selectedUser: updatedSelectedUser,
          loading: false
        });

        return true;
      } else {
        throw new Error(apiResponse.message || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (error: any) {
      const appError = this.errorHandler.normalizeError(error);
      const errorMessage = this.errorHandler.getUserMessage(appError);
      this.updateState({ error: errorMessage, loading: false });
      return false;
    }
  }

  /**
   * Filtre les utilisateurs par rôle
   */
  async filterUsersByRole(roleName: string): Promise<User[]> {
    await this.ensureSecurityDataLoaded();

    const role = this.securityState?.roles.find(r =>
      r.name.toLowerCase().includes(roleName.toLowerCase())
    );

    if (!role) return [];

    return this.state.users.filter(user => user.roleId === role.id);
  }

  /**
   * Obtient les utilisateurs avec leurs informations de rôle complètes
   */
  async getUsersWithRoleDetails(): Promise<(User & { roleName: string; permissions: string[] })[]> {
    await this.loadAllUsers();

    return Promise.all(
      this.state.users.map(async user => ({
        ...user,
        roleName: this.getRoleName(user.roleId),
        permissions: await this.getUserPermissions(user)
      }))
    );
  }
}