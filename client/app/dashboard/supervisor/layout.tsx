'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiDashboardLine, 
  RiBuildingLine, 
  RiNotification3Line, 
  RiUserSettingsLine,
  RiArrowDownSLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine
} from 'react-icons/ri';

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

export default function SupervisorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActive = (path: string) => pathname === path;
  const isSubActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-200 flex flex-col"
      >
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

        {/* User Profile Preview */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-gray-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800">John Doe</h3>
                <p className="text-xs text-gray-500">Supervisor</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
