import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileDrawer from './MobileDrawer';
import { useState } from 'react';

const AppShell = () => {
    const { role } = useAuth();
    const isProvider = role === 'provider';
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    return (
        <div className="h-[100dvh] overflow-hidden flex bg-zinc-50/50 relative">
            <Sidebar />

            <div className="flex-1 h-[100dvh] overflow-hidden flex flex-col header-and-content">
                <Navbar />

                {/* Main Content Area - Locked Viewport Layout */}
                <main className="flex-1 w-full min-w-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-20 md:pb-0">
                    <Outlet />
                </main>
            </div>
            
            <MobileBottomNav onMenuClick={() => setIsMobileDrawerOpen(true)} />
            <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />
        </div>
    );
};

export default AppShell;
