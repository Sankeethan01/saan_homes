'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
} from 'react-icons/ri';
import Image from 'next/image';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface Equipment {
  id: string;
  name: string;
  image: string;
  description: string;
  daily_rate: number;
  category: number;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    description: '',
    daily_rate: 0,
    category: 0,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);
  
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/categories/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Fetch equipments
        const equipmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!categoriesResponse.ok || !equipmentsResponse.ok) {
          if (categoriesResponse.status === 401 || equipmentsResponse.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error('Failed to fetch data');
        }

        const [categoriesData, equipmentsData] = await Promise.all([
          categoriesResponse.json(),
          equipmentsResponse.json(),
        ]);

        setCategories(categoriesData);
        setEquipments(equipmentsData);
      } catch (err) {
        setError('Error loading data. Please try again later.');
        setEquipments([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router, clearToken]);

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.daily_rate || !newEquipment.category) return;
    setActionLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newEquipment.name);
      formData.append('description', newEquipment.description || '');
      formData.append('daily_rate', newEquipment.daily_rate.toString());
      formData.append('category', newEquipment.category.toString());
      if (newImage) {
        formData.append('image', newImage);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || JSON.stringify(errorData) || 'Failed to add equipment');
        throw new Error('Failed to add equipment');
      }

      const data = await response.json();
      setEquipments([...equipments, data]);
      setIsAddModalOpen(false);
      setNewEquipment({
        name: '',
        description: '',
        daily_rate: 0,
        category: 0,
      });
      setNewImage(null);
    } catch (err) {
      alert('Error adding equipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete equipment');
      setEquipments(equipments.filter(eq => eq.id !== id));
    } catch (err) {
      alert('Error deleting equipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEquipment = async () => {
    if (!editingEquipment.name || !editingEquipment.daily_rate || !editingEquipment.category) return;
    setActionLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', editingEquipment.name);
      formData.append('description', editingEquipment.description || '');
      formData.append('daily_rate', editingEquipment.daily_rate.toString());
      formData.append('category', editingEquipment.category.toString());
      if (editImage) {
        formData.append('image', editImage);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/${editingEquipment.id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update equipment');
      const data = await response.json();
      setEquipments(equipments.map(eq => eq.id === data.id ? data : eq));
      setEditingIndex(null);
      setEditingEquipment({});
      setEditImage(null);
    } catch (err) {
      alert('Error updating equipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditImage(file);
      } else {
        setNewImage(file);
      }
    }
  };

  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsViewModalOpen(true);
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
        <h1 className="text-2xl font-bold text-gray-800">Equipments</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          disabled={actionLoading}
        >
          <RiAddLine />
          Add Equipment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-4">Photo</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Daily Rate</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map((equipment, idx) => (
              <tr key={equipment.id} className="border-b hover:bg-gray-50">
                {editingIndex === idx ? (
                  <>
                    <td className="py-2 px-4">
                      <div className="relative h-16 w-16 mb-2">
                        <Image
                          src={editImage ? URL.createObjectURL(editImage) : equipment.image}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                        className="block"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={editingEquipment.name || ''}
                        onChange={e => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <select
                        value={editingEquipment.category || ''}
                        onChange={e => setEditingEquipment({ ...editingEquipment, category: Number(e.target.value) })}
                        className="p-2 border rounded w-full"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={editingEquipment.daily_rate || 0}
                        onChange={e => setEditingEquipment({ ...editingEquipment, daily_rate: Number(e.target.value) })}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={editingEquipment.description || ''}
                        onChange={e => setEditingEquipment({ ...editingEquipment, description: e.target.value })}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleUpdateEquipment}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          disabled={actionLoading}
                        >
                          <RiCheckLine />
                        </button>
                        <button
                          onClick={() => { setEditingIndex(null); setEditingEquipment({}); setEditImage(null); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          disabled={actionLoading}
                        >
                          <RiCloseLine />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-4">
                      <div className="relative h-16 w-16">
                        <Image
                          src={equipment.image}
                          alt={equipment.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-4">{equipment.name}</td>
                    <td className="py-2 px-4">{equipment.category_name}</td>
                    <td className="py-2 px-4">${equipment.daily_rate}</td>
                    <td className="py-2 px-4">{equipment.description}</td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewEquipment(equipment)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                          disabled={actionLoading}
                        >
                          <RiEyeLine />
                        </button>
                        <button
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditingEquipment(equipment);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          disabled={actionLoading}
                        >
                          <RiEditLine />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(equipment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          disabled={actionLoading}
                        >
                          <RiDeleteBinLine />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {equipments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No equipments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-xl m-4"
            >
              <h2 className="text-xl font-bold mb-4">Add New Equipment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  {newImage && (
                    <div className="relative h-32 w-32 mb-2">
                      <Image
                        src={URL.createObjectURL(newImage)}
                        alt="Preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="block"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newEquipment.name || ''}
                    onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                    className="mt-1 w-full p-2 border rounded"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={newEquipment.category || ''}
                    onChange={e => setNewEquipment({ ...newEquipment, category: Number(e.target.value) })}
                    className="mt-1 w-full p-2 border rounded"
                    disabled={actionLoading}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daily Rate</label>
                  <input
                    type="number"
                    value={newEquipment.daily_rate || 0}
                    onChange={e => setNewEquipment({ ...newEquipment, daily_rate: Number(e.target.value) })}
                    className="mt-1 w-full p-2 border rounded"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newEquipment.description || ''}
                    onChange={e => setNewEquipment({ ...newEquipment, description: e.target.value })}
                    className="mt-1 w-full p-2 border rounded"
                    rows={3}
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewEquipment({
                      name: '',
                      description: '',
                      daily_rate: 0,
                      category: 0,
                    });
                    setNewImage(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEquipment}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Adding...' : 'Add Equipment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Equipment Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedEquipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg w-full max-w-xl m-4"
            >
              <div className="relative h-64">
                <Image
                  src={selectedEquipment.image}
                  alt={selectedEquipment.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <RiCloseLine className="text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">{selectedEquipment.name}</h3>
                <p className="text-gray-600 mb-4">{selectedEquipment.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">{selectedEquipment.category_name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-semibold">${selectedEquipment.daily_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Weekly Rate:</span>
                      <span className="font-semibold">${selectedEquipment.daily_rate * 7 * 0.9}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly Rate:</span>
                      <span className="font-semibold">${selectedEquipment.daily_rate * 30 * 0.8}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}