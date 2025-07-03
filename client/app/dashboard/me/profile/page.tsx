'use client'

import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion } from 'framer-motion';
import Image from "next/image";
import { 
  RiUser3Line, 
  RiMailLine, 
  RiPhoneLine, 
  RiMapPinLine, 
  RiCalendarLine, 
  RiEditLine, 
  RiSaveLine, 
  RiCloseLine, 
  RiImageAddLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiCheckLine
} from "react-icons/ri";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  profile_image: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      router.replace("/dashboard/login");
      return;
    }
    
    fetchUserProfile();
  }, [router, token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/userAccounts/profile/`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.replace("/dashboard/login");
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUser(data);
      setForm(data);
      
      // Set image preview if user has a profile image
      if (data.profile_image) {
        const imageUrl = data.profile_image.startsWith('http') 
          ? data.profile_image 
          : `${API_BASE_URL}${data.profile_image}`;
        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFormErrors({
        ...formErrors,
        profile_image: 'Please select a valid image file (JPEG, PNG)'
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        profile_image: 'Image size should be less than 2MB'
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear any previous errors
    if (formErrors.profile_image) {
      setFormErrors({
        ...formErrors,
        profile_image: ''
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!form.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!form.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (form.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(form.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const formData = new FormData();
      
      // Append form fields to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'profile_image') {
          formData.append(key, String(value));
        }
      });
      
      // Add image file if selected
      if (imageFile) {
        formData.append('profile_image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/userAccounts/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is automatically set by the browser when using FormData
        },
        body: formData,
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.replace("/dashboard/login");
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      
      const updatedData = await response.json();
      setUser(updatedData);
      setSuccess(true);
      
      // Exit edit mode after successful save
      setTimeout(() => {
        setEditMode(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RiLoader4Line className="text-6xl text-[#1b4965] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4965] mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we fetch your profile information...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-8">
        <div className="text-center">
          <RiErrorWarningLine className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-[#1b4965] text-white px-6 py-3 rounded-lg hover:bg-[#0d3b59] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {/* Profile Header */}
        <div className="bg-[#1b4965] p-6 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white overflow-hidden">
                {(imagePreview || user?.profile_image) ? (
                  <Image
                    src={imagePreview || (user?.profile_image || '/assets/images/profile-placeholder.png')}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <RiUser3Line className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              {editMode && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white text-[#1b4965] p-1 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Change profile picture"
                  title="Change profile picture"
                >
                  <RiImageAddLine className="text-lg" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <RiErrorWarningLine className="text-red-500 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <RiCheckLine className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}
          
          <form onSubmit={handleSave} className="space-y-6">
            {editMode && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                aria-label="Upload profile picture"
                title="Upload profile picture"
              />
            )}
            
            {formErrors.profile_image && (
              <p className="text-red-500 text-sm">{formErrors.profile_image}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiUser3Line className="text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={form.first_name || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${formErrors.first_name ? 'border-red-300' : 'border-gray-300'} ${!editMode ? 'bg-gray-50' : 'bg-white'} focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]`}
                  />
                </div>
                {formErrors.first_name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.first_name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiUser3Line className="text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={form.last_name || ""}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${formErrors.last_name ? 'border-red-300' : 'border-gray-300'} ${!editMode ? 'bg-gray-50' : 'bg-white'} focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]`}
                  />
                </div>
                {formErrors.last_name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.last_name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiMailLine className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email || ""}
                  disabled={true} // Email should not be editable
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiPhoneLine className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${formErrors.phone ? 'border-red-300' : 'border-gray-300'} ${!editMode ? 'bg-gray-50' : 'bg-white'} focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]`}
                />
              </div>
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiMapPinLine className="text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 ${!editMode ? 'bg-gray-50' : 'bg-white'} focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]`}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiCalendarLine className="text-gray-400" />
                </div>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth || ""}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 ${!editMode ? 'bg-gray-50' : 'bg-white'} focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]`}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              {editMode ? (
                <div className="flex flex-wrap gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#1b4965] text-white py-3 rounded-lg font-medium hover:bg-[#0d3b59] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <RiLoader4Line className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <RiSaveLine />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setForm(user || {});
                      setImagePreview(user?.profile_image || null);
                      setImageFile(null);
                      setFormErrors({});
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RiCloseLine />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="w-full bg-[#1b4965] text-white py-3 rounded-lg font-medium hover:bg-[#0d3b59] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <RiEditLine />
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
