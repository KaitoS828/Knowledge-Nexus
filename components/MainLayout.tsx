import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { LandingPage } from './LandingPage';
import { Onboarding } from './Onboarding';
import { Loader2 } from 'lucide-react';
import { ThemeManager } from './ThemeManager';

export const MainLayout: React.FC = () => {
    const { user, isOnboarded, isLoading } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    // 認証状態に応じたリダイレクト制御
    useEffect(() => {
        if (isLoading) return;

        if (user && isOnboarded && location.pathname === '/') {
            // ログイン済み -> ダッシュボードへ
            navigate('/dashboard', { replace: true });
        } else if (!user && location.pathname !== '/') {
            // 未ログイン -> ランディングページへ強制リダイレクト
            navigate('/', { replace: true });
        }
    }, [user, isOnboarded, isLoading, location.pathname, navigate]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-nexus-50 dark:bg-nexus-900">
                <Loader2 className="animate-spin text-nexus-500 dark:text-nexus-400" size={48} />
            </div>
        );
    }

    // 1. Not Logged In -> Landing Page
    if (!user) {
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
                    <Outlet />
                </main>
            </div>
        </>
    );
};
