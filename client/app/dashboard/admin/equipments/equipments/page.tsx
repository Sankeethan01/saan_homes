'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiSearchLine,
  RiFileListLine,
  RiFilter3Line,
  RiToolsLine,
} from 'react-icons/ri';
import { FiDollarSign, FiTag } from 'react-icons/fi';
import Image from 'next/image';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface Equipment {
  id: string;
  name: string;
  image: string;
  description: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  security_deposit: number;
  late_return_fee: number;
  category: number;
  category_name: string;
  availability_status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  is_featured: boolean;
  
  // Technical Specifications
  operating_weight?: string;
  engine_power?: string;
  blade_capacity?: string;
  fuel_capacity?: string;
  max_speed?: string;
  length?: string;
  width?: string;
  height?: string;
  
  // Features
  gps_ready: boolean;
  air_conditioning: boolean;
  hydraulic_system: boolean;
  
  // Operational Details
  current_location?: string;
  pickup_location?: string;
  delivery_available: boolean;
  delivery_radius: number;
  delivery_fee: number;
  
  // Maintenance & Condition
  condition_rating: 1 | 2 | 3 | 4 | 5;
  last_service_date?: string;
  next_service_due?: string;
  service_hours: number;
  
  // Asset Management
  serial_number?: string;
  asset_tag?: string;
  purchase_date?: string;
  depreciation_value?: number;
  
  // Rental Requirements
  minimum_rental_period: number;
  maximum_rental_period: number;
  advance_booking_days: number;
  operator_license_required: boolean;
  training_required: boolean;
  age_restriction: number;
  insurance_required: boolean;
  
  // Documentation
  manual_url?: string;
  
  // Analytics
  total_rental_days: number;
  total_revenue: number;
  popularity_score: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
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
        setFilteredEquipments(equipmentsData);
      } catch {
        setError('Error loading data. Please try again later.');
        setEquipments([]);
        setCategories([]);
        setFilteredEquipments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router, clearToken]);

  // Filter equipments based on search term and category
  useEffect(() => {
    let result = [...equipments];
    
    if (searchTerm) {
      result = result.filter(equipment => 
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'All') {
      result = result.filter(equipment => equipment.category_name === categoryFilter);
    }
    
    setFilteredEquipments(result);
  }, [searchTerm, categoryFilter, equipments]);

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete equipment');
      setEquipments(equipments.filter(eq => eq.id !== id));
    } catch {
      alert('Error deleting equipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewEquipment = (equipment: Equipment) => {
    router.push(`/dashboard/admin/equipments/equipments/${equipment.id}`);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    router.push(`/dashboard/admin/equipments/equipments/edit/${equipment.id}`);
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
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">Equipment Management</h1>
          <p className="text-slate-600 mt-1">Manage your construction equipment inventory</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/equipments/equipments/new')}
          className="bg-[#1b4965] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-[#1b4965] transition-colors shadow-sm"
          disabled={actionLoading}
        >
          <RiAddLine />
          Add Equipment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Equipment</p>
              <p className="text-2xl font-bold text-slate-900">{equipments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <RiToolsLine className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <RiFileListLine className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Daily Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                LKR {equipments.length > 0 ? (equipments.reduce((sum, eq) => sum + eq.daily_rate, 0) / equipments.length).toFixed(0) : '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <RiFilter3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <span className="font-medium">{filteredEquipments.length}</span>
            <span className="ml-1">of {equipments.length} equipment</span>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipments.length > 0 ? (
          filteredEquipments.map((equipment, index) => (
            <motion.div
              key={equipment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col h-full max-w-full"
            >
              {/* Equipment Image */}
              <div className="relative h-48 bg-slate-100 flex-shrink-0 overflow-hidden">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleViewEquipment(equipment)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                    title="View details"
                    aria-label="View equipment details"
                  >
                    <RiEyeLine className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleEditEquipment(equipment)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                    title="Edit equipment"
                    aria-label="Edit equipment"
                  >
                    <RiEditLine className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteEquipment(equipment.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                    title="Delete equipment"
                    aria-label="Delete equipment"
                    disabled={actionLoading}
                  >
                    <RiDeleteBinLine className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Equipment Details */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="mb-3">
                  <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-2 min-h-[2.5rem] flex items-center">
                    {equipment.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FiTag className="w-3 h-3 mr-1" />
                      {equipment.category_name}
                    </span>
                  </div>
                </div>

                <div className="flex-grow mb-4">
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {equipment.description}
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-baseline">
                      <span className="text-xl font-bold text-slate-900">LKR {equipment.daily_rate}</span>
                      <span className="text-sm text-slate-500 ml-1">/day</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewEquipment(equipment)}
                    className="w-full px-4 py-2 bg-[#1b4965] text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <RiToolsLine className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No equipment found</h3>
            <p className="text-slate-500 text-center max-w-md">
              {searchTerm || categoryFilter !== 'All' 
                ? 'No equipment matches your current search criteria. Try adjusting your filters.' 
                : 'No equipment available. Add your first equipment to get started.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}