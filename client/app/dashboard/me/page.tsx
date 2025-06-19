// app/dashboard/me/page.jsx (or wherever you have it)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAccessToken } from "@/utils/auth";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "SUPERVISOR" | "PUBLIC";
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = getAccessToken();
    if (!token) return router.replace("/login");

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          return router.replace("/login");
        }
        const data: User = await res.json();
        // extra safety: ensure this really is Public
        if (data.role !== "PUBLIC") {
          return router.replace("/login");
        }
        setUser(data);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.first_name || user.username}! 👋
            </h1>
            <p className="text-blue-100">
              Here&apos;s your profile information
            </p>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* User Details Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Username</label>
                    <p className="text-gray-800 font-medium">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-800 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="text-gray-800 font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Account Type</label>
                    <p className="text-gray-800 font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  <button 
                    onClick={() => router.push("/dashboard/me/edit")}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit Profile
                  </button>
                  
                    <Link href="/logout" className="text-red-600"><button 
                    className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >Sign Out</button></Link>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
