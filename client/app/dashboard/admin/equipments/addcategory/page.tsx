'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
} from 'react-icons/ri';

const initialCategories = [
  'Heavy Machinery',
  'Power Tools',
  'Construction Equipment',
  'Landscaping Tools',
  'Safety Equipment',
  'Electrical Tools',
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const handleUpdateCategory = () => {
    if (editingValue.trim() && !categories.includes(editingValue.trim())) {
      setCategories(categories.map((cat, i) => (i === editingIndex ? editingValue.trim() : cat)));
      setEditingIndex(null);
      setEditingValue('');
    }
  };

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
              <tr key={category} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">
                  {editingIndex === idx ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                  ) : (
                    <span>{category}</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right">
                  {editingIndex === idx ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleUpdateCategory}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <RiCheckLine />
                      </button>
                      <button
                        onClick={() => { setEditingIndex(null); setEditingValue(''); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <RiCloseLine />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditCategory(idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <RiEditLine />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => { setIsAddModalOpen(false); setNewCategory(''); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 