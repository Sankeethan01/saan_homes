'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
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
    name: 'Equipment Rental',
    icon: RiToolsLine,
    path: '/dashboard/admin/equipments',
    subItems: [
      {
        name: 'Category',
        path: '/dashboard/admin/equipments/addcategory',
        icon: RiListSettingsLine,
      },
      {
        name: 'Equipments',
        path: '/dashboard/admin/equipments/addequipment',
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Compute if we're in equipment section based on pathname
  const isInEquipmentSection = pathname.includes('/dashboard/admin/equipments');
  const [openEquipmentSubMenu, setOpenEquipmentSubMenu] = useState(isInEquipmentSection);

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

  // Generate breadcrumb items
  const breadcrumbItems = pathname
    .split('/')
    .filter(Boolean)
    .map((item, index, array) => ({
      name: item.charAt(0).toUpperCase() + item.slice(1),
      path: '/' + array.slice(0, index + 1).join('/'),
      isLast: index === array.length - 1,
    }));

  const themeValue = { theme, toggleTheme: handleThemeToggle };

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? '64px' : '240px' }}
          className="bg-white dark:bg-gray-800 shadow-lg z-20 h-screen flex flex-col transition-all duration-300 ease-in-out"
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/">
                <div className="flex items-center">
                  <Image
                    src="/assets/logo.jpg"
                    alt="SAAN Homes"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <h1 className="ml-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700">
                    SAAN
                  </h1>
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isCollapsed ? (
                <RiMenuUnfoldLine className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <RiMenuFoldLine className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 pt-4 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.path;
              const isEquipmentRental = item.name === 'Equipment Rental';
              
              if (isEquipmentRental && item.subItems) {
                const isSubItemActive = item.subItems.some(sub => pathname === sub.path);
                
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setOpenEquipmentSubMenu(!openEquipmentSubMenu)}
                      className={`flex items-center px-4 py-3 mb-1 w-full text-left transition-colors duration-200 ${
                        (isActive || isSubItemActive || openEquipmentSubMenu)
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
                      <MdChevronRight 
                        className={`ml-auto transform transition-transform duration-200 ${openEquipmentSubMenu ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {/* Submenu */}
                    {openEquipmentSubMenu && !isCollapsed && (
                      <div className="ml-8">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className={`flex items-center px-4 py-2 rounded transition-colors duration-200 ${
                              pathname === sub.path
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                            }`}
                          >
                            <sub.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="ml-2">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-4 py-3 mb-1 transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
                      className="absolute left-0 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"
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

          {/* Logout Button */}
          <Link 
            href="/dashboard/logout"
            className="p-4 border-t border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200"
          >
            <div className="flex items-center">
              <RiLogoutBoxRLine className="w-5 h-5" />
              <span className={`ml-3 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>
                Logout
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm z-10 sticky top-0">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2">
                {breadcrumbItems.map((item, index) => (
                  <div key={item.path} className="flex items-center">
                    {index > 0 && (
                      <MdChevronRight className="mx-2 text-gray-400 dark:text-gray-500" />
                    )}
                    <Link
                      href={item.path}
                      className={`${
                        item.isLast
                          ? 'text-gray-800 dark:text-gray-200 font-semibold'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Right side icons */}
              <div className="flex items-center space-x-4">
                {/* <button
                  onClick={handleThemeToggle}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Toggle theme"
                >
                  {theme === 'light' ? (
                    <RiMoonLine className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <RiSunLine className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button> */}
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                  title="Notifications"
                >
                  <RiNotification3Line className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <Image
                    src="/assets/logo.jpg"
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-white">
            <div className="p-6">
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
