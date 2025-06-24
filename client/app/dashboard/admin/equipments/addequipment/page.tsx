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

interface Equipment {
  id: string;
  name: string;
  image: string;
  price: number;
  availability: boolean;
  description: string;
  category: string;
  condition: 'Excellent' | 'Good' | 'Fair';
}

const categories = [
  'Heavy Machinery',
  'Power Tools',
  'Construction Equipment',
  'Landscaping Tools',
  'Safety Equipment',
  'Electrical Tools',
];

const initialEquipments: Equipment[] = [
  {
    id: '1',
    name: 'Excavator',
    image: '/images/excavator.jpg',
    price: 500,
    availability: true,
    description: 'Heavy duty excavator for construction projects',
    category: 'Heavy Machinery',
    condition: 'Excellent',
  },
  {
    id: '2',
    name: 'Concrete Mixer',
    image: '/images/concrete-mixer.jpg',
    price: 150,
    availability: true,
    description: 'Professional grade concrete mixer',
    category: 'Construction Equipment',
    condition: 'Good',
  },
  {
    id: '3',
    name: 'Power Drill Set',
    image: '/images/power-drill.jpg',
    price: 45,
    availability: true,
    description: 'Complete power drill set with various bits',
    category: 'Power Tools',
    condition: 'Excellent',
  },
  {
    id: '4',
    name: 'Lawn Mower',
    image: '/images/lawn-mower.jpg',
    price: 75,
    availability: false,
    description: 'Professional grade lawn mower',
    category: 'Landscaping Tools',
    condition: 'Good',
  },
  {
    id: '5',
    name: 'Safety Harness',
    image: '/images/safety-harness.jpg',
    price: 25,
    availability: true,
    description: 'Full-body safety harness for construction work',
    category: 'Safety Equipment',
    condition: 'Excellent',
  },
  {
    id: '6',
    name: 'Generator',
    image: '/images/generator.jpg',
    price: 200,
    availability: true,
    description: 'Portable power generator',
    category: 'Electrical Tools',
    condition: 'Good',
  },
];

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    image: '',
    price: 0,
    availability: true,
    description: '',
    category: '',
    condition: 'Good',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment>>({});

  const handleAddEquipment = () => {
    if (
      newEquipment.name &&
      newEquipment.price &&
      newEquipment.category &&
      newEquipment.condition &&
      newEquipment.description
    ) {
      setEquipments([
        ...equipments,
        {
          id: Date.now().toString(),
          image: newEquipment.image || '/images/placeholder.jpg',
          ...newEquipment as Omit<Equipment, 'id' | 'image'>,
        },
      ]);
      setIsAddModalOpen(false);
      setNewEquipment({
        name: '',
        image: '',
        price: 0,
        availability: true,
        description: '',
        category: '',
        condition: 'Good',
      });
    }
  };

  // Handle image upload for add
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewEquipment((prev) => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for edit
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditingEquipment((prev) => ({ ...prev, image: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteEquipment = (index: number) => {
    setEquipments(equipments.filter((_, i) => i !== index));
  };

  const handleEditEquipment = (index: number) => {
    setEditingIndex(index);
    setEditingEquipment(equipments[index]);
  };

  const handleUpdateEquipment = () => {
    if (
      editingEquipment.name &&
      editingEquipment.price &&
      editingEquipment.category &&
      editingEquipment.condition &&
      editingEquipment.description
    ) {
      setEquipments(
        equipments.map((eq, i) =>
          i === editingIndex
            ? {
                ...eq,
                ...editingEquipment,
                image: editingEquipment.image || '/images/placeholder.jpg',
              }
            : eq
        )
      );
      setEditingIndex(null);
      setEditingEquipment({});
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Equipments</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
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
              <th className="py-2 px-4">Condition</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">Availability</th>
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
                      {editingEquipment.image && (
                        <img src={editingEquipment.image} alt="Preview" className="w-16 h-16 object-cover rounded mb-2" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
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
                        onChange={e => setEditingEquipment({ ...editingEquipment, category: e.target.value })}
                        className="p-2 border rounded w-full"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <select
                        value={editingEquipment.condition || 'Good'}
                        onChange={e => setEditingEquipment({ ...editingEquipment, condition: e.target.value as Equipment['condition'] })}
                        className="p-2 border rounded w-full"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={editingEquipment.price || 0}
                        onChange={e => setEditingEquipment({ ...editingEquipment, price: Number(e.target.value) })}
                        className="p-2 border rounded w-full"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <select
                        value={editingEquipment.availability ? 'true' : 'false'}
                        onChange={e => setEditingEquipment({ ...editingEquipment, availability: e.target.value === 'true' })}
                        className="p-2 border rounded w-full"
                      >
                        <option value="true">Available</option>
                        <option value="false">Rented</option>
                      </select>
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
                        >
                          <RiCheckLine />
                        </button>
                        <button
                          onClick={() => { setEditingIndex(null); setEditingEquipment({}); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <RiCloseLine />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-4">
                      <img src={equipment.image} alt={equipment.name} className="w-16 h-16 object-cover rounded" />
                    </td>
                    <td className="py-2 px-4">{equipment.name}</td>
                    <td className="py-2 px-4">{equipment.category}</td>
                    <td className="py-2 px-4">{equipment.condition}</td>
                    <td className="py-2 px-4">${equipment.price}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${equipment.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {equipment.availability ? 'Available' : 'Rented'}
                      </span>
                    </td>
                    <td className="py-2 px-4">{equipment.description}</td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditEquipment(idx)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <RiEditLine />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                <td colSpan={7} className="text-center py-8 text-gray-400">No equipments found.</td>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Add New Equipment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  {newEquipment.image && (
                    <img src={newEquipment.image} alt="Preview" className="w-16 h-16 object-cover rounded mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newEquipment.name || ''}
                    onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={newEquipment.category || ''}
                    onChange={e => setNewEquipment({ ...newEquipment, category: e.target.value })}
                    className="mt-1 w-full p-2 border rounded"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <select
                    value={newEquipment.condition || 'Good'}
                    onChange={e => setNewEquipment({ ...newEquipment, condition: e.target.value as Equipment['condition'] })}
                    className="mt-1 w-full p-2 border rounded"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Day</label>
                  <input
                    type="number"
                    value={newEquipment.price || 0}
                    onChange={e => setNewEquipment({ ...newEquipment, price: Number(e.target.value) })}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <select
                    value={newEquipment.availability ? 'true' : 'false'}
                    onChange={e => setNewEquipment({ ...newEquipment, availability: e.target.value === 'true' })}
                    className="mt-1 w-full p-2 border rounded"
                  >
                    <option value="true">Available</option>
                    <option value="false">Rented</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newEquipment.description || ''}
                    onChange={e => setNewEquipment({ ...newEquipment, description: e.target.value })}
                    className="mt-1 w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => { setIsAddModalOpen(false); setNewEquipment({
                    name: '',
                    image: '',
                    price: 0,
                    availability: true,
                    description: '',
                    category: '',
                    condition: 'Good',
                  }); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEquipment}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Equipment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 