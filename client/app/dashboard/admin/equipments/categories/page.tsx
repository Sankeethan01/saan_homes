'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiFileListLine,
  RiSearchLine,
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
  const [searchTerm, setSearchTerm] = useState('');
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
      } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      alert('Error updating category.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-md hover:from-blue-600 hover:to-[#1b4965] transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">Equipment Categories</h1>
          <p className="text-slate-600 mt-1">Manage equipment categories for your inventory</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1b4965] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-[#1b4965] transition-colors shadow-sm"
        >
          <RiAddLine />
          Add Category
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Categories</p>
            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <RiFileListLine className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">ID</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Category Name</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900">Slug</th>
                <th className="text-right py-4 px-6 font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCategories.map((category, idx) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-6 text-slate-900">{category.id}</td>
                  <td className="py-4 px-6">
                    {editingIndex === idx ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Edit category name"
                      />
                    ) : (
                      <span className="font-medium text-slate-900">{category.name}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{category.slug}</td>
                  <td className="py-4 px-6">
                    {editingIndex === idx ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleUpdateCategory}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          disabled={actionLoading}
                          title="Save changes"
                          aria-label="Save changes"
                        >
                          <RiCheckLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingIndex(null); setEditingValue(''); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={actionLoading}
                          title="Cancel editing"
                          aria-label="Cancel editing"
                        >
                          <RiCloseLine className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditCategory(idx)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={actionLoading}
                          title="Edit category"
                          aria-label="Edit category"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={actionLoading}
                          title="Delete category"
                          aria-label="Delete category"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-[#1b4965] bg-clip-text text-transparent">Add New Category</h2>
                <button
                  onClick={() => { setIsAddModalOpen(false); setNewCategory(''); }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  title="Close modal"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input
                  id="categoryName"
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                  disabled={actionLoading}
                  aria-label="New category name"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => { setIsAddModalOpen(false); setNewCategory(''); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] shadow-sm"
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