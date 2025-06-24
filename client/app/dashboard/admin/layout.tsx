'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RiDashboardLine,
  RiHomeGearLine,
  RiToolsLine,
  RiBriefcaseLine,
  RiTeamLine,
  RiNotification3Line,
  RiSettings4Line,
} from 'react-icons/ri';

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
    subItems: [
      {
        name: 'Category',
        path: '/dashboard/admin/equipments/addcategory',
      },
      {
        name: 'Equipments',
        path: '/dashboard/admin/equipments/addequipment',
      },
      {
        name: 'Managing the Rentals',
        path: '/dashboard/admin/equipments/rentalmanagment',
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [openEquipmentSubMenu, setOpenEquipmentSubMenu] = useState(false);

  const isEquipmentSection = pathname.startsWith('/dashboard/admin/equipment');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? '64px' : '240px' }}
        className="bg-white shadow-lg z-20 h-screen flex flex-col transition-all duration-300 ease-in-out"
      >
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
            const isEquipmentRental = item.name === 'Equipment_Rental';
            if (isEquipmentRental && item.subItems) {
              return (
                <div key={item.name}>
                  <Link
                    href={item.path}
                    onClick={() => setOpenEquipmentSubMenu((prev) => !prev)}
                    className={`flex items-center px-4 py-3 mb-1 w-full text-left transition-colors duration-200 ${
                      isEquipmentSection
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
                  </Link>
                  {/* Submenu: always open if in equipment section and not collapsed */}
                  {isEquipmentSection && !isCollapsed && (
                    <div className="ml-8">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.path}
                          className={`block px-4 py-2 rounded transition-colors duration-200 ${
                            pathname === sub.path
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {sub.name}
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
