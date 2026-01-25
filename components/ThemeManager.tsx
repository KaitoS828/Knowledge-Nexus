import React, { useEffect } from 'react';
import { useAppStore } from '../store';

export const ThemeManager: React.FC = () => {
    const { preferences } = useAppStore();

    useEffect(() => {
        const root = window.document.documentElement;
        const theme = preferences.theme;

        const applyTheme = (resolvedTheme: 'light' | 'dark') => {
            if (resolvedTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme(mediaQuery.matches ? 'dark' : 'light');
            
            handleChange(); // Initial check
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            applyTheme(theme);
        }
    }, [preferences.theme]);

    return null; // This component doesn't render anything
};
