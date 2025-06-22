'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RiDashboardLine,
  RiHomeGearLine,
  RiToolsLine,
  RiBriefcaseLine,
  RiTeamLine,
  RiNotification3Line,
  RiSettings4Line,
  RiLogoutBoxRLine
} from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';

const sidebarItems = [
  {
    name: 'Dashboard',
    icon: RiDashboardLine,
    path: '/dashboard/admin',
  },
  {
    name: 'Projects',
    icon: RiHomeGearLine,
    path: '/dashboard/admin/projects',
  },
  {
    name: 'Equipment_Rental',
    icon: RiToolsLine,
    path: '/dashboard/admin/equipments',
  },
  {
    name: 'Portfolio',
    icon: RiBriefcaseLine,
    path: '/dashboard/admin/portfolio',
  },
  {
    name: 'Supervisors',
    icon: RiTeamLine,
    path: '/dashboard/admin/supervisors',
  },
  {
    name: 'Notifications',
    icon: RiNotification3Line,
    path: '/dashboard/admin/notifications',
  },
  {
    name: 'Settings',
    icon: RiSettings4Line,
    path: '/dashboard/admin/settings',
  },
];

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "ADMIN" | "SUPERVISOR" | "PUBLIC";
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`;
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (res) => {
          if (!res.ok) {
            useAuthStore.getState().setToken(null);
            router.replace("/dashboard/login");
            return;
          }
          const data: User = await res.json();
          if (data.role.toLowerCase() !== "admin") {
            router.replace("/dashboard/login");
            return;
          }
          setUser(data);
        })
        .catch((err) => {
          console.error("⚠️ fetch error:", err);
          router.replace("/dashboard/login");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      router.replace("/dashboard/login");
    }
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything if there's no user
  }

  return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? '64px' : '240px' }}
          className="bg-white shadow-lg z-20 h-screen flex flex-col transition-all duration-300 ease-in-out"
        >
          <div className='flex-grow'>
          {/* Logo */}
          <div className="p-4 border-b">
            <h1 className={`font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700 whitespace-nowrap ${isCollapsed ? 'scale-0' : 'scale-100'} transition-transform duration-300`}>
              SAAN Homes
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 pt-4">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-4 py-3 mb-1 transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span
                    className={`ml-3 whitespace-nowrap ${
                      isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
                    } transition-opacity duration-300`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                      layoutId="activeTab"
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            {!isCollapsed && user && (
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-blue-600">
                  {user.first_name?.[0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            )}
            <Link href="/dashboard/logout" passHref>
              <div className={`flex items-center px-4 py-3 transition-colors duration-200 text-red-600 hover:bg-red-50 ${isCollapsed ? 'justify-center' : ''}`}>
                <RiLogoutBoxRLine className="w-5 h-5" />
                <span className={`ml-3 whitespace-nowrap ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'} transition-opacity duration-300`}>
                  Logout
                </span>
              </div>
            </Link>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 border-t text-gray-600 hover:bg-gray-50 transition-colors duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <RiDashboardLine className="w-5 h-5" />
            </motion.div>
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
  );
}
