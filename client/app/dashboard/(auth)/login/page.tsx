'use client';

import { useAuthStore } from '@/app/stores/useAuthStore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

type UserRole = 'admin' | 'supervisor';

export default function Login() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const setToken = useAuthStore((s) => s.setToken);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        toast.error(loginData.detail || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const access = loginData.access;
      setToken(access);

      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      if (!profileRes.ok) {
        toast.error("Could not verify user profile");
        setToken(null);
        setIsLoading(false);
        return;
      }
      const profile = await profileRes.json();
      const uiSelectedRole = selectedRole.toUpperCase();

      if (profile.role === "ADMIN" && uiSelectedRole === "ADMIN") {
        toast.success("Admin login successful!");
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = `path=/; sameSite=strict; max-age=3600${isProduction ? '; secure' : ''}`;
        document.cookie = `access_token=${access}; ${cookieOptions}`;
        document.cookie = `user_role=${profile.role}; ${cookieOptions}`;
        router.push("/dashboard/admin");
      } else if (profile.role === "SUPERVISOR" && uiSelectedRole === "SUPERVISOR") {
        toast.success("Supervisor login successful!");
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = `path=/; sameSite=strict; max-age=3600${isProduction ? '; secure' : ''}`;
        document.cookie = `access_token=${access}; ${cookieOptions}`;
        document.cookie = `user_role=${profile.role}; ${cookieOptions}`;
        router.push("/dashboard/supervisor");
      } else {
        toast.error(`These credentials do not correspond to the '${selectedRole}' role.`);
        setToken(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-lg shadow-lg"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700">
            SAAN HOMES
          </h1>
          <p className="text-gray-600 mt-2">Construction Management System</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 p-1 bg-gray-100 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('supervisor')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedRole === 'supervisor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Site Supervisor
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={`Enter ${selectedRole === 'admin' ? 'admin' : 'supervisor'} username`}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-4"
          >
            <button
            disabled={isLoading}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login as {selectedRole === 'admin' ? 'Admin' : 'Site Supervisor'}
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm"
        >
          <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
            Forgot your password?
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
