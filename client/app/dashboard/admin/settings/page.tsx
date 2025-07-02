'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiUserLine,
  RiLockLine,
  RiBellLine,
  RiPaletteLine,
  RiMailLine,
  RiPhoneLine,
  RiGlobalLine,
  RiMoonLine,
  RiSunLine,
  RiSaveLine,
  RiImageAddLine,
  RiCalendarLine,
  RiShieldLine,
  RiNotificationLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiCameraLine,
} from 'react-icons/ri';
import { FiUser, FiShield, FiBell, FiMonitor, FiSettings } from 'react-icons/fi';

interface AdminProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  language: string;
  profileImage: string | null;
  role: string;
  department: string;
}

interface SecuritySettings {
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  passwordExpiry: boolean;
}

interface NotificationPreferences {
  projectUpdates: boolean;
  newMessages: boolean;
  rentalRequests: boolean;
  supervisorReports: boolean;
  systemAlerts: boolean;
  emailDigest: boolean;
}

interface ThemeSettings {
  darkMode: boolean;
  colorScheme: 'blue' | 'green' | 'purple' | 'red';
  compactMode: boolean;
  sidebarCollapsed: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'John Admin',
    username: 'admin_john',
    email: 'john.admin@saanhomes.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-06-15',
    language: 'English',
    profileImage: null,
    role: 'Super Admin',
    department: 'Management',
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    emailNotifications: true,
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordExpiry: true,
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    projectUpdates: true,
    newMessages: true,
    rentalRequests: true,
    supervisorReports: true,
    systemAlerts: false,
    emailDigest: true,
  });

  const [theme, setTheme] = useState<ThemeSettings>({
    darkMode: false,
    colorScheme: 'blue',
    compactMode: false,
    sidebarCollapsed: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSaveProfile = async () => {
    setActionLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProfile(editedProfile);
    setIsEditing(false);
    setActionLoading(false);
  };

  const handleUpdateSecurity = (key: keyof SecuritySettings, value?: any) => {
    setSecurity({ ...security, [key]: value !== undefined ? value : !security[key] });
  };

  const handleUpdateNotifications = (key: keyof NotificationPreferences) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleUpdateTheme = (key: keyof ThemeSettings, value: any) => {
    setTheme({ ...theme, [key]: value });
  };

  const getStats = () => {
    const enabledNotifications = Object.values(notifications).filter(Boolean).length;
    const enabledSecurity = Object.values(security).filter(Boolean).length;
    const profileCompletion = Object.values(profile).filter(v => v && v !== '').length / Object.keys(profile).length * 100;
    
    return {
      profileCompletion: Math.round(profileCompletion),
      securityFeatures: enabledSecurity,
      notificationTypes: enabledNotifications,
      lastUpdated: 'Today',
    };
  };

  const stats = getStats();

  const colorSchemes = [
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Red', value: 'red', color: 'bg-red-500' },
  ];

  const languages = [
    { name: 'English', value: 'en' },
    { name: 'Spanish', value: 'es' },
    { name: 'French', value: 'fr' },
    { name: 'German', value: 'de' },
  ];

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="text-slate-600 mt-1">Manage your account preferences and system configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
            <FiSettings className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Last Updated:</span>
            <span className="text-sm font-bold text-blue-600">{stats.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1b4965] text-white rounded-lg transition-colors"
                >
                  <RiEditLine className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile.profileImage ? (
                      <Image
                        src={profile.profileImage}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="rounded-full object-cover border-4 border-slate-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-[#1b4965] flex items-center justify-center border-4 border-slate-200">
                        <span className="text-2xl font-bold text-white">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    {isEditing && (
                      <button className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                        <RiCameraLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{profile.name}</h3>
                    <p className="text-slate-500">{profile.role} • {profile.department}</p>
                    <p className="text-sm text-slate-400">{profile.email}</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.name : profile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={isEditing ? editedProfile.username : profile.username}
                      onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={isEditing ? editedProfile.email : profile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={isEditing ? editedProfile.phone : profile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
                      onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                    <select
                      value={isEditing ? editedProfile.language : profile.language}
                      onChange={(e) => setEditedProfile({ ...editedProfile, language: e.target.value })}
                      disabled={!isEditing}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.name}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:to-[#1b4965] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RiSaveLine className="w-4 h-4" />
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
