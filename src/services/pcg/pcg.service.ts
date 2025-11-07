// @/services/pcg/pcg.service.ts
import { Pcg, CreatePcgRequest, UpdatePcgRequest, PcgApiResponse, PcgState, PcgError } from '@/types/pcg.types';
import { IHttpService } from '@/types/auth.types';

export class PcgService {
    private static instance: PcgService | null = null;
    private httpService: IHttpService;
    private state: PcgState = {
        comptes: [],
        isLoading: false,
        error: null
    };
    private subscribers: ((state: PcgState) => void)[] = [];
    private isLoading = false;

    private constructor(httpService: IHttpService) {
        this.httpService = httpService;
    }

    public static getInstance(httpService: IHttpService): PcgService {
        if (!PcgService.instance) {
            PcgService.instance = new PcgService(httpService);
        }
        return PcgService.instance;
    }

    public static resetInstance(): void {
        PcgService.instance = null;
    }

    private updateState(updates: Partial<PcgState>): void {
        const hasChanged = Object.keys(updates).some(key => {
            return this.state[key as keyof PcgState] !== updates[key as keyof PcgState];
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

    private createError(message: string, type: PcgError['type'] = 'UNKNOWN_ERROR', status?: number): PcgError {
        return { message, type, status };
    }

    public async loadAll(): Promise<{ success: boolean; error?: PcgError }> {
        if (this.isLoading) {
            return { success: true };
        }

        this.isLoading = true;
        this.updateState({ isLoading: true, error: null });

        try {
            console.log('🔄 Chargement des comptes PCG...');
            const response = await this.httpService.get<PcgApiResponse>('pcg');

            console.log('📥 Réponse du backend pour la liste:', response);

            if (response.success && response.data) {
                const comptes = Array.isArray(response.data) ? response.data : [response.data];
                
                console.log('📋 Données PCG reçues (brutes):', {
                    total: comptes.length,
                    comptes: comptes.map(c => ({
                        numero: c.numeroCompte,
                        parent: c.parent,
                        path: c.path,
                        sousComptes: c.sousComptes
                    }))
                });

                // Construire la hiérarchie complète
                const hierarchicalComptes = this.buildHierarchyFromFlatList(comptes);

                console.log('🌳 Hiérarchie construite:', {
                    racines: hierarchicalComptes.filter(c => !c.parent).length,
                    totalHierarchique: this.countAllComptes(hierarchicalComptes),
                    structure: hierarchicalComptes.map(r => ({
                        racine: r.numeroCompte,
                        enfantsDircts: r.sousComptes.length,
                        totalDescendants: this.countAllDescendants(r)
                    }))
                });

                this.updateState({
                    comptes: hierarchicalComptes,
                    isLoading: false,
                    error: null
                });
                return { success: true };
            } else {
                const error = this.createError(
                    response.message || 'Impossible de récupérer les comptes',
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

    private buildHierarchyFromFlatList(flatComptes: Pcg[]): Pcg[] {
        // Utiliser le path comme clé unique (combinaison numéro + contexte hiérarchique)
        const comptesMap = new Map<string, Pcg>();
        
        // Initialiser tous les comptes avec sousComptes vides
        flatComptes.forEach(compte => {
            comptesMap.set(compte.path, {
                ...compte,
                sousComptes: [] // On va reconstruire cette liste
            });
        });

        console.log('🔨 Construction hiérarchie - Map créée:', comptesMap.size, 'comptes');
        console.log('📋 Tous les paths:', Array.from(comptesMap.keys()));

        // Construire la hiérarchie en utilisant le champ parent et le path
        const racines: Pcg[] = [];
        
        flatComptes.forEach(compte => {
            const compteActuel = comptesMap.get(compte.path)!;
            
            if (!compte.parent) {
                // C'est une racine
                racines.push(compteActuel);
                console.log('✨ Racine trouvée:', compte.path, '-', compte.numeroCompte, compte.libelle, `(classe: ${compte.classe})`);
            } else {
                // C'est un enfant, trouver le parent par son path
                // Le path du parent est le path actuel sans le dernier caractère (le numéro du compte actuel)
                const parentPath = compte.path.slice(0, -compte.numeroCompte.length);
                const parent = comptesMap.get(parentPath);
                
                if (parent) {
                    parent.sousComptes.push(compteActuel);
                    console.log('🔗 Enfant ajouté:', compte.path, '→ parent path:', parentPath);
                } else {
                    console.warn('⚠️ Parent non trouvé pour:', compte.path, 'parent path recherché:', parentPath);
                }
            }
        });

        // Trier les racines et leurs enfants récursivement par path
        const sortComptes = (comptes: Pcg[]) => {
            comptes.sort((a, b) => a.path.localeCompare(b.path));
            comptes.forEach(compte => {
                if (compte.sousComptes.length > 0) {
                    sortComptes(compte.sousComptes);
                }
            });
        };

        sortComptes(racines);
        
        console.log('📊 Racines finales:', racines.map(r => ({
            path: r.path,
            numero: r.numeroCompte,
            libelle: r.libelle,
            classe: r.classe,
            nbEnfants: r.sousComptes.length
        })));

        return racines;
    }

    private countAllComptes(comptes: Pcg[]): number {
        let count = 0;
        const countRecursive = (nodes: Pcg[]) => {
            nodes.forEach(node => {
                count++;
                if (node.sousComptes && node.sousComptes.length > 0) {
                    countRecursive(node.sousComptes);
                }
            });
        };
        countRecursive(comptes);
        return count;
    }

    private countAllDescendants(compte: Pcg): number {
        let count = 0;
        const countRecursive = (node: Pcg) => {
            if (node.sousComptes) {
                node.sousComptes.forEach(child => {
                    count++;
                    countRecursive(child);
                });
            }
        };
        countRecursive(compte);
        return count;
    }

    public async create(data: CreatePcgRequest): Promise<{ success: boolean; data?: Pcg; error?: PcgError }> {
        console.log('🔄 Début création PCG - Données reçues:', data);

        if (!data.numeroCompte?.trim()) {
            return { success: false, error: this.createError('Numéro de compte obligatoire', 'VALIDATION_ERROR') };
        }
        
        if (!/^\d+$/.test(data.numeroCompte.trim())) {
            return { success: false, error: this.createError('Le numéro de compte doit être un nombre', 'VALIDATION_ERROR') };
        }

        if (!data.libelle?.trim()) {
            return { success: false, error: this.createError('Libellé obligatoire', 'VALIDATION_ERROR') };
        }

        this.updateState({ isLoading: true, error: null });

        try {
            const requestData = {
                numeroCompte: data.numeroCompte.trim(),
                libelle: data.libelle.trim(),
                classe: data.classe?.trim() || ''
            };

            console.log('📤 Envoi des données au backend:', requestData);

            const newCompte = await this.httpService.post<Pcg>('pcg', requestData);

            console.log('✅ Réponse création du backend:', newCompte);

            await this.loadAll();

            return { success: true, data: newCompte };
        } catch (err: any) {
            console.error('❌ Erreur création PCG:', err);

            let errorMessage = 'Erreur lors de la création';
            let errorType: PcgError['type'] = 'SERVER_ERROR';

            if (err.status === 403) {
                errorMessage = 'Accès refusé pour créer ce type de compte. Vérifiez vos autorisations.';
                errorType = 'UNAUTHORIZED';
            }

            const error = this.createError(errorMessage, errorType, err.status);
            this.updateState({ isLoading: false, error: error.message });
            return { success: false, error };
        }
    }

    public async update(numeroCompte: string, data: UpdatePcgRequest): Promise<{ success: boolean; data?: Pcg; error?: PcgError }> {
        console.log('🔄 Début mise à jour PCG:', { numeroCompte, data });

        if (!numeroCompte) {
            return { success: false, error: this.createError('Numéro de compte invalide', 'VALIDATION_ERROR') };
        }

        this.updateState({ isLoading: true, error: null });

        try {
            const requestData = {
                libelle: data.libelle?.trim(),
                classe: data.classe?.trim()
            };

            console.log('📤 Envoi mise à jour au backend:', requestData);

            const updatedCompte = await this.httpService.put<Pcg>(`pcg/${encodeURIComponent(numeroCompte)}`, requestData);

            console.log('✅ Réponse mise à jour du backend:', updatedCompte);

            await this.loadAll();

            return { success: true, data: updatedCompte };
        } catch (err: any) {
            const error = this.createError(err.message || 'Erreur lors de la mise à jour', 'SERVER_ERROR', err.status);
            this.updateState({ isLoading: false, error: error.message });
            return { success: false, error };
        }
    }

    public async delete(numeroCompte: string): Promise<{ success: boolean; error?: PcgError }> {
        console.log('🗑️ Début suppression PCG:', numeroCompte);

        this.updateState({ isLoading: true, error: null });

        try {
            console.log('📤 Envoi suppression au backend...');
            await this.httpService.delete(`pcg/${encodeURIComponent(numeroCompte)}`);

            console.log('✅ Suppression confirmée par le backend');

            await this.loadAll();

            return { success: true };
        } catch (err: any) {
            const error = this.createError(err.message || 'Erreur lors de la suppression', 'SERVER_ERROR', err.status);
            this.updateState({ isLoading: false, error: error.message });
            return { success: false, error };
        }
    }

    public getComptes(): Pcg[] {
        return [...this.state.comptes];
    }

    public getComptesFlat(): Pcg[] {
        // Aplatir la hiérarchie pour l'affichage en liste
        const flat: Pcg[] = [];
        const flattenRecursive = (nodes: Pcg[]) => {
            nodes.forEach(node => {
                flat.push(node);
                if (node.sousComptes && node.sousComptes.length > 0) {
                    flattenRecursive(node.sousComptes);
                }
            });
        };
        flattenRecursive(this.state.comptes);
        return flat;
    }

    public getState(): PcgState {
        return { ...this.state };
    }

    public getRootComptes(): Pcg[] {
        return this.state.comptes.filter(c => !c.parent);
    }

    public getAvailableParents(excludeNumero?: string): Pcg[] {
        const allComptes: Pcg[] = [];
        const collectAll = (nodes: Pcg[]) => {
            nodes.forEach(node => {
                if (node.numeroCompte !== excludeNumero) {
                    allComptes.push(node);
                }
                if (node.sousComptes && node.sousComptes.length > 0) {
                    collectAll(node.sousComptes);
                }
            });
        };
        collectAll(this.state.comptes);
        return allComptes;
    }

    public findByNumero(numeroCompte: string): Pcg | null {
        const findRecursive = (nodes: Pcg[]): Pcg | null => {
            for (const node of nodes) {
                if (node.numeroCompte === numeroCompte) return node;
                if (node.sousComptes && node.sousComptes.length > 0) {
                    const found = findRecursive(node.sousComptes);
                    if (found) return found;
                }
            }
            return null;
        };
        return findRecursive(this.state.comptes);
    }

    public subscribe(callback: (state: PcgState) => void): () => void {
        this.subscribers.push(callback);
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