'use client'

import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
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
  }, [router, token]);

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
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-semibold">{user.first_name} {user.last_name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input id="fullName" type="text" value={`${user.first_name} ${user.last_name}`} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <input id="phone" type="tel" value="+1 (123) 456-7890" className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email" type="email" value={user.email} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input id="address" type="text" value="123 Construction Ave, City, State 12345" className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                    </div>
                </div>
                <div className="mt-6">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
