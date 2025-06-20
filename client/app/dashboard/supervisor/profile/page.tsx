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
  const [isEditing, setIsEditing] = useState(false);

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
    // Here you would typically make an API call to update the profile
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Here you would typically make an API call to update the password
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // Show success message
    alert('Password updated successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Update Profile</h1>
          <p className="text-gray-600">Manage your personal and professional information</p>
        </div>
      </div>

      {/* Profile Image Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={profileData.personalInfo.profileImage}
                alt="Profile"
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <RiCameraLine />
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
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'personal'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('professional')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'professional'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Professional Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'password'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Form */}
          {activeTab === 'personal' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handlePersonalInfoUpdate}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1 relative">
                    <RiUser3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.personalInfo.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, firstName: e.target.value },
                        })
                      }
                      className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <div className="mt-1 relative">
                    <RiUser3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.personalInfo.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, lastName: e.target.value },
                        })
                      }
                      className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 relative">
                    <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.personalInfo.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, email: e.target.value },
                        })
                      }
                      className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1 relative">
                    <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.personalInfo.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, phone: e.target.value },
                        })
                      }
                      className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="mt-1 relative">
                    <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={profileData.personalInfo.dateOfBirth}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, dateOfBirth: e.target.value },
                        })
                      }
                      className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="mt-1 relative">
                    <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.personalInfo.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          personalInfo: { ...profileData.personalInfo, address: e.target.value },
                        })
                      }
                      className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RiSaveLine />
                  Save Changes
                </button>
              </div>
            </motion.form>
          )}

          {/* Professional Information Form */}
          {activeTab === 'professional' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={profileData.professionalInfo.department}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={profileData.professionalInfo.position}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={profileData.professionalInfo.employeeId}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Join Date</label>
                  <input
                    type="text"
                    value={new Date(profileData.professionalInfo.joinDate).toLocaleDateString()}
                    disabled
                    className="mt-1 w-full border border-gray-200 rounded-lg py-2 px-3 bg-gray-50"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">
                Professional information can only be updated by HR department
              </p>
            </motion.div>
          )}

          {/* Change Password Form */}
          {activeTab === 'password' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handlePasswordUpdate}
              className="max-w-md space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <div className="mt-1 relative">
                  <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative">
                  <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="mt-1 relative">
                  <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RiSaveLine />
                  Update Password
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
