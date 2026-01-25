import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Search, Loader2 } from 'lucide-react';
import { RightSidebar } from './RightSidebar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { LandingPage } from './LandingPage';
import { Onboarding } from './Onboarding';

export const MainLayout: React.FC = () => {
    const { user, isOnboarded, isLoading } = useAppStore();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
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
            <div className="h-screen w-screen flex items-center justify-center bg-nexus-50">
                <Loader2 className="animate-spin text-nexus-500" size={48} />
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

    // Right sidebar is only visible on dashboard
    const showRightSidebar = location.pathname === '/dashboard';

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-nexus-50">
            {/* Mobile Header (Only visible on mobile) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-nexus-200 z-30 flex items-center justify-between px-4">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-nexus-600 hover:bg-nexus-50 rounded-lg"
                >
                    <Menu size={24} />
                </button>
                <span className="text-lg font-black text-nexus-900 tracking-tight">Nexus</span>
                
                {showRightSidebar ? (
                    <button 
                        onClick={() => setIsRightSidebarOpen(true)}
                        className="p-2 -mr-2 text-nexus-600 hover:bg-nexus-50 rounded-lg"
                    >
                        <Search size={24} />
                    </button>
                ) : (
                    <div className="w-10"></div> // Spacer to center title
                )}
            </div>

            {/* Sidebar (Desktop: Sticky, Mobile: Fixed Overlay) */}
            <div 
                className={`
                    fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 h-full relative overflow-y-auto w-full pt-16 lg:pt-0">
                <Outlet />
            </main>

            {/* Right Sidebar (Desktop: Sticky/Block, Mobile: Fixed Overlay) */}
            {showRightSidebar && (
                <>
                    <div 
                        className={`
                            fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
                            ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                        `}
                    >
                         <RightSidebar 
                            onClose={() => setIsRightSidebarOpen(false)} 
                            onAnalyzeUrl={() => {
                                // Default analyze action passed if needed, mainly handled inside
                                setIsRightSidebarOpen(false);
                            }} 
                         />
                    </div>
                    {/* Mobile Right Sidebar Overlay */}
                    {isRightSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setIsRightSidebarOpen(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
};
