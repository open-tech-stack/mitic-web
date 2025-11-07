// @/services/uo.service.ts
import { OrganizationalUnit, CreateUoRequest, UpdateUoRequest, UoApiResponse, UoState, UoError } from '@/types/uo.types';
import { IHttpService } from '@/types/auth.types';

export class UoService {
  private static instance: UoService | null = null;
  private httpService: IHttpService;
  private state: UoState = {
    units: [],
    isLoading: false,
    error: null
  };
  private subscribers: ((state: UoState) => void)[] = [];
  private isLoading = false;

  private constructor(httpService: IHttpService) {
    this.httpService = httpService;
  }

  public static getInstance(httpService: IHttpService): UoService {
    if (!UoService.instance) {
      UoService.instance = new UoService(httpService);
    }
    return UoService.instance;
  }

  public static resetInstance(): void {
    UoService.instance = null;
  }

  private updateState(updates: Partial<UoState>): void {
    const hasChanged = Object.keys(updates).some(key => {
      return this.state[key as keyof UoState] !== updates[key as keyof UoState];
    });

    if (hasChanged) {
      this.state = { ...this.state, ...updates };
      this.notifySubscribers();
    }
  }

  private notifySubscribers(): void {
    setTimeout(() => {
      this.subscribers.forEach(callback => {
        try {
          callback({ ...this.state });
        } catch (error) {
          console.error('Erreur callback:', error);
        }
      });
    }, 0);
  }

  public canCreateRoot(): boolean {
    return !this.state.units.some(u => u.parent === null);
  }

  public validateParentSelection(parent: string | null): { isValid: boolean; error?: string } {
    const hasRoot = this.state.units.some(u => u.parent === null);

    if (hasRoot && !parent) {
      return {
        isValid: false,
        error: "Une unité racine existe déjà. Vous devez choisir un parent."
      };
    }

    if (!hasRoot && parent) {
      return {
        isValid: false,
        error: "Aucune unité racine n'existe. Vous devez créer une unité racine."
      };
    }

    return { isValid: true };
  }

  private createError(message: string, type: UoError['type'] = 'UNKNOWN_ERROR', status?: number): UoError {
    return { message, type, status };
  }

