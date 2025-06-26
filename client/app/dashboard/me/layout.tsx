// app/dashboard/me/layout.tsx
"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    RiTruckLine, RiNotification3Line, RiHistoryLine, RiFileList2Line, 
    RiMessage2Line, RiCustomerService2Line, RiUser3Line, RiLogoutBoxRLine, 
    RiMenuFoldLine, RiMenuUnfoldLine, RiSunLine, RiMoonLine, RiSearchLine 
} from 'react-icons/ri';
import { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { getUserRole, getAccessToken, setAuthCookies, fetchWithAuth } from '@/app/utils/auth';
import Image from 'next/image';
import './dashboard.css'; 

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "ADMIN" | "SUPERVISOR" | "PUBLIC";
}

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [theme, setTheme] = useState('light');

    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
    }, []);
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                
                // Try to get token from all possible sources
                let accessToken = token;
                if (!accessToken) {
                    accessToken = getAccessToken();
                    if (accessToken) {
                        // If we found a token in cookies/localStorage but not in store, update the store
                        useAuthStore.getState().setToken(accessToken);
                    }
                }
                
                // Get role from all possible sources
                const role = getUserRole();
                
                if (!accessToken || !role) {
                    router.push('/dashboard/login');
                    return;
                }
                
                // Verify user is a public user
                if (role !== 'PUBLIC') {
                    if (role === 'ADMIN') {
                        router.push('/dashboard/admin');
                    } else if (role === 'SUPERVISOR') {
                        router.push('/dashboard/supervisor');
                    } else {
                        router.push('/dashboard/login');
                    }
                    return;
                }

                // Fetch user details using our helper
                try {
                    const profileRes = await fetchWithAuth(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`
                    );
                    
                    if (!profileRes.ok) {
                        useAuthStore.getState().clear();
                        router.replace("/dashboard/login");
                        return;
                    }
                    
                    const data = await profileRes.json();
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                    
                    // Re-sync cookies to ensure they're set properly
                    setAuthCookies(accessToken, data.role, true);
                } catch (error) {
                    console.error('Failed to verify authentication:', error);
                    router.replace("/dashboard/login");
                }
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, [token, router]);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: RiTruckLine, href: '/dashboard/me' },
        { id: 'notifications', label: 'Notifications', icon: RiNotification3Line, href: '/dashboard/me/notifications' },
        { id: 'history', label: 'Rental History', icon: RiHistoryLine, href: '/dashboard/me/rentals' },
        { id: 'conditions', label: 'Rental Conditions', icon: RiFileList2Line, href: '/dashboard/me/conditions' },
        { id: 'feedback', label: 'Feedback', icon: RiMessage2Line, href: '/dashboard/me/feedbacks' },
        { id: 'contact', label: 'Contact Us', icon: RiCustomerService2Line, href: '/dashboard/me/contact' },
        { id: 'profile', label: 'Account Settings', icon: RiUser3Line, href: '/dashboard/me/profile' },
    ];

    const themeValue = { theme, toggleTheme: handleThemeToggle };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background-color)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--text-color)] text-lg">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; 
    }

    return (
            <ThemeContext.Provider value={themeValue}>
                <div className={`dashboard-scope ${theme} min-h-screen flex text-[var(--text-color)]`}>
                    {/* Sidebar */}
                    <motion.div
                        initial={false}
                        animate={{ width: isSidebarCollapsed ? '5rem' : '16rem' }}
                        className="bg-[var(--card-bg-color)] shadow-lg h-screen sticky top-0 flex flex-col z-50"
                    >
                        <div className="p-4 flex items-center justify-between">
                            {!isSidebarCollapsed && (
                                <Link href="/">
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700">
                                        SAAN
                                    </h1>
                                </Link>
                            )}
                            <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-full hover:bg-[var(--background-color)]">
                                {isSidebarCollapsed ? <RiMenuUnfoldLine className="text-xl" /> : <RiMenuFoldLine className="text-xl" />}
                            </button>
                        </div>

                        <nav className="mt-4 flex-grow">
                            {sidebarItems.map((item) => (
                                <Link href={item.href} key={item.id}>
                                    <motion.div
                                        whileHover={{ x: isSidebarCollapsed ? 0 : 5 }}
                                        className={`flex items-center gap-3 mx-2 my-1 px-4 py-3 text-left transition-all duration-300 rounded-lg cursor-pointer
                                        ${pathname === item.href
                                            ? 'bg-[var(--primary-color)] text-white shadow-md'
                                            : 'hover:bg-[var(--background-color)]'
                                        }`}
                                    >
                                        <item.icon className="text-xl flex-shrink-0" />
                                        {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                                    </motion.div>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto p-4 border-t border-[var(--border-color)]">
                            <Link href="/dashboard/logout">
                                <motion.div
                                    whileHover={{ x: isSidebarCollapsed ? 0 : 5 }}
                                    className="flex items-center gap-3 mx-2 px-4 py-3 text-left transition-colors cursor-pointer text-red-500 hover:bg-red-500/10 rounded-lg"
                                >
                                    <RiLogoutBoxRLine className="text-xl flex-shrink-0" />
                                    {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Top Navbar */}
                        <header className="sticky top-0 bg-[var(--navbar-bg-color)] backdrop-blur-lg shadow-sm p-4 z-40">
                            <div className="flex items-center justify-between">
                                <div className="relative">
                                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary-color)]" />
                                    <input 
                                        type="text" 
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 rounded-full bg-[var(--input-bg-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <button onClick={handleThemeToggle} className="p-2 rounded-full hover:bg-[var(--background-color)]" title="Toggle Theme">
                                        {theme === 'light' ? <RiMoonLine className="text-xl" /> : <RiSunLine className="text-xl" />}
                                    </button>
                                    <button className="relative p-2 rounded-full hover:bg-[var(--background-color)]" title="Notifications">
                                        <RiNotification3Line className="text-xl" />
                                        <span className="absolute top-1 right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    </button>
                                    <div className="relative">
                                        <Image
                                            src="/assets/logo.jpg"
                                            alt="User"
                                            width={40}
                                            height={40}
                                            className="rounded-full cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </header>
                        
                        <main className="flex-1 p-6 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </ThemeContext.Provider>
    );
}
