// services/storage/cookie.service.ts
/**
 * Service de gestion des cookies sécurisés - VERSION AMÉLIORÉE
 */
export class CookieService {
    private static instance: CookieService;
    private readonly domain: string;
    private readonly secure: boolean;

    private constructor() {
        this.domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || window.location.hostname;
        this.secure = process.env.NODE_ENV === 'production';
    }

    public static getInstance(): CookieService {
        if (!CookieService.instance) {
            CookieService.instance = new CookieService();
        }
        return CookieService.instance;
    }

    /**
     * Définit un cookie sécurisé - VERSION ROBUSTE
     */
    public setCookie(name: string, value: string, options: {
        maxAge?: number;
        path?: string;
        sameSite?: 'strict' | 'lax' | 'none';
        httpOnly?: boolean;
    } = {}): void {
        if (typeof document === 'undefined') {
            console.log('📝 CookieService: document non disponible (SSR)');
            return;
        }

        const {
            maxAge = 30 * 24 * 60 * 60,
            path = '/',
            sameSite = 'strict',
            httpOnly = false
        } = options;

        console.log(`🍪 Définition du cookie: ${name}`, {
            valueLength: value?.length,
            maxAge,
            path,
            domain: this.domain
        });

        try {
            if (!value || typeof value !== 'string') {
                throw new Error(`Valeur invalide pour le cookie ${name}`);
            }

            // VÉRIFICATION DE LA TAILLE DU COOKIE
            const cookieValue = encodeURIComponent(value);
            if (cookieValue.length > 4000) {
                console.warn(`⚠️ Cookie ${name} très long: ${cookieValue.length} caractères (limite ~4096)`);

                // Pour les tokens très longs, on peut essayer de les compresser
                if (name === 'auth_token' && cookieValue.length > 4000) {
                    console.warn('🚨 Token trop long pour un cookie standard, utilisation de stratégie alternative');
                    // On va utiliser une stratégie différente
                    this.setLargeTokenCookie(name, value, options);
                    return;
                }
            }

            let cookie = `${name}=${cookieValue};`;
            cookie += ` Max-Age=${maxAge};`;
            cookie += ` Path=${path};`;
            cookie += ` Domain=${this.domain};`;
            cookie += ` SameSite=${sameSite};`;

            if (this.secure) {
                cookie += ' Secure;';
            }

            if (httpOnly) {
                cookie += ' HttpOnly;';
            }

            // Écriture du cookie
            document.cookie = cookie;

            console.log(`✅ Cookie ${name} défini avec succès (${cookieValue.length} caractères)`);

        } catch (error) {
            console.error(`❌ Erreur lors de la définition du cookie ${name}:`, error);
            throw error;
        }
    }

    /**
     * Stratégie pour les tokens très longs
     */
    private setLargeTokenCookie(name: string, value: string, options: any): void {
        try {
            // Option 1: Stocker dans sessionStorage en fallback
            if (typeof sessionStorage !== 'undefined') {
                const storageKey = `large_${name}`;
                sessionStorage.setItem(storageKey, value);
                console.log(`💾 Token long sauvegardé dans sessionStorage: ${storageKey}`);

                // Stocker une référence dans le cookie
                const reference = `session_storage:${storageKey}`;
                this.setCookie(name, reference, { ...options, maxAge: 30 * 60 }); // 30 minutes
                return;
            }

            // Option 2: Diviser le token en plusieurs cookies
            this.setSplitTokenCookie(name, value, options);

        } catch (error) {
            console.error(`❌ Erreur avec la stratégie de token long:`, error);
            throw error;
        }
    }

    /**
        * Diviser un token long en plusieurs cookies
        */

    private setSplitTokenCookie(name: string, value: string, options: any): void {
        const CHUNK_SIZE = 2000; // Taille de chaque chunk
        const chunks: string[] = [];

        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
            chunks.push(value.substring(i, i + CHUNK_SIZE));
        }

        // Sauvegarder le nombre de chunks
        this.setCookie(`${name}_chunks`, chunks.length.toString(), options);

        // Sauvegarder chaque chunk
        chunks.forEach((chunk, index) => {
            this.setCookie(`${name}_${index}`, chunk, options);
        });

        console.log(`🔀 Token divisé en ${chunks.length} chunks`);
    }

    /**
     * Récupérer un token divisé
     */
    private getSplitTokenCookie(name: string): string | null {
        try {
            const chunksCount = this.getCookie(`${name}_chunks`);
            if (!chunksCount) return null;

            const count = parseInt(chunksCount);
            let token = '';

            for (let i = 0; i < count; i++) {
                const chunk = this.getCookie(`${name}_${i}`);
                if (!chunk) {
                    console.error(`❌ Chunk manquant: ${name}_${i}`);
                    return null;
                }
                token += chunk;
            }

            return token;
        } catch (error) {
            console.error(`❌ Erreur lors de la reconstruction du token divisé:`, error);
            return null;
        }
    }

    /**
     * Récupère un cookie avec gestion des tokens longs
     */
    public getCookie(name: string): string | null {
        if (typeof document === 'undefined') {
            console.log('📝 CookieService: document non disponible (SSR)');
            return null;
        }

        try {
            const cookies = document.cookie.split(';');
            
            for (const cookie of cookies) {
                const [cookieName, cookieValue] = cookie.trim().split('=');
                if (cookieName === name && cookieValue) {
                    const value = decodeURIComponent(cookieValue);
                    
                    // Vérifier si c'est une référence à sessionStorage
                    if (value.startsWith('session_storage:')) {
                        const storageKey = value.replace('session_storage:', '');
                        if (typeof sessionStorage !== 'undefined') {
                            const storedValue = sessionStorage.getItem(storageKey);
                            console.log(`💾 Token long récupéré depuis sessionStorage: ${storageKey}`);
                            return storedValue;
                        }
                        return null;
                    }

                    console.log(`🍪 Récupération du cookie: ${name}`, { 
                        found: true, 
                        valueLength: value?.length 
                    });
                    return value;
                }
            }
            
            // Vérifier si c'est un token divisé
            if (name === 'auth_token') {
                const splitToken = this.getSplitTokenCookie(name);
                if (splitToken) {
                    console.log(`🔀 Token reconstruit depuis chunks: ${splitToken.length} caractères`);
                    return splitToken;
                }
            }
            
            console.log(`🍪 Cookie non trouvé: ${name}`);
            return null;
            
        } catch (error) {
            console.error(`❌ Erreur lors de la récupération du cookie ${name}:`, error);
            return null;
        }
    }


    /**
     * Supprime un cookie
     */
    public deleteCookie(name: string, path: string = '/'): void {
        if (typeof document === 'undefined') return;

        try {
            document.cookie = `${name}=; Max-Age=0; Path=${path}; Domain=${this.domain}; SameSite=strict${this.secure ? '; Secure' : ''}`;
            console.log(`🗑️ Cookie ${name} supprimé`);
        } catch (error) {
            console.error(`❌ Erreur lors de la suppression du cookie ${name}:`, error);
        }
    }

    /**
     * Vérifie si les cookies sont supportés
     */
    public areCookiesEnabled(): boolean {
        if (typeof document === 'undefined') return false;

        try {
            const testCookie = 'cookies_enabled_test';
            const testValue = 'test_value_123';

            this.setCookie(testCookie, testValue, { maxAge: 60 });
            const isEnabled = this.getCookie(testCookie) === testValue;

            this.deleteCookie(testCookie);

            return isEnabled;
        } catch {
            return false;
        }
    }
}