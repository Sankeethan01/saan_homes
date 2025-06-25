'use client';

import { useAuthStore } from '@/app/stores/useAuthStore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
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

  if (loading) return <div className="p-6 text-center">Loading profile...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!profileData) return <div className="p-6 text-center">No profile data available.</div>;

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
      await axios.patch('http://localhost:8000/api/userAccounts/profile/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Profile updated successfully!');
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
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      // ✅ Show error from backend
      const detail = error.response.data.detail || 'Failed to update password.';
      alert(`Error: ${detail}`);
    } else {
      alert('Something went wrong!');
    }
  }
};


  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Update Profile</h1>

      <div className="flex border-b mb-6">
        {['personal', 'professional', 'password'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            {tab === 'personal'
              ? 'Personal Info'
              : tab === 'professional'
              ? 'Professional Info'
              : 'Change Password'}
          </button>
        ))}
      </div>

      {/* PERSONAL FORM */}
      {activeTab === 'personal' && (
        <form onSubmit={handlePersonalUpdate} className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
             src={`http://localhost:8000${profileData.personalInfo.profileImage}`}
             alt="Profile"
             width={100}
             height={100}
             className="rounded-full object-cover"
          />
            <input
              type="file"
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
            />
          </div>

          {(['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address'] as const).map(
            (field) => (
              <div key={field}>
                <label className="block font-medium capitalize">{field}</label>
                <input
                  type={field === 'email' ? 'email' : field === 'dateOfBirth' ? 'date' : 'text'}
                  value={profileData.personalInfo[field] ?? ''}
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
                  className="w-full border p-2 rounded"
                  required={field !== 'phone' && field !== 'address'}
                />
              </div>
            )
          )}
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <RiSaveLine /> Save Personal Info
          </button>
        </form>
      )}

      {/* PROFESSIONAL INFO */}
      {activeTab === 'professional' && (
        <div className="space-y-2">
          <p><strong>Department:</strong> {profileData.professionalInfo.department || 'N/A'}</p>
          <p><strong>Position:</strong> {profileData.professionalInfo.position || 'N/A'}</p>
          <p><strong>Employee ID:</strong> {profileData.professionalInfo.employeeId || 'N/A'}</p>
          <p><strong>Join Date:</strong> {profileData.professionalInfo.joinDate ? new Date(profileData.professionalInfo.joinDate).toLocaleDateString() : 'N/A'}</p>
          <p className="mt-4 text-gray-500 italic">* Professional info is read-only.</p>
        </div>
      )}

      {/* CHANGE PASSWORD */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <RiLockPasswordLine /> Change Password
          </button>
        </form>
      )}
    </div>
  );
}
