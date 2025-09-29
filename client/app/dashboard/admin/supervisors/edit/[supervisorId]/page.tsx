'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiEyeLine,
  RiEyeOffLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
} from 'react-icons/ri';
import { FiMail, FiUser, FiLock, FiCalendar, FiMapPin, FiPhone, FiImage } from 'react-icons/fi';
import { useAuthStore } from '@/app/stores/useAuthStore';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Supervisor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
  role: string;
  phone: string;
  date_of_birth: string;
  address: string;
}

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  address: string;
  profile_image: File | null;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  profile_image?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export default function EditSupervisorPage() {
  const router = useRouter();
  const params = useParams();
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    profile_image: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const fetchSupervisor = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/${params.supervisorId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch supervisor');
      }

      const data = await response.json();
      setSupervisor(data);
      setFormData({
        username: data.username || '',
        password: '',
        confirmPassword: '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        address: data.address || '',
        profile_image: null,
      });

      if (data.profile_image) {
        setImagePreview(data.profile_image);
      }
    } catch (err) {
      console.error('Error fetching supervisor:', err);
      toast.error('Failed to load supervisor data');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [params.supervisorId, token, router]);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    fetchSupervisor();
  }, [params.supervisorId, token, router, fetchSupervisor]);



  // Password strength validation
  const validatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters long');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one lowercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one special character');
    }

    return {
      score,
      feedback,
      isValid: score >= 4,
    };
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation (only if changing password)
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordStrength = validatePasswordStrength(formData.password);
        if (!passwordStrength.isValid) {
          newErrors.password = 'Password does not meet strength requirements';
        }
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters long';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters long';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Date of birth validation (optional but if provided, should be valid)
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        newErrors.date_of_birth = 'Supervisor must be between 18 and 100 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setErrors(prev => ({ ...prev, profile_image: 'Only JPG, JPEG, and PNG files are allowed' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profile_image: 'Image size must be less than 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, profile_image: file }));
      setErrors(prev => ({ ...prev, profile_image: undefined }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Updating supervisor...');

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('first_name', formData.first_name.trim());
      formDataToSend.append('last_name', formData.last_name.trim());
      
      // Only include password if changing
      if (changePassword && formData.password) {
        formDataToSend.append('password', formData.password);
        formDataToSend.append('password2', formData.confirmPassword);
      }
      
      if (formData.phone.trim()) {
        formDataToSend.append('phone', formData.phone.trim());
      }
      
      if (formData.date_of_birth) {
        formDataToSend.append('date_of_birth', formData.date_of_birth);
      }
      
      if (formData.address.trim()) {
        formDataToSend.append('address', formData.address.trim());
      }
      
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/${params.supervisorId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update supervisor');
      }

      toast.success('Supervisor updated successfully!');
      router.push('/dashboard/admin/supervisors');
    } catch (err) {
      console.error('Error updating supervisor:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update supervisor');
    } finally {
      setSaving(false);
      toast.dismiss(loadingToast);
    }
  };

  const passwordStrength = validatePasswordStrength(formData.password);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="space-y-6 px-4 py-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiAlertLine className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Supervisor not found</h3>
          <p className="text-slate-500 mb-6">The supervisor you&rsquo;re looking for doesn&rsquo;t exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Go back"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
            Edit Supervisor
          </h1>
          <p className="text-slate-600 mt-1">Update supervisor information and permissions</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <RiEditLine className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Supervisor Information</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">Update the supervisor&rsquo;s account details</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                    <FiImage className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={saving}
                />
                <p className="text-xs text-slate-500 mt-1">JPG, JPEG, or PNG. Max file size 5MB. Leave empty to keep current image.</p>
                {errors.profile_image && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <RiAlertLine className="w-4 h-4" />
                    {errors.profile_image}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Enter username"
                  disabled={saving}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <RiAlertLine className="w-4 h-4" />
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Enter email address"
                  disabled={saving}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <RiAlertLine className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                id="changePassword"
                type="checkbox"
                checked={changePassword}
                onChange={(e) => {
                  setChangePassword(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                    setErrors(prev => ({ ...prev, password: undefined, confirmPassword: undefined }));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                disabled={saving}
              />
              <label htmlFor="changePassword" className="text-sm font-medium text-slate-700">
                Change Password
              </label>
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="Enter new password"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.score <= 2 ? 'text-red-600' :
                          passwordStrength.score === 3 ? 'text-yellow-600' :
                          passwordStrength.score === 4 ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-slate-600">
                          <p className="mb-1">Password must include:</p>
                          <ul className="space-y-1">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <RiCloseLine className="w-3 h-3 text-red-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <RiAlertLine className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-300' : 'border-slate-200'
                      }`}
                      placeholder="Confirm new password"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <RiCheckLine className="w-4 h-4" />
                      Passwords match
                    </p>
                  )}
                  
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <RiAlertLine className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.first_name ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Enter first name"
                disabled={saving}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <RiAlertLine className="w-4 h-4" />
                  {errors.first_name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.last_name ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Enter last name"
                disabled={saving}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <RiAlertLine className="w-4 h-4" />
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Enter phone number"
                  disabled={saving}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <RiAlertLine className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date_of_birth ? 'border-red-300' : 'border-slate-200'
                  }`}
                  disabled={saving}
                />
              </div>
              {errors.date_of_birth && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <RiAlertLine className="w-4 h-4" />
                  {errors.date_of_birth}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.address ? 'border-red-300' : 'border-slate-200'
                }`}
                placeholder="Enter full address"
                disabled={saving}
              />
            </div>
            {errors.address && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <RiAlertLine className="w-4 h-4" />
                {errors.address}
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={saving}
            >
              <RiSaveLine className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Supervisor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 