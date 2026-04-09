import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppShell = () => {
    const { role } = useAuth();

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-zinc-50/50">
            <Navbar />

            <div className="flex flex-1 pt-20 overflow-hidden"> {/* Offset for floating header */}
                <Sidebar />

                {/* Main Content Area - Locked Viewport Layout */}
                <main className={`flex-1 w-full ${role ? 'md:pl-80' : ''} min-w-0 transition-all duration-500 h-full overflow-y-auto custom-scrollbar`}>
                    <div className="p-6 md:p-10 lg:p-12">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppShell;
