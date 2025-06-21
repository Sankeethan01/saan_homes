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
import Image from 'next/image';
import './dashboard.css'; // Import the scoped CSS

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

    const hasHydrated = useAuthStore((s) => s._hasHydrated);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
    }, []);
    
    useEffect(() => {
        if (hasHydrated) {
            const currentToken = useAuthStore.getState().token;
            if (!currentToken) {
                router.replace("/dashboard/login-user");
            } else {
                fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`,
                    {
                        headers: { Authorization: `Bearer ${currentToken}` },
                    }
                )
                .then(async (res) => {
                    if (!res.ok) {
                        useAuthStore.getState().clear();
                        router.replace("/dashboard/login-user");
                        return;
                    }
                    const data: User = await res.json();
                    if (data.role !== "PUBLIC") {
                        useAuthStore.getState().clear();
                        router.replace("/dashboard/login-user");
                        return;
                    }
                    setUser(data);
                })
                .catch(() => {
                    useAuthStore.getState().clear();
                    router.replace("/dashboard/login-user");
                })
                .finally(() => setLoading(false));
            }
        }
    }, [hasHydrated, router]);

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

    if (!hasHydrated || loading) {
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
                        <Link href="/dashboard/logout-user">
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
