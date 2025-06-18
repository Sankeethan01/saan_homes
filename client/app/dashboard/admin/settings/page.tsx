'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
} from 'react-icons/ri';

interface AdminProfile {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  language: string;
}

interface SecuritySettings {
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
}

interface NotificationPreferences {
  projectUpdates: boolean;
  newMessages: boolean;
  rentalRequests: boolean;
  supervisorReports: boolean;
}

interface ThemeSettings {
  darkMode: boolean;
  colorScheme: 'blue' | 'green' | 'purple';
  compactMode: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [profile, setProfile] = useState<AdminProfile>({
    name: '',
    username: '',
    email: '',
    dateOfBirth: '',
    language: '',
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    emailNotifications: true,
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    projectUpdates: true,
    newMessages: true,
    rentalRequests: true,
    supervisorReports: true,
  });

  const [theme, setTheme] = useState<ThemeSettings>({
    darkMode: false,
    colorScheme: 'blue',
    compactMode: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleUpdateSecurity = (key: keyof SecuritySettings) => {
    setSecurity({ ...security, [key]: !security[key] });
  };

  const handleUpdateNotifications = (key: keyof NotificationPreferences) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleUpdateTheme = (key: keyof ThemeSettings, value: any) => {
    setTheme({ ...theme, [key]: value });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile updated:', profile);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-500 mb-8">Update your profile details.</p>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              This is the name that will be displayed on your profile and in emails.
            </p>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="shadcn"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <button
              type="button"
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-500 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select a verified email to display
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <p className="mt-2 text-sm text-gray-500">
              You can manage verified email addresses in your email settings.
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-gray-700 mb-2">
              Date of birth
            </label>
            <div className="relative">
              <input
                type="text"
                id="dob"
                placeholder="Jan 23, 2023"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <RiCalendarLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your date of birth is used to calculate your age.
            </p>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-gray-700 mb-2">
              Language
            </label>
            <button
              type="button"
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-500 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Select language
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <p className="mt-2 text-sm text-gray-500">
              This is the language that will be used in the dashboard.
            </p>
          </div>

          {/* Update Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Update account
          </button>
        </form>
      </div>
    </div>
  );
}