  public async loadAll(): Promise<{ success: boolean; error?: UoError }> {
    if (this.isLoading) {
      return { success: true };
    }

    this.isLoading = true;
    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.httpService.get<UoApiResponse>('arbre');

      if (response.success && response.data) {
        const units = Array.isArray(response.data) ? response.data : [response.data];
        const hierarchicalUnits = this.buildHierarchy(units);

        this.updateState({
          units: hierarchicalUnits,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        const error = this.createError(
          response.message || 'Impossible de récupérer les unités',
          'SERVER_ERROR',
          response.status
        );
        this.updateState({ isLoading: false, error: error.message });
        return { success: false, error };
      }
    } catch (err: any) {
      const error = this.createError(
        err.message || 'Erreur de connexion',
        err.status === 401 ? 'UNAUTHORIZED' : 'NETWORK_ERROR',
        err.status
      );
      this.updateState({ isLoading: false, error: error.message });
      return { success: false, error };
    } finally {
      this.isLoading = false;
    }
  }

  private buildHierarchy(flatUnits: OrganizationalUnit[]): OrganizationalUnit[] {
    const unitsMap = new Map<string, OrganizationalUnit>();
    const result: OrganizationalUnit[] = [];

    // D'abord créer tous les nœuds
    flatUnits.forEach(unit => {
      unitsMap.set(unit.codeUo, {
        ...unit,
        enfants: []
      });
    });

    // Puis construire la hiérarchie
    unitsMap.forEach(unit => {
      if (unit.parent && unitsMap.has(unit.parent)) {
        const parent = unitsMap.get(unit.parent);
        if (parent) {
          parent.enfants.push(unit);
        }
      } else {
        // Unité racine
        result.push(unit);
      }
    });
    return Array.from(unitsMap.values());
  }

  public async create(data: CreateUoRequest): Promise<{ success: boolean; data?: OrganizationalUnit; error?: UoError }> {
    if (!data.codeUo?.trim()) {
      return { success: false, error: this.createError('Code UO obligatoire', 'VALIDATION_ERROR') };
    }
    if (!data.libUo?.trim()) {
      return { success: false, error: this.createError('Libellé UO obligatoire', 'VALIDATION_ERROR') };
    }

    // Vérifier unicité
    if (this.state.units.some(u => u.codeUo === data.codeUo.trim())) {
      return { success: false, error: this.createError('Ce code UO existe déjà', 'VALIDATION_ERROR') };
    }

    this.updateState({ isLoading: true, error: null });

    try {
      const newUnit = await this.httpService.post<OrganizationalUnit>('arbre', {
        codeUo: data.codeUo.trim(),
        libUo: data.libUo.trim(),
        parent: data.parent || null
      });

      // Recharger toutes les données pour avoir la structure hiérarchique correcte
      await this.loadAll();

      return { success: true, data: newUnit };
    } catch (err: any) {
      const error = this.createError(err.message || 'Erreur lors de la création', 'SERVER_ERROR', err.status);
      this.updateState({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  }

  public async update(codeUo: string, data: UpdateUoRequest): Promise<{ success: boolean; data?: OrganizationalUnit; error?: UoError }> {
    if (!codeUo) {
      return { success: false, error: this.createError('Code UO invalide', 'VALIDATION_ERROR') };
    }

    const existingUnit = this.state.units.find(u => u.codeUo === codeUo);
    if (!existingUnit) {
      return { success: false, error: this.createError('Unité non trouvée', 'NOT_FOUND') };
    }

    this.updateState({ isLoading: true, error: null });

    try {
      const updatedUnit = await this.httpService.put<OrganizationalUnit>(`arbre/${encodeURIComponent(codeUo)}`, data);

      // Recharger toutes les données
      await this.loadAll();

      return { success: true, data: updatedUnit };
    } catch (err: any) {
      const error = this.createError(err.message || 'Erreur lors de la mise à jour', 'SERVER_ERROR', err.status);
      this.updateState({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  }

  public async delete(codeUo: string): Promise<{ success: boolean; error?: UoError }> {
    const unit = this.state.units.find(u => u.codeUo === codeUo);
    if (!unit) {
      return { success: false, error: this.createError('Unité non trouvée', 'NOT_FOUND') };
    }

    if (unit.enfants?.length > 0) {
      return { success: false, error: this.createError('Impossible de supprimer une unité avec des sous-unités', 'VALIDATION_ERROR') };
    }

    this.updateState({ isLoading: true, error: null });

    try {
      await this.httpService.delete(`arbre/${encodeURIComponent(codeUo)}`);

      // Recharger toutes les données
      await this.loadAll();

      return { success: true };
    } catch (err: any) {
      const error = this.createError(err.message || 'Erreur lors de la suppression', 'SERVER_ERROR', err.status);
      this.updateState({ isLoading: false, error: error.message });
      return { success: false, error };
    }
  }

  // Méthodes utilitaires
  public getUnits(): OrganizationalUnit[] {
    return [...this.state.units];
  }

  public getState(): UoState {
    return { ...this.state };
  }

  public getRootUnits(): OrganizationalUnit[] {
    return this.state.units.filter(u => !u.parent);
  }

  public getAvailableParents(excludeCode?: string): OrganizationalUnit[] {
    return this.state.units.filter(u => u.codeUo !== excludeCode);
  }

  public findByCode(codeUo: string): OrganizationalUnit | null {
    return this.state.units.find(u => u.codeUo === codeUo) || null;
  }

  public subscribe(callback: (state: UoState) => void): () => void {
    this.subscribers.push(callback);

    // Appel immédiat avec l'état actuel
    callback({ ...this.state });

    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  public clearError(): void {
    this.updateState({ error: null });
  }
}