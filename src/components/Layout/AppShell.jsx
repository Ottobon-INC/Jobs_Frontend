import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AppShell = () => {
    const { role } = useAuth();
    const location = useLocation();
    const hideFooter = location.pathname.startsWith('/chat');

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50/50">
            <Navbar />

            <div className="flex flex-1 pt-20"> {/* Increased offset for floating header effect */}
                <Sidebar />

                {/* Main Content Area - Refined Neu-Minimalist spacing */}
                <main className={`flex-1 w-full ${role ? 'md:pl-64' : ''} min-w-0 transition-all duration-500 flex flex-col`}>
                    <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-x-hidden">
                        <Outlet />
                    </div>
                    {!hideFooter && <Footer />}
                </main>
            </div>
        </div>
    );
};

export default AppShell;

