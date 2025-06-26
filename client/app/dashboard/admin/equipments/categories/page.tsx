'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/categories/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Error loading categories. Please try again later.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token, router, clearToken]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setActionLoading(true);
    try {
      const slug = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory.trim(), slug }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || JSON.stringify(errorData) || 'Failed to add category');
        throw new Error('Failed to add category');
      }
      const data = await response.json();
      setCategories([...categories, data]);
      setNewCategory('');
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Error adding category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (index: number) => {
    const category = categories[index];
    if (!category) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/categories/${category.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter((_, i) => i !== index));
    } catch (err) {
      alert('Error deleting category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index].name);
  };

  const handleUpdateCategory = async () => {
    if (editingIndex === null || !editingValue.trim()) return;
    const category = categories[editingIndex];
    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/categories/${category.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingValue.trim() }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      const data = await response.json();
      setCategories(categories.map((cat, i) => (i === editingIndex ? data : cat)));
      setEditingIndex(null);
      setEditingValue('');
    } catch (err) {
      alert('Error updating category.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Equipment Categories</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <RiAddLine />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-4">Category Name</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, idx) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  ) : (
                    <span>{category.name}</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right">
                  {editingIndex === idx ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleUpdateCategory}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        disabled={actionLoading}
                      >
                        <RiCheckLine />
                      </button>
                      <button
                        onClick={() => { setEditingIndex(null); setEditingValue(''); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={actionLoading}
                      >
                        <RiCloseLine />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditCategory(idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        disabled={actionLoading}
                      >
                        <RiEditLine />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={actionLoading}
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-400">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Add New Category</h2>
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Category name"
                className="w-full p-2 border rounded mb-4"
                disabled={actionLoading}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => { setIsAddModalOpen(false); setNewCategory(''); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 