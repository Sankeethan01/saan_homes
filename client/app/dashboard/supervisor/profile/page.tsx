'use client';

import { useAuthStore } from '@/app/stores/useAuthStore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import {
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiLockPasswordLine,
  RiMapPinLine,
  RiCalendarLine,
  RiCameraLine,
  RiSaveLine,
  RiBuildingLine,
  RiIdCardLine,
  RiTimeLine,
} from 'react-icons/ri';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  profileImage: string;
}

interface ProfessionalInfo {
  department: string;
  position: string;
  employeeId: string;
  joinDate: string;
}

interface ProfileData {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
}

export default function UpdateProfilePage() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'password'>('personal');
  const tabList = [
    { id: 'personal', label: 'Personal Info', icon: RiUser3Line },
    { id: 'professional', label: 'Professional Info', icon: RiBuildingLine },
    { id: 'password', label: 'Security', icon: RiLockPasswordLine }
  ];
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('You must be logged in');
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/userAccounts/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setProfileData({
          personalInfo: {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth || '',
            address: data.address || '',
            profileImage: data.profileImage || '/default-profile.png',
          },
          professionalInfo: {
            department: data.department || '',
            position: data.position || '',
            employeeId: data.employeeId || '',
            joinDate: data.joinDate || '',
          },
        });
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    </div>
  );
  
  if (!profileData) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="text-center">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <p className="text-gray-600">No profile data available.</p>
      </div>
    </div>
  );

  // PERSONAL INFO UPDATE
  const handlePersonalUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token) return alert('You must be logged in');

  const formData = new FormData();
  formData.append('first_name', profileData.personalInfo.firstName);
  formData.append('last_name', profileData.personalInfo.lastName);
  formData.append('email', profileData.personalInfo.email);
  formData.append('phone', profileData.personalInfo.phone);
  formData.append('date_of_birth', profileData.personalInfo.dateOfBirth);
  formData.append('address', profileData.personalInfo.address);
  if (selectedFile) {
    formData.append('profile_image', selectedFile);
  }

  try {
    await axios.put('http://localhost:8000/api/userAccounts/profile/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    // ✅ FETCH updated profile after upload
    const res = await axios.get('http://localhost:8000/api/userAccounts/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;
    setProfileData({
      personalInfo: {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || '',
        profileImage: data.profileImage || '/default-profile.png', // use full URL here if needed
      },
      professionalInfo: {
        department: data.department || '',
        position: data.position || '',
        employeeId: data.employeeId || '',
        joinDate: data.joinDate || '',
      },
    });

    alert('Profile updated successfully!');
    setSelectedFile(null); // Clear selected file

  } catch (err) {
    console.error(err);
    alert('Failed to update profile');
  }
};


  // PASSWORD CHANGE
  const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!token) return alert('You must be logged in');
  if (newPassword !== confirmPassword) return alert('New passwords do not match!');

  try {
    await axios.put(
      'http://localhost:8000/api/userAccounts/profile/change-password/',
      {
        currentPassword: currentPassword,
        newPassword: newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // Optionally log out
    // useAuthStore.getState().logout();
    // router.push('/login');
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{detail?: string}>;
    if (axios.isAxiosError(axiosError) && axiosError.response) {
      // ✅ Show error from backend
      const detail = axiosError.response.data.detail || 'Failed to update password';
      alert(`Error: ${detail}`);
    } else {
      alert('Something went wrong!');
    }
  }
};


  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm py-6 px-2">
          <button onClick={() => router.push('/dashboard/supervisor')} className="text-[#1b4965] hover:underline">Dashboard</button>
          <span className="mx-2 text-[#1b4965]">/</span>
          <span className="text-[#1b4965] font-semibold">Profile</span>
        </nav>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#1b4965]">
            <span className="inline-block animate-fade-in">Profile Settings</span>
          </h1>
          <p className="text-gray-600 animate-fade-in [animation-delay:200ms]">Manage your personal and professional information</p>
        </div>
        {/* Icon Circle Vertical Tab Navigation + Grid Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Icon Circle Vertical Tabs */}
          <div className="relative flex flex-row md:flex-col items-center md:items-stretch gap-0 md:w-32 min-h-[340px] justify-center md:justify-start">
            {/* Vertical connecting line */}
            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 bg-[#1b4965]/20 z-0" style={{ minHeight: 120, maxHeight: 340 }} />
            {tabList.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;
              return (
                <div key={tab.id} className="relative flex flex-col items-center z-10">
                  <button
                    title={`Switch to ${tab.label}`}
                    aria-label={`Switch to ${tab.label}`}
                    onClick={() => setActiveTab(tab.id as 'personal' | 'professional' | 'password')}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 mb-2 md:mb-6 shadow-md bg-white group ${
                      isActive
                        ? 'border-[#1b4965] bg-white scale-110'
                        : isHovered
                        ? 'border-[#1b4965] bg-blue-50 scale-105'
                        : 'border-[#1b4965] text-gray-400 hover:border-[#1b4965] hover:text-[#1b4965]'
                    }`}
                    style={{ zIndex: 2 }}
                  >
                    <Icon className="text-2xl" style={{ color: isActive ? '#1b4965' : undefined }} />
                  </button>
                  {/* Connecting line segment (except last) */}
                  {idx < tabList.length - 1 && (
                    <div className={`hidden md:block w-1 h-8 mx-auto ${isActive || hoveredTab === tabList[idx + 1].id ? 'bg-[#1b4965]' : 'bg-[#1b4965]/20'} transition-all duration-200`} />
                  )}
                  {/* Tooltip label on hover or active */}
                  {(isHovered || isActive) && (
                    <div className="absolute left-16 md:left-16 top-1/2 -translate-y-1/2 bg-white border border-[#1b4965] text-[#1b4965] px-4 py-2 rounded-xl shadow-lg font-semibold whitespace-nowrap transition-all duration-200 z-20 animate-fade-in">
                      {tab.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Grid Cards */}
          <div className="flex-1 space-y-8">
            {/* PERSONAL FORM */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalUpdate} className="bg-white rounded-2xl shadow-xl p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1b4965' }}>
                  <RiUser3Line className="text-[#1b4965]" />
                  <span>Personal Information</span>
                </h2>
                {/* Profile Image Section */}
                <div className="flex items-center space-x-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="relative">
                    <Image
                      src={`http://localhost:8000${profileData.personalInfo.profileImage}`}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                      priority
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#1b4965] rounded-full p-2 shadow-lg">
                      <RiCameraLine className="text-white text-lg" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Profile Picture
                    </label>
                    <input
                      type="file"
                      title="Profile Picture"
                      aria-label="Update Profile Picture"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSelectedFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfileData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  personalInfo: {
                                    ...prev.personalInfo,
                                    profileImage: reader.result as string,
                                  },
                                }
                              : prev
                          );
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#1b4965] hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { field: 'firstName', label: 'First Name', icon: RiUser3Line, type: 'text' },
                    { field: 'lastName', label: 'Last Name', icon: RiUser3Line, type: 'text' },
                    { field: 'email', label: 'Email Address', icon: RiMailLine, type: 'email' },
                    { field: 'phone', label: 'Phone Number', icon: RiPhoneLine, type: 'tel' },
                    { field: 'dateOfBirth', label: 'Date of Birth', icon: RiCalendarLine, type: 'date' },
                    { field: 'address', label: 'Address', icon: RiMapPinLine, type: 'text' }
                  ].map(({ field, label, icon: Icon, type }) => (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Icon className="text-[#1b4965]" />
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={type}
                          title={label}
                          aria-label={label}
                          placeholder={label}
                          value={profileData.personalInfo[field as keyof PersonalInfo] ?? ''}
                          onChange={(e) =>
                            setProfileData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    personalInfo: {
                                      ...prev.personalInfo,
                                      [field]: e.target.value,
                                    },
                                  }
                                : prev
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                          required={field !== 'phone' && field !== 'address'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                    style={{ backgroundColor: '#1b4965', color: 'white' }}
                  >
                    <RiSaveLine className="text-lg" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            {/* PROFESSIONAL INFO */}
            {activeTab === 'professional' && (
              <div className="bg-white rounded-2xl shadow-xl p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1b4965' }}>
                  <RiBuildingLine className="text-[#1b4965]" />
                  <span>Professional Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { field: 'department', label: 'Department', icon: RiBuildingLine, value: profileData.professionalInfo.department },
                    { field: 'position', label: 'Position', icon: RiUser3Line, value: profileData.professionalInfo.position },
                    { field: 'employeeId', label: 'Employee ID', icon: RiIdCardLine, value: profileData.professionalInfo.employeeId },
                    { field: 'joinDate', label: 'Join Date', icon: RiTimeLine, value: profileData.professionalInfo.joinDate ? new Date(profileData.professionalInfo.joinDate).toLocaleDateString() : 'N/A' }
                  ].map(({ field, label, icon: Icon, value }) => (
                    <div key={field} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Icon className="text-[#1b4965] text-lg" />
                        </div>
                        <h3 className="font-semibold text-gray-800">{label}</h3>
                      </div>
                      <p className="text-gray-600 text-base">{value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 text-sm flex items-center gap-2">
                    <span className="text-yellow-600">ℹ️</span>
                    Professional information is managed by the system and cannot be modified directly.
                  </p>
                </div>
              </div>
            )}
            {/* CHANGE PASSWORD */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center justify-center min-h-[400px]">
                <div className="w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-center justify-center" style={{ color: '#1b4965' }}>
                    <RiLockPasswordLine className="text-[#1b4965]" />
                    <span>Security Settings</span>
                  </h2>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    {[
                      { field: 'currentPassword', label: 'Current Password', icon: RiLockPasswordLine },
                      { field: 'newPassword', label: 'New Password', icon: RiLockPasswordLine },
                      { field: 'confirmPassword', label: 'Confirm New Password', icon: RiLockPasswordLine }
                    ].map(({ field, label, icon: Icon }) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Icon className="text-[#1b4965]" />
                          {label}
                        </label>
                        <input
                          type="password"
                          title={label}
                          aria-label={label}
                          placeholder={label}
                          value={field === 'currentPassword' ? currentPassword : field === 'newPassword' ? newPassword : confirmPassword}
                          onChange={(e) => {
                            if (field === 'currentPassword') setCurrentPassword(e.target.value);
                            else if (field === 'newPassword') setNewPassword(e.target.value);
                            else setConfirmPassword(e.target.value);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                          required
                        />
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                      style={{ backgroundColor: '#1b4965', color: 'white' }}
                    >
                      <RiLockPasswordLine className="text-lg" />
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
