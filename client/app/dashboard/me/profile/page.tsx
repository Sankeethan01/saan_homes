'use client'

import { useAuthStore } from "@/app/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  profileImage: string;
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

  useEffect(() => {
    if (!token) return router.replace("/login");
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return router.replace("/login");
        const data = await res.json();
        setUser(data);
        setForm(data);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      // Append each form field to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/profile/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Remove Content-Type header - browser will set it automatically with boundary
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to update profile");
        setSaving(false);
        return;
      }
      //const updated = await res.json();
      setUser({ ...user!, ...form });
      setEditMode(false);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1b4965] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[#1b4965] mb-6">My Profile</h2>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        {editMode ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input name="first_name" type="text" value={form.first_name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-lg border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input name="last_name" type="text" value={form.last_name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-lg border" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input name="email" type="email" value={form.email || ""}  className="mt-1 w-full px-4 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input name="phone" type="tel" value={form.phone || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-lg border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input name="address" type="text" value={form.address || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 rounded-lg border" />
            </div>
            <div className="mt-6 flex gap-4">
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300">
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" value={user.firstName} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" value={user.lastName} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={user.email} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" value={user.phone} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" value={user.address} className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
              </div>
            </div>
            <div className="mt-6">
              <button
                className="w-full bg-[#1b4965] text-white py-3 rounded-lg font-medium hover:transition-transform duration-300 group-hover:translate-x-1"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
