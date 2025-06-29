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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Profile Complete</p>
              <p className="text-2xl font-bold text-slate-900">{stats.profileCompletion}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Security Features</p>
              <p className="text-2xl font-bold text-slate-900">{stats.securityFeatures}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiShield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Notifications</p>
              <p className="text-2xl font-bold text-slate-900">{stats.notificationTypes}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiBell className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Theme Mode</p>
              <p className="text-2xl font-bold text-slate-900">{theme.darkMode ? 'Dark' : 'Light'}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiMonitor className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiUserLine className="w-4 h-4 mr-2" />
            Profile
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiLockLine className="w-4 h-4 mr-2" />
            Security
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiBellLine className="w-4 h-4 mr-2" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'appearance'
                ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RiPaletteLine className="w-4 h-4 mr-2" />
            Appearance
          </button>
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
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
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
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RiSaveLine className="w-4 h-4" />
                      {actionLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <RiShieldLine className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSecurity('twoFactorAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.twoFactorAuth ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Login Alerts */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <RiBellLine className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Login Alerts</h3>
                      <p className="text-sm text-slate-500">Get notified of new login attempts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSecurity('loginAlerts')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.loginAlerts ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Session Timeout */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <RiGlobalLine className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Session Timeout</h3>
                      <p className="text-sm text-slate-500">Automatically log out after inactivity</p>
                    </div>
                  </div>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => handleUpdateSecurity('sessionTimeout', parseInt(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Password Expiry */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <RiLockLine className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Password Expiry</h3>
                      <p className="text-sm text-slate-500">Require password change every 90 days</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateSecurity('passwordExpiry')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.passwordExpiry ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        security.passwordExpiry ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-slate-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {key === 'projectUpdates' && 'Receive notifications when projects are updated'}
                        {key === 'newMessages' && 'Get alerted when new contact messages arrive'}
                        {key === 'rentalRequests' && 'Notifications for new equipment rental requests'}
                        {key === 'supervisorReports' && 'Updates from site supervisors'}
                        {key === 'systemAlerts' && 'Important system maintenance and security alerts'}
                        {key === 'emailDigest' && 'Daily summary of all activities via email'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateNotifications(key as keyof NotificationPreferences)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Appearance Settings</h2>
              
              <div className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {theme.darkMode ? <RiMoonLine className="w-5 h-5 text-slate-600" /> : <RiSunLine className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Dark Mode</h3>
                      <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpdateTheme('darkMode', !theme.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme.darkMode ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Color Scheme */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Color Scheme</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.value}
                        onClick={() => handleUpdateTheme('colorScheme', scheme.value)}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          theme.colorScheme === scheme.value ? 'border-blue-500' : 'border-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 ${scheme.color} rounded-full mx-auto mb-2`} />
                        <span className="text-sm font-medium">{scheme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900">Compact Mode</h3>
                    <p className="text-sm text-slate-500">Reduce spacing for more content on screen</p>
                  </div>
                  <button
                    onClick={() => handleUpdateTheme('compactMode', !theme.compactMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme.compactMode ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme.compactMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sidebar Collapsed */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900">Sidebar Collapsed</h3>
                    <p className="text-sm text-slate-500">Keep sidebar collapsed by default</p>
                  </div>
                  <button
                    onClick={() => handleUpdateTheme('sidebarCollapsed', !theme.sidebarCollapsed)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme.sidebarCollapsed ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme.sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
