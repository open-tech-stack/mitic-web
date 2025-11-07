import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore, LoginCredentials, AuthError } from '@/types/auth.types';
import { ServiceFactory } from '@/services/factory/factory.service';

/**
 * Store Zustand pour la gestion de l'authentification
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // === ÉTAT INITIAL (AuthState) ===
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // === ACTIONS ET SERVICES (AuthActions) ===
      authService: null,

      // Initialisation du service
      initialize: () => {
        const { authService } = get();
        if (!authService) {
          const service = ServiceFactory.createAuthService({
            baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
          });
          set({ authService: service });

          // Souscription aux changements d'état
          service.subscribe((state) => {
            set({
              user: state.user,
              token: state.token,
              refreshToken: state.refreshToken,
              isAuthenticated: state.isAuthenticated,
              isLoading: state.isLoading,
              error: state.error
            });
          });
        }
      },

      // Connexion
      login: async (credentials: LoginCredentials) => {
        const { authService } = get();
        if (!authService) {
          throw new Error('AuthService non initialisé');
        }

        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.login(credentials);
          return result;
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors de la connexion';
          set({ error: errorMessage, isLoading: false });
          return { 
            success: false, 
            error: {
              message: errorMessage,
              type: 'UNKNOWN_ERROR'
            } 
          };
        }
      },

      // Déconnexion
      logout: async () => {
        const { authService } = get();
        if (authService) {
          await authService.logout();
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      // Restauration de session - CORRIGÉ : pas de boucle
      restoreSession: async (): Promise<boolean> => {
        const { authService, isAuthenticated, isLoading } = get();
        
        // Éviter les restaurations multiples
        if (isLoading || isAuthenticated) {
          return false;
        }

        if (!authService) return false;

        try {
          set({ isLoading: true });
          const success = await authService.restoreSession();
          set({ isLoading: false });
          return success;
        } catch (error) {
          console.error('Erreur lors de la restauration de session:', error);
          set({ isLoading: false });
          return false;
        }
      },

      // Refresh token - NOM CORRIGÉ
      refreshTokenAction: async (): Promise<boolean> => {
        const { authService } = get();
        if (!authService) return false;

        try {
          return await authService.refreshToken();
        } catch (error) {
          console.error('Erreur lors du refresh token:', error);
          return false;
        }
      },

      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      // Éviter l'erreur de sérialisation
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      }
    }
  )
);