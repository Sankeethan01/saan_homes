'use client';

import { useState, useEffect, ReactNode, memo, useCallback, useMemo } from 'react';
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
  RiLogoutBoxRLine,
  RiFileTextLine,
  RiDeleteBin6Line,
  RiBillLine
} from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { getUserRole, getAccessToken, setAuthCookies, fetchWithAuth } from '@/app/utils/auth';
import Image from 'next/image';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  subItems?: { title: string; path: string }[];
}

// Memoize nav items to prevent re-creation on every render
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
    
  },
  // {
  //   title: 'Bills',
  //   path: '/dashboard/supervisor/bills',
  //   icon: <RiFileTextLine className="text-xl" />,
    
  // },
  {
    title: 'Bill Management',
    path: '/dashboard/supervisor/bill-management',
    icon: <RiBillLine className="text-xl" />
  },
  {
    title: 'Notifications',
    path: '/dashboard/supervisor/notifications',
    icon: <RiNotification3Line className="text-xl" />
  },
  {
    title: 'Recycle Bin',
    path: '/dashboard/supervisor/recycle-bin',
    icon: <RiDeleteBin6Line className="text-xl" />
  },
  {
    title: 'Update Profile',
    path: '/dashboard/supervisor/profile',
    icon: <RiUserSettingsLine className="text-xl" />
  }
];

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
    role: "ADMIN" | "SUPERVISOR" | "PUBLIC";
}

// Memoized navigation item component
const NavItem = memo(({ item, isActive, isSidebarOpen, expandedItem, onExpand }: {
  item: NavItem;
  isActive: boolean;
  isSidebarOpen: boolean;
  expandedItem: string | null;
  onExpand: (title: string) => void;
}) => (
  <div>
    <Link
      href={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#1b4965]/10 text-[#1b4965] font-semibold'
          : 'text-gray-600 hover:bg-[#1b4965]/10 hover:text-[#1b4965]'
      }`}
      onClick={() => {
        if (item.subItems) {
          onExpand(expandedItem === item.title ? '' : item.title);
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
              } text-[#1b4965]`}
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
                  isActive
                    ? 'bg-[#1b4965]/10 text-[#1b4965] font-semibold'
                    : 'text-gray-600 hover:bg-[#1b4965]/10 hover:text-[#1b4965]'
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
));

NavItem.displayName = 'NavItem';

// Memoized user profile component
const UserProfile = memo(({ user, isSidebarOpen }: { user: User; isSidebarOpen: boolean }) => (
  <div className="border-t border-[#1b4965] p-4 bg-white">
    {isSidebarOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 mb-4"
      >
        {user?.profile_image ? (
          <div className="relative w-10 h-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profile_image}`}
              alt="Profile"
              fill
              sizes="40px"
              className="rounded-full object-cover border-2 border-[#1b4965] shadow-sm"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-800">
            {user?.first_name} {user?.last_name}
          </h3>
          <p className="text-xs text-gray-500">Supervisor</p>
        </div>
      </motion.div>
    )}
    <Link href="/dashboard/logout" className="w-full">
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 ${
          !isSidebarOpen && 'justify-center'
        }`}
      >
        <RiLogoutBoxRLine className="text-xl" />
        {isSidebarOpen && <span>Logout</span>}
      </div>
    </Link>
  </div>
));

UserProfile.displayName = 'UserProfile';

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

  // Memoize expensive computations
  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  
  const handleExpand = useCallback((title: string) => {
    setExpandedItem(expandedItem === title ? null : title);
  }, [expandedItem]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(!isSidebarOpen), [isSidebarOpen]);

  // Optimize authentication check with proper dependencies
  useEffect(() => {
    let isMounted = true;
    
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
          if (isMounted) router.push('/dashboard/login');
          return;
        }
        
        // Verify user is a supervisor
        if (role !== 'SUPERVISOR') {
          if (role === 'ADMIN') {
            if (isMounted) router.push('/dashboard/admin');
          } else if (role === 'PUBLIC') {
            if (isMounted) router.push('/dashboard/me');
          } else {
            if (isMounted) router.push('/dashboard/login');
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
            if (isMounted) router.replace("/dashboard/login");
            return;
          }
          
          const data = await profileRes.json();
          if (isMounted) {
            setUser(data);
            // Re-sync cookies to ensure they're set properly
            setAuthCookies(accessToken, data.role, true);
          }
        } catch (error) {
          console.error('Failed to verify authentication:', error);
          if (isMounted) router.replace("/dashboard/login");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [token, router]);


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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="bg-white flex flex-col fixed top-0 left-0 h-screen z-30"
        >
          <div className='flex-grow'>
          {/* Logo and Toggle */}
          <div className="h-16  flex items-center justify-between px-4 bg-white">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <Image src="/assets/logo.jpg" alt="Logo" width={40} height={40} className="rounded-xl" style={{ width: 'auto', height: 'auto' }} />
              </motion.div>
            )}
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              {isSidebarOpen ? (
                <RiMenuFoldLine className="text-xl text-[#1b4965]" />
              ) : (
                <RiMenuUnfoldLine className="text-xl text-[#1b4965]" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={isActive(item.path)}
                isSidebarOpen={isSidebarOpen}
                expandedItem={expandedItem}
                onExpand={handleExpand}
              />
            ))}
          </nav>
          </div>
          
          {/* User Profile Preview & Logout */}
          {user && <UserProfile user={user} isSidebarOpen={isSidebarOpen} />}

        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 ml-[80px] md:ml-[280px]">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
  );
}
