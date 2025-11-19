// hooks/useNavigationWithLoader.ts - Version SANS TIMEOUT
'use client'

import { useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useNavigationWithLoader() {
    const router = useRouter();
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentNavigationItem, setCurrentNavigationItem] = useState('');

    const navigate = useCallback((href: string, itemName: string) => {
        if (pathname === href) return;

        console.log('🚀 Navigation started to:', href);

        // Afficher le loader IMMÉDIATEMENT
        setIsNavigating(true);
        setCurrentNavigationItem(itemName);

        // Lancer la navigation
        router.push(href);

    }, [router, pathname]);

    // Cacher le loader SEULEMENT quand la route change
    useEffect(() => {
        if (isNavigating) {
            console.log('🔄 Route changed, hiding loader');
            setIsNavigating(false);
            setCurrentNavigationItem('');
        }
    }, [pathname]); // Se déclenche à chaque changement de route

    return {
        isNavigating,
        currentNavigationItem,
        navigate
    };
}