'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiMapPinLine,
  RiCalendarLine,
  RiCameraLine,
  RiSaveLine,
} from 'react-icons/ri';

interface ProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    profileImage: string;
  };
  professionalInfo: {
    department: string;
    position: string;
    employeeId: string;
    joinDate: string;
  };
}

const initialProfileData: ProfileData = {
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    address: '123 Construction St, Builder City',
    profileImage: '/profile-placeholder.jpg',
  },
  professionalInfo: {
    department: 'Construction',
    position: 'Senior Supervisor',
    employeeId: 'SUP-2024-001',
    joinDate: '2020-03-15',
  },
};

export default function UpdateProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profileImage: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalInfoUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Password updated successfully!');
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Update Profile</h1>
          <p className="text-gray-600">Manage your personal and professional information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center space-y-4">
        <div className="relative group w-32 h-32 rounded-full overflow-hidden shadow-md">
          <Image
            src={profileData.personalInfo.profileImage}
            alt="Profile"
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
          <label
            htmlFor="profile-image"
            className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <RiCameraLine className="text-white text-2xl" />
            <input
              type="file"
              id="profile-image"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
          </h2>
          <p className="text-gray-600">{profileData.professionalInfo.position}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b px-4">
          <nav className="flex space-x-4 pt-4">
            {[
              { key: 'personal', label: 'Personal', icon: <RiUser3Line /> },
              { key: 'professional', label: 'Professional', icon: <RiMailLine /> },
              { key: 'password', label: 'Password', icon: <RiLockPasswordLine /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Form */}
          {activeTab === 'personal' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handlePersonalInfoUpdate}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'firstName', label: 'First Name', icon: <RiUser3Line />, type: 'text' },
                  { id: 'lastName', label: 'Last Name', icon: <RiUser3Line />, type: 'text' },
                  { id: 'email', label: 'Email', icon: <RiMailLine />, type: 'email' },
                  { id: 'phone', label: 'Phone', icon: <RiPhoneLine />, type: 'tel' },
                  { id: 'dateOfBirth', label: 'Date of Birth', icon: <RiCalendarLine />, type: 'date' },
                  { id: 'address', label: 'Address', icon: <RiMapPinLine />, type: 'text' },
                ].map(field => (
                  <div key={field.id} className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                      {field.icon}
                    </span>
                    <input
                      type={field.type}
                      id={field.id}
                      value={profileData.personalInfo[field.id as keyof typeof profileData.personalInfo]}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: {
                            ...profileData.personalInfo,
                            [field.id]: e.target.value,
                          },
                        })
                      }
                      placeholder=" "
                      className="pl-10 pt-5 pb-2 peer w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={field.id}
                      className="absolute left-10 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RiSaveLine />
                  Save Changes
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Professional Info Display */}
          {activeTab === 'professional' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={profileData.professionalInfo.department}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={profileData.professionalInfo.position}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={profileData.professionalInfo.employeeId}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Join Date</label>
                  <input
                    type="text"
                    value={new Date(profileData.professionalInfo.joinDate).toLocaleDateString()}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-100"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">
                Professional information can only be updated by HR department
              </p>
            </motion.div>
          )}

          {/* Password Change Form */}
          {activeTab === 'password' && (
  <motion.form
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    onSubmit={handlePasswordUpdate}
    className="max-w-lg mx-auto space-y-8"
  >
    <h2 className="text-xl font-semibold text-gray-800">Update Password</h2>

    <div className="space-y-4">
      <div className="relative">
        <RiLockPasswordLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full pl-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <RiLockPasswordLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full pl-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <RiLockPasswordLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full pl-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="flex justify-end">
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
      >
        <RiSaveLine />
        Update Password
      </motion.button>
    </div>
  </motion.form>
)}

        </div>
      </div>
    </div>
  );
}
