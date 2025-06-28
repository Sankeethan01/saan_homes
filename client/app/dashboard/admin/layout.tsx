'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { getUserRole, getAccessToken, setAuthCookies, fetchWithAuth } from '@/app/utils/auth';
import {
  RiDashboardLine,
  RiHomeGearLine,
  RiToolsLine,
  RiBriefcaseLine,
  RiTeamLine,
  RiNotification3Line,
  RiSettings4Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiListSettingsLine,
  RiTruckLine,
  RiCalendarCheckLine,
  RiLogoutBoxRLine,
  RiSearchLine,
  RiFileTextLine,
} from 'react-icons/ri';
import { MdChevronRight } from 'react-icons/md';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

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
    name: 'Invoices',
    icon: RiFileTextLine,
    path: '/dashboard/admin/invoices',
  },
  {
    name: 'Equipment Rental',
    icon: RiToolsLine,
    path: '/dashboard/admin/equipments',
    subItems: [
      {
        name: 'Category',
        path: '/dashboard/admin/equipments/categories',
        icon: RiListSettingsLine,
      },
      {
        name: 'Equipments',
        path: '/dashboard/admin/equipments/equipments',
        icon: RiTruckLine,
      },
      {
        name: 'Managing the Rentals',
        path: '/dashboard/admin/equipments/rentalmanagment',
        icon: RiCalendarCheckLine,
      },
    ],
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const setUserRole = useAuthStore((s) => s.setUserRole);
  
  // Compute if we're in equipment section based on pathname
  const isInEquipmentSection = pathname.includes('/dashboard/admin/equipments');
  const [openEquipmentSubMenu, setOpenEquipmentSubMenu] = useState(isInEquipmentSection);

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try to get token from all possible sources
        let accessToken = token;
        if (!accessToken) {
          accessToken = getAccessToken();
          if (accessToken) {
            // If we found a token in cookies/localStorage but not in store, update the store
            setToken(accessToken);
          }
        }
        
        // Get role from all possible sources
        const role = getUserRole();
        
        if (!accessToken || !role) {
          router.push('/dashboard/login');
          return;
        }
        
        // Verify user is an admin
        if (role !== 'ADMIN') {
          if (role === 'SUPERVISOR') {
            router.push('/dashboard/supervisor');
          } else if (role === 'PUBLIC') {
            router.push('/dashboard/me');
          } else {
            router.push('/dashboard/login');
          }
          return;
        }
        
        // Verify token is still valid with the backend using our helper
        try {
          const profileRes = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`
          );
          
          if (!profileRes.ok) {
            // Token is invalid, redirect to login
            useAuthStore.getState().clear();
            router.push('/dashboard/login');
            return;
          }
          
          // Token is valid, ensure it's properly saved everywhere
          const profile = await profileRes.json();
          setUserRole(profile.role);
          
          // Re-sync cookies to ensure they're set properly
          setAuthCookies(accessToken, profile.role, true);
        } catch (error) {
          console.error('Failed to verify authentication:', error);
          router.push('/dashboard/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/dashboard/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [token, router, setToken, setUserRole]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  }, []);

  // Update submenu state when pathname changes
  useEffect(() => {
    setOpenEquipmentSubMenu(isInEquipmentSection);
  }, [isInEquipmentSection]);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Generate breadcrumb items - stop at projects level to prevent layout issues
  const generateBreadcrumbItems = () => {
    const segments = pathname.split('/').filter(Boolean);
    const items = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const path = '/' + segments.slice(0, i + 1).join('/');
      
      // Stop after 'projects' to prevent breadcrumb overflow
      if (segment === 'projects') {
        items.push({
          name: 'Projects',
          path: path,
          isLast: true, // Mark as last to prevent further items
        });
        break;
      }
      
      // Add regular breadcrumb items
      items.push({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: path,
        isLast: i === segments.length - 1,
      });
    }
    
    return items;
  };
  
  const breadcrumbItems = generateBreadcrumbItems();

  const themeValue = { theme, toggleTheme: handleThemeToggle };

  // If we're checking authentication, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-primary"></div>
          </div>
          <p className="text-lg font-medium text-slate-700">Verifying authentication...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? '80px' : '280px' }}
          className="relative bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-20 h-screen flex flex-col transition-all duration-300 ease-in-out shadow-xl"
        >
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <Link href="/" className="flex items-center group">
                  <div className="relative">
                    <Image
                      src="/assets/logo.jpg"
                      alt="SAAN Homes"
                      width={80}
                      height={80}
                      className="relative rounded-xl"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-slate-500 font-medium">Admin Panel</p>
                  </div>
                </Link>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isCollapsed ? (
                  <RiMenuUnfoldLine className="w-5 h-5 text-slate-600" />
                ) : (
                  <RiMenuFoldLine className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 p-4 overflow-y-auto">
            {!isCollapsed && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                  Navigation
                </p>
              </div>
            )}
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.path;
                const isEquipmentRental = item.name === 'Equipment Rental';
                
                if (isEquipmentRental && item.subItems) {
                  const isSubItemActive = item.subItems.some(sub => pathname === sub.path);
                  
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => setOpenEquipmentSubMenu(!openEquipmentSubMenu)}
                        className={`group flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          (isActive || isSubItemActive || openEquipmentSubMenu)
                            ? 'bg-gradient-to-r from-primary-50 to-primary-500 text-primary-700 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-200 ${
                          (isActive || isSubItemActive || openEquipmentSubMenu)
                            ? 'bg-primary-100 text-primary'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className={`ml-3 whitespace-nowrap ${
                          isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                        } transition-all duration-300`}>
                          {item.name}
                        </span>
                        <MdChevronRight 
                          className={`ml-auto w-4 h-4 transform transition-transform duration-200 ${
                            openEquipmentSubMenu ? 'rotate-90' : ''
                          } ${isCollapsed ? 'hidden' : 'block'}`}
                        />
                      </button>
                      
                      {/* Submenu */}
                      <motion.div
                        initial={false}
                        animate={{ 
                          height: openEquipmentSubMenu && !isCollapsed ? 'auto' : 0,
                          opacity: openEquipmentSubMenu && !isCollapsed ? 1 : 0
                        }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 space-y-1 mt-1">
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.path}
                              className={`flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                                pathname === sub.path
                                  ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div className={`p-1.5 rounded-md transition-all duration-200 ${
                                pathname === sub.path
                                  ? 'bg-primary-100 text-primary-600'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                <sub.icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="ml-3">{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className={`ml-3 whitespace-nowrap ${
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                    } transition-all duration-300`}>
                      {item.name}
                    </span>
                                          {isActive && !isCollapsed && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-primary-600 rounded-full"
                          layoutId="activeIndicator"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200/50">
            <Link 
              href="/dashboard/logout"
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 transition-all duration-200">
                <RiLogoutBoxRLine className="w-4 h-4" />
              </div>
              <span className={`ml-3 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'} transition-all duration-300`}>
                Logout
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-10 sticky top-0">
            <div className="flex items-center justify-between px-8 py-4">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 min-w-0 flex-1 mr-6">
                <nav className="flex items-center space-x-2 text-sm min-w-0">
                  {breadcrumbItems.map((item, index) => (
                    <div key={item.path} className="flex items-center min-w-0">
                      {index > 0 && (
                        <MdChevronRight className="mx-2 text-slate-400 w-4 h-4 flex-shrink-0" />
                      )}
                      <Link
                        href={item.path}
                        className={`px-3 py-1.5 rounded-lg transition-all duration-200 truncate ${
                          item.isLast
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                        title={item.name}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Search */}
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 w-64"
                  />
                </div>

                {/* Notifications */}
                <button 
                  className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group"
                  title="Notifications"
                >
                  <RiNotification3Line className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500">Administrator</p>
                  </div>
                  <div className="relative">
                   
                    <div className="absolute -bottom-1 -right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
