'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiDashboardLine, 
  RiBuildingLine, 
  RiNotification3Line, 
  RiUserSettingsLine,
  RiArrowDownSLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxRLine
} from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';
import AuthWrapper from '@/app/components/auth/AuthWrapper';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { title: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard/supervisor',
    icon: <RiDashboardLine className="text-xl" />
  },
  {
    title: 'Projects',
    path: '/dashboard/supervisor/projects',
    icon: <RiBuildingLine className="text-xl" />,
    subItems: [
      { title: 'Project 1', path: '/dashboard/supervisor/projects/1' },
      { title: 'Project 2', path: '/dashboard/supervisor/projects/2' },
      { title: 'Project 3', path: '/dashboard/supervisor/projects/3' }
    ]
  },
  {
    title: 'Notifications',
    path: '/dashboard/supervisor/notifications',
    icon: <RiNotification3Line className="text-xl" />
  },
  {
    title: 'Update Profile',
    path: '/dashboard/supervisor/update_profile',
    icon: <RiUserSettingsLine className="text-xl" />
  }
];

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "ADMIN" | "SUPERVISOR" | "PUBLIC";
}

export default function SupervisorLayout({
  children
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            useAuthStore.getState().setToken(null);
            return router.replace("/dashboard/login");
          }
          const data: User = await res.json();
          if (data.role !== "SUPERVISOR") {
            return router.replace("/dashboard/login");
          }
          setUser(data);
        })
        .catch(() => router.replace("/dashboard/login"))
        .finally(() => setLoading(false));
    } else {
      router.replace("/dashboard/login");
      setLoading(false);
    }
  }, [token, router]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActive = (path: string) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Supervisor Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render if no user
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="bg-white border-r border-gray-200 flex flex-col"
        >
          <div className='flex-grow'>
          {/* Logo and Toggle */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
            {isSidebarOpen && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-gray-800"
              >
                SAAN HOMES
              </motion.h1>
            )}
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              {isSidebarOpen ? (
                <RiMenuFoldLine className="text-xl text-gray-600" />
              ) : (
                <RiMenuUnfoldLine className="text-xl text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (item.subItems) {
                      setExpandedItem(expandedItem === item.title ? null : item.title);
                    }
                  }}
                >
                  {item.icon}
                  {isSidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span>{item.title}</span>
                      {item.subItems && (
                        <RiArrowDownSLine
                          className={`text-lg transition-transform ${
                            expandedItem === item.title ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </motion.div>
                  )}
                </Link>

                {/* Sub Items */}
                {isSidebarOpen && item.subItems && (
                  <AnimatePresence>
                    {expandedItem === item.title && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-9 mt-1 space-y-1"
                      >
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            href={subItem.path}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(subItem.path)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>
          </div>
          
          {/* User Profile Preview & Logout */}
          <div className="border-t border-gray-200 p-4">
              {isSidebarOpen && (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 mb-4"
                  >
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800">{user?.first_name} {user?.last_name}</h3>
                          <p className="text-xs text-gray-500">Supervisor</p>
                      </div>
                  </motion.div>
              )}
              <Link href="/dashboard/logout" className="w-full">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 ${!isSidebarOpen && 'justify-center'}`}>
                      <RiLogoutBoxRLine className="text-xl" />
                      {isSidebarOpen && <span>Logout</span>}
                  </div>
              </Link>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </AuthWrapper>
  );
}
