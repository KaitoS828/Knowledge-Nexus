'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { LandingPage } from '@/components/LandingPage';
import { Onboarding } from '@/components/Onboarding';
import { Loader2 } from 'lucide-react';
import { ThemeManager } from '@/components/ThemeManager';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user, isOnboarded, isLoading } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();

    // 認証状態に応じたリダイレクト制御
    useEffect(() => {
        if (isLoading) return;

        if (user && isOnboarded && pathname === '/') {
            // ログイン済み -> ダッシュボードへ
            router.replace('/dashboard');
        } else if (!user && pathname !== '/' && pathname !== '/pricing') {
            // 未ログイン -> ランディングページへ強制リダイレクト (pricingは除外)
            router.replace('/');
        }
    }, [user, isOnboarded, isLoading, pathname, router]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-nexus-50 dark:bg-nexus-900">
                <Loader2 className="animate-spin text-nexus-500 dark:text-nexus-400" size={48} />
            </div>
        );
    }

    // 1. Not Logged In -> Landing Page
    if (!user) {
        // pricing ページは認証なしでアクセス可能
        if (pathname === '/pricing') {
            return <>{children}</>;
        }
        return <LandingPage />;
    }

    // 2. Logged In but No Brain -> Onboarding (Setup)
    if (!isOnboarded) {
        return <Onboarding />;
    }

    // 3. Logged In + Onboarded -> App
    return (
        <>
            <ThemeManager />
            <div className="flex h-screen w-screen overflow-hidden bg-nexus-50 dark:bg-nexus-900">
                {/* Main Content - Full Screen (No Sidebar) */}
                <main className="flex-1 h-full relative overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </>
    );
};
