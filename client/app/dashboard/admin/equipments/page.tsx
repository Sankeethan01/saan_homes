'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiFilterLine,
  RiSortAsc,
  RiSortDesc,
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

export default function EquipmentRental() {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'name' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    price: 0,
    description: '',
    category: '',
    availability: true,
    condition: 'Good',
  });

  const filteredEquipments = useMemo(() => {
    return equipments
      .filter((eq) => {
        const matchesCategory = selectedCategory ? eq.category === selectedCategory : true;
        const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            eq.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = eq.price >= priceRange.min && eq.price <= priceRange.max;
        const matchesAvailability = availabilityFilter === null ? true : eq.availability === availabilityFilter;
        
        return matchesCategory && matchesSearch && matchesPrice && matchesAvailability;
      })
      .sort((a, b) => {
        if (!sortBy) return 0;
        if (sortBy === 'price') {
          return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        }
        return sortOrder === 'asc' 
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      });
  }, [equipments, selectedCategory, searchTerm, priceRange, availabilityFilter, sortBy, sortOrder]);

  const handleAddEquipment = () => {
    if (newEquipment.name && newEquipment.price) {
      const equipment: Equipment = {
        id: Date.now().toString(),
        image: '/images/placeholder.jpg',
        ...newEquipment as Omit<Equipment, 'id' | 'image'>,
      } as Equipment;
      setEquipments([...equipments, equipment]);
      setIsAddModalOpen(false);
      setNewEquipment({
        name: '',
        price: 0,
        description: '',
        category: '',
        availability: true,
        condition: 'Good',
      });
    }
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipments(equipments.filter((eq) => eq.id !== id));
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
  };

  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    setEquipments(
      equipments.map((eq) =>
        eq.id === updatedEquipment.id ? updatedEquipment : eq
      )
    );
    setEditingEquipment(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Filters */}
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Equipment Management</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <RiAddLine />
            Add Equipment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search equipment..."
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                value={availabilityFilter === null ? '' : availabilityFilter.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setAvailabilityFilter(
                    value === '' ? null : value === 'true'
                  );
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Rented</option>
              </select>
            </div>
          </div>

          {/* Price Range and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (${priceRange.min} - ${priceRange.max})
              </label>
              <div className="flex gap-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: Number(e.target.value) })
                  }
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy || ''}
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | null)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">None</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border rounded hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? <RiSortAsc /> : <RiSortDesc />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredEquipments.map((equipment) => (
            <motion.div
              key={equipment.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                {editingEquipment?.id === equipment.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingEquipment.name}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="number"
                      value={editingEquipment.price}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={editingEquipment.category}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={editingEquipment.description}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={editingEquipment.condition}
                      onChange={(e) =>
                        setEditingEquipment({
                          ...editingEquipment,
                          condition: e.target.value as Equipment['condition'],
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateEquipment(editingEquipment)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <RiCheckLine />
                      </button>
                      <button
                        onClick={() => setEditingEquipment(null)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <RiCloseLine />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <h3 className="text-lg font-semibold mb-2">{equipment.name}</h3>
                    <p className="text-gray-600 mb-2">{equipment.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {equipment.category}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        Condition: {equipment.condition}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        ${equipment.price}/day
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          equipment.availability
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {equipment.availability ? 'Available' : 'Rented'}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleEditEquipment(equipment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <RiEditLine />
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(equipment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Equipment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newEquipment.name}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, name: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={newEquipment.category}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, category: e.target.value })
                  }
                  className="mt-1 w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price per Day
                </label>
                <input
                  type="number"
                  value={newEquipment.price}
                  onChange={(e) =>
                    setNewEquipment({
                      ...newEquipment,
                      price: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newEquipment.description}
                  onChange={(e) =>
                    setNewEquipment({
                      ...newEquipment,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <select
                  value={newEquipment.condition}
                  onChange={(e) =>
                    setNewEquipment({
                      ...newEquipment,
                      condition: e.target.value as Equipment['condition'],
                    })
                  }
                  className="mt-1 w-full p-2 border rounded"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  );
} 