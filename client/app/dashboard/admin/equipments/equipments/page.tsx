'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiEyeLine,
  RiSearchLine,
  RiFileListLine,
  RiFilter3Line,
  RiToolsLine,
  RiInformationLine,
  RiPriceTag3Line,
  RiSettings3Line,
  RiTruckLine,
  RiShieldCheckLine,
  RiFileTextLine,
} from 'react-icons/ri';
import { FiDollarSign, FiTag, FiStar } from 'react-icons/fi';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    description: '',
    daily_rate: 0,
    weekly_rate: 0,
    monthly_rate: 0,
    security_deposit: 0,
    late_return_fee: 0,
    category: 0,
    availability_status: 'AVAILABLE',
    is_featured: false,
    operating_weight: '',
    engine_power: '',
    blade_capacity: '',
    fuel_capacity: '',
    max_speed: '',
    length: '',
    width: '',
    height: '',
    gps_ready: false,
    air_conditioning: false,
    hydraulic_system: false,
    current_location: '',
    pickup_location: '',
    delivery_available: false,
    delivery_radius: 0,
    delivery_fee: 0,
    condition_rating: 5,
    service_hours: 0,
    minimum_rental_period: 1,
    maximum_rental_period: 365,
    advance_booking_days: 30,
    operator_license_required: false,
    training_required: false,
    age_restriction: 18,
    insurance_required: true,
    manual_url: '',
  });
  
  const [editingEquipment, setEditingEquipment] = useState<Partial<Equipment>>({});
  const [editActiveTab, setEditActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  // Tab configuration for the add equipment modal
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: RiInformationLine },
    { id: 'pricing', label: 'Pricing', icon: RiPriceTag3Line },
    { id: 'specs', label: 'Specifications', icon: RiSettings3Line },
    { id: 'operational', label: 'Operational', icon: RiTruckLine },
    { id: 'requirements', label: 'Requirements', icon: RiShieldCheckLine },
    { id: 'documentation', label: 'Documentation', icon: RiFileTextLine },
  ];

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

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.daily_rate || !newEquipment.category) return;
    setActionLoading(true);
    
    try {
      const formData = new FormData();
      
      // Basic Information
      formData.append('name', newEquipment.name);
      formData.append('description', newEquipment.description || '');
      formData.append('category', newEquipment.category.toString());
      if (newImage) {
        formData.append('image', newImage);
      }
      
      // Pricing
      formData.append('daily_rate', newEquipment.daily_rate.toString());
      if (newEquipment.weekly_rate) formData.append('weekly_rate', newEquipment.weekly_rate.toString());
      if (newEquipment.monthly_rate) formData.append('monthly_rate', newEquipment.monthly_rate.toString());
      formData.append('security_deposit', (newEquipment.security_deposit || 0).toString());
      formData.append('late_return_fee', (newEquipment.late_return_fee || 0).toString());
      
      // Status & Availability
      formData.append('availability_status', newEquipment.availability_status || 'AVAILABLE');
      formData.append('is_featured', (newEquipment.is_featured || false).toString());
      
      // Technical Specifications
      if (newEquipment.operating_weight) formData.append('operating_weight', newEquipment.operating_weight);
      if (newEquipment.engine_power) formData.append('engine_power', newEquipment.engine_power);
      if (newEquipment.blade_capacity) formData.append('blade_capacity', newEquipment.blade_capacity);
      if (newEquipment.fuel_capacity) formData.append('fuel_capacity', newEquipment.fuel_capacity);
      if (newEquipment.max_speed) formData.append('max_speed', newEquipment.max_speed);
      if (newEquipment.length) formData.append('length', newEquipment.length);
      if (newEquipment.width) formData.append('width', newEquipment.width);
      if (newEquipment.height) formData.append('height', newEquipment.height);
      
      // Features
      formData.append('gps_ready', (newEquipment.gps_ready || false).toString());
      formData.append('air_conditioning', (newEquipment.air_conditioning || false).toString());
      formData.append('hydraulic_system', (newEquipment.hydraulic_system || false).toString());
      
      // Operational Details
      if (newEquipment.current_location) formData.append('current_location', newEquipment.current_location);
      if (newEquipment.pickup_location) formData.append('pickup_location', newEquipment.pickup_location);
      formData.append('delivery_available', (newEquipment.delivery_available || false).toString());
      formData.append('delivery_radius', (newEquipment.delivery_radius || 0).toString());
      formData.append('delivery_fee', (newEquipment.delivery_fee || 0).toString());
      
      // Maintenance & Condition
      formData.append('condition_rating', (newEquipment.condition_rating || 5).toString());
      if (newEquipment.last_service_date) formData.append('last_service_date', newEquipment.last_service_date);
      if (newEquipment.next_service_due) formData.append('next_service_due', newEquipment.next_service_due);
      formData.append('service_hours', (newEquipment.service_hours || 0).toString());
      
      // Asset Management
      if (newEquipment.serial_number) formData.append('serial_number', newEquipment.serial_number);
      if (newEquipment.asset_tag) formData.append('asset_tag', newEquipment.asset_tag);
      if (newEquipment.purchase_date) formData.append('purchase_date', newEquipment.purchase_date);
      if (newEquipment.depreciation_value) formData.append('depreciation_value', newEquipment.depreciation_value.toString());
      
      // Rental Requirements
      formData.append('minimum_rental_period', (newEquipment.minimum_rental_period || 1).toString());
      formData.append('maximum_rental_period', (newEquipment.maximum_rental_period || 365).toString());
      formData.append('advance_booking_days', (newEquipment.advance_booking_days || 30).toString());
      formData.append('operator_license_required', (newEquipment.operator_license_required || false).toString());
      formData.append('training_required', (newEquipment.training_required || false).toString());
      formData.append('age_restriction', (newEquipment.age_restriction || 18).toString());
      formData.append('insurance_required', (newEquipment.insurance_required || true).toString());
      
      // Documentation
      if (newEquipment.manual_url) formData.append('manual_url', newEquipment.manual_url);

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
      resetNewEquipment();
    } catch {
      alert('Error adding equipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const resetNewEquipment = () => {
    setNewEquipment({
      name: '',
      description: '',
      daily_rate: 0,
      weekly_rate: 0,
      monthly_rate: 0,
      security_deposit: 0,
      late_return_fee: 0,
      category: 0,
      availability_status: 'AVAILABLE',
      is_featured: false,
      operating_weight: '',
      engine_power: '',
      blade_capacity: '',
      fuel_capacity: '',
      max_speed: '',
      length: '',
      width: '',
      height: '',
      gps_ready: false,
      air_conditioning: false,
      hydraulic_system: false,
      current_location: '',
      pickup_location: '',
      delivery_available: false,
      delivery_radius: 0,
      delivery_fee: 0,
      condition_rating: 5,
      last_service_date: '',
      next_service_due: '',
      service_hours: 0,
      serial_number: '',
      asset_tag: '',
      purchase_date: '',
      depreciation_value: 0,
      minimum_rental_period: 1,
      maximum_rental_period: 365,
      advance_booking_days: 30,
      operator_license_required: false,
      training_required: false,
      age_restriction: 18,
      insurance_required: true,
      manual_url: '',
    });
    setNewImage(null);
    setActiveTab('basic');
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
    } catch {
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
      
      // Basic Information
      formData.append('name', editingEquipment.name);
      formData.append('description', editingEquipment.description || '');
      formData.append('category', editingEquipment.category.toString());
      if (editImage) {
        formData.append('image', editImage);
      }
      
      // Pricing
      formData.append('daily_rate', editingEquipment.daily_rate.toString());
      if (editingEquipment.weekly_rate) formData.append('weekly_rate', editingEquipment.weekly_rate.toString());
      if (editingEquipment.monthly_rate) formData.append('monthly_rate', editingEquipment.monthly_rate.toString());
      formData.append('security_deposit', (editingEquipment.security_deposit || 0).toString());
      formData.append('late_return_fee', (editingEquipment.late_return_fee || 0).toString());
      
      // Status & Availability
      formData.append('availability_status', editingEquipment.availability_status || 'AVAILABLE');
      formData.append('is_featured', (editingEquipment.is_featured || false).toString());
      
      // Technical Specifications
      if (editingEquipment.operating_weight) formData.append('operating_weight', editingEquipment.operating_weight);
      if (editingEquipment.engine_power) formData.append('engine_power', editingEquipment.engine_power);
      if (editingEquipment.blade_capacity) formData.append('blade_capacity', editingEquipment.blade_capacity);
      if (editingEquipment.fuel_capacity) formData.append('fuel_capacity', editingEquipment.fuel_capacity);
      if (editingEquipment.max_speed) formData.append('max_speed', editingEquipment.max_speed);
      if (editingEquipment.length) formData.append('length', editingEquipment.length);
      if (editingEquipment.width) formData.append('width', editingEquipment.width);
      if (editingEquipment.height) formData.append('height', editingEquipment.height);
      
      // Features
      formData.append('gps_ready', (editingEquipment.gps_ready || false).toString());
      formData.append('air_conditioning', (editingEquipment.air_conditioning || false).toString());
      formData.append('hydraulic_system', (editingEquipment.hydraulic_system || false).toString());
      
      // Operational Details
      if (editingEquipment.current_location) formData.append('current_location', editingEquipment.current_location);
      if (editingEquipment.pickup_location) formData.append('pickup_location', editingEquipment.pickup_location);
      formData.append('delivery_available', (editingEquipment.delivery_available || false).toString());
      formData.append('delivery_radius', (editingEquipment.delivery_radius || 0).toString());
      formData.append('delivery_fee', (editingEquipment.delivery_fee || 0).toString());
      
      // Maintenance & Condition
      formData.append('condition_rating', (editingEquipment.condition_rating || 5).toString());
      if (editingEquipment.last_service_date) formData.append('last_service_date', editingEquipment.last_service_date);
      if (editingEquipment.next_service_due) formData.append('next_service_due', editingEquipment.next_service_due);
      formData.append('service_hours', (editingEquipment.service_hours || 0).toString());
      
      // Asset Management
      if (editingEquipment.serial_number) formData.append('serial_number', editingEquipment.serial_number);
      if (editingEquipment.asset_tag) formData.append('asset_tag', editingEquipment.asset_tag);
      if (editingEquipment.purchase_date) formData.append('purchase_date', editingEquipment.purchase_date);
      if (editingEquipment.depreciation_value) formData.append('depreciation_value', editingEquipment.depreciation_value.toString());
      
      // Rental Requirements
      formData.append('minimum_rental_period', (editingEquipment.minimum_rental_period || 1).toString());
      formData.append('maximum_rental_period', (editingEquipment.maximum_rental_period || 365).toString());
      formData.append('advance_booking_days', (editingEquipment.advance_booking_days || 30).toString());
      formData.append('operator_license_required', (editingEquipment.operator_license_required || false).toString());
      formData.append('training_required', (editingEquipment.training_required || false).toString());
      formData.append('age_restriction', (editingEquipment.age_restriction || 18).toString());
      formData.append('insurance_required', (editingEquipment.insurance_required || true).toString());
      
      // Documentation
      if (editingEquipment.manual_url) formData.append('manual_url', editingEquipment.manual_url);

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
      setIsEditModalOpen(false);
      setEditingEquipment({});
      setEditImage(null);
    } catch {
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

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setIsEditModalOpen(true);
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">Equipment Management</h1>
          <p className="text-slate-600 mt-1">Manage your construction equipment inventory</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-[#1b4965] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-[#1b4965] transition-colors shadow-sm"
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
                ${equipments.length > 0 ? (equipments.reduce((sum, eq) => sum + eq.daily_rate, 0) / equipments.length).toFixed(0) : '0'}
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
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col h-full"
            >
              {/* Equipment Image */}
              <div className="relative h-48 bg-slate-100 flex-shrink-0">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                  >
                    <RiDeleteBinLine className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Equipment Details */}
              <div className="p-4 flex flex-col flex-grow mt-5">
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
                      <FiDollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-xl font-bold text-slate-900">${equipment.daily_rate}</span>
                      <span className="text-sm text-slate-500 ml-1">/day</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewEquipment(equipment)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors shadow-sm"
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

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">Add New Equipment</h2>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetNewEquipment();
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Close modal"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-1 mt-4 bg-slate-100 p-1 rounded-lg">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="equipmentImage" className="block text-sm font-medium text-slate-700 mb-2">Equipment Photo *</label>
                      {newImage && (
                        <div className="relative h-32 w-32 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={URL.createObjectURL(newImage)}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <input
                        id="equipmentImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="equipmentName" className="block text-sm font-medium text-slate-700 mb-1">Equipment Name *</label>
                        <input
                          id="equipmentName"
                          type="text"
                          value={newEquipment.name || ''}
                          onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="Enter equipment name"
                        />
                      </div>

                      <div>
                        <label htmlFor="equipmentCategory" className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                        <select
                          id="equipmentCategory"
                          value={newEquipment.category || ''}
                          onChange={e => setNewEquipment({ ...newEquipment, category: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="equipmentDescription" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        id="equipmentDescription"
                        value={newEquipment.description || ''}
                        onChange={e => setNewEquipment({ ...newEquipment, description: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        disabled={actionLoading}
                        placeholder="Enter equipment description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="availabilityStatus" className="block text-sm font-medium text-slate-700 mb-1">Availability Status</label>
                        <select
                          id="availabilityStatus"
                          value={newEquipment.availability_status || 'AVAILABLE'}
                          onChange={e => setNewEquipment({ ...newEquipment, availability_status: e.target.value as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE' })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RENTED">Currently Rented</option>
                          <option value="MAINTENANCE">Under Maintenance</option>
                          <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="isFeatured"
                          type="checkbox"
                          checked={newEquipment.is_featured || false}
                          onChange={e => setNewEquipment({ ...newEquipment, is_featured: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={actionLoading}
                        />
                        <label htmlFor="isFeatured" className="ml-2 block text-sm text-slate-700">
                          <FiStar className="inline w-4 h-4 mr-1" />
                          Featured Equipment (show on homepage)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="dailyRate" className="block text-sm font-medium text-slate-700 mb-1">Daily Rate ($) *</label>
                        <input
                          id="dailyRate"
                          type="number"
                          value={newEquipment.daily_rate || 0}
                          onChange={e => setNewEquipment({ ...newEquipment, daily_rate: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="600"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label htmlFor="weeklyRate" className="block text-sm font-medium text-slate-700 mb-1">Weekly Rate ($)</label>
                        <input
                          id="weeklyRate"
                          type="number"
                          value={newEquipment.weekly_rate || 0}
                          onChange={e => setNewEquipment({ ...newEquipment, weekly_rate: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="3500"
                          min="0"
                          step="0.01"
                        />
                        {newEquipment.daily_rate && newEquipment.weekly_rate && (
                          <p className="text-xs text-green-600 mt-1">
                            {((1 - (newEquipment.weekly_rate / (newEquipment.daily_rate * 7))) * 100).toFixed(1)}% discount
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="monthlyRate" className="block text-sm font-medium text-slate-700 mb-1">Monthly Rate ($)</label>
                        <input
                          id="monthlyRate"
                          type="number"
                          value={newEquipment.monthly_rate || 0}
                          onChange={e => setNewEquipment({ ...newEquipment, monthly_rate: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="12000"
                          min="0"
                          step="0.01"
                        />
                        {newEquipment.daily_rate && newEquipment.monthly_rate && (
                          <p className="text-xs text-green-600 mt-1">
                            {((1 - (newEquipment.monthly_rate / (newEquipment.daily_rate * 30))) * 100).toFixed(1)}% discount
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="securityDeposit" className="block text-sm font-medium text-slate-700 mb-1">Security Deposit ($)</label>
                        <input
                          id="securityDeposit"
                          type="number"
                          value={newEquipment.security_deposit || 0}
                          onChange={e => setNewEquipment({ ...newEquipment, security_deposit: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label htmlFor="lateReturnFee" className="block text-sm font-medium text-slate-700 mb-1">Late Return Fee ($/day)</label>
                        <input
                          id="lateReturnFee"
                          type="number"
                          value={newEquipment.late_return_fee || 0}
                          onChange={e => setNewEquipment({ ...newEquipment, late_return_fee: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="50"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                                      </div>
                  )}

                  {activeTab === 'specs' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="operatingWeight" className="block text-sm font-medium text-slate-700 mb-1">Operating Weight</label>
                            <input
                              id="operatingWeight"
                              type="text"
                              value={newEquipment.operating_weight || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, operating_weight: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 18 tons"
                            />
                          </div>

                          <div>
                            <label htmlFor="enginePower" className="block text-sm font-medium text-slate-700 mb-1">Engine Power</label>
                            <input
                              id="enginePower"
                              type="text"
                              value={newEquipment.engine_power || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, engine_power: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 168 hp"
                            />
                          </div>

                          <div>
                            <label htmlFor="bladeCapacity" className="block text-sm font-medium text-slate-700 mb-1">Blade/Bucket Capacity</label>
                            <input
                              id="bladeCapacity"
                              type="text"
                              value={newEquipment.blade_capacity || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, blade_capacity: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 4.5 cubic yards"
                            />
                          </div>

                          <div>
                            <label htmlFor="fuelCapacity" className="block text-sm font-medium text-slate-700 mb-1">Fuel Capacity</label>
                            <input
                              id="fuelCapacity"
                              type="text"
                              value={newEquipment.fuel_capacity || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, fuel_capacity: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 50 gallons"
                            />
                          </div>

                          <div>
                            <label htmlFor="maxSpeed" className="block text-sm font-medium text-slate-700 mb-1">Maximum Speed</label>
                            <input
                              id="maxSpeed"
                              type="text"
                              value={newEquipment.max_speed || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, max_speed: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 25 mph"
                            />
                          </div>

                          <div>
                            <label htmlFor="conditionRating" className="block text-sm font-medium text-slate-700 mb-1">Condition Rating</label>
                            <select
                              id="conditionRating"
                              value={newEquipment.condition_rating || 5}
                              onChange={e => setNewEquipment({ ...newEquipment, condition_rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                            >
                              <option value={5}>5 - Excellent</option>
                              <option value={4}>4 - Very Good</option>
                              <option value={3}>3 - Good</option>
                              <option value={2}>2 - Fair</option>
                              <option value={1}>1 - Poor</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Dimensions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="length" className="block text-sm font-medium text-slate-700 mb-1">Length</label>
                            <input
                              id="length"
                              type="text"
                              value={newEquipment.length || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, length: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 8.5m"
                            />
                          </div>

                          <div>
                            <label htmlFor="width" className="block text-sm font-medium text-slate-700 mb-1">Width</label>
                            <input
                              id="width"
                              type="text"
                              value={newEquipment.width || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, width: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 2.8m"
                            />
                          </div>

                          <div>
                            <label htmlFor="height" className="block text-sm font-medium text-slate-700 mb-1">Height</label>
                            <input
                              id="height"
                              type="text"
                              value={newEquipment.height || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, height: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., 3.2m"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center">
                            <input
                              id="gpsReady"
                              type="checkbox"
                              checked={newEquipment.gps_ready || false}
                              onChange={e => setNewEquipment({ ...newEquipment, gps_ready: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="gpsReady" className="ml-2 block text-sm text-slate-700">
                              GPS Ready
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="airConditioning"
                              type="checkbox"
                              checked={newEquipment.air_conditioning || false}
                              onChange={e => setNewEquipment({ ...newEquipment, air_conditioning: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="airConditioning" className="ml-2 block text-sm text-slate-700">
                              Air Conditioning
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="hydraulicSystem"
                              type="checkbox"
                              checked={newEquipment.hydraulic_system || false}
                              onChange={e => setNewEquipment({ ...newEquipment, hydraulic_system: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="hydraulicSystem" className="ml-2 block text-sm text-slate-700">
                              Hydraulic System
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="serviceHours" className="block text-sm font-medium text-slate-700 mb-1">Service Hours</label>
                            <input
                              id="serviceHours"
                              type="number"
                              value={newEquipment.service_hours || 0}
                              onChange={e => setNewEquipment({ ...newEquipment, service_hours: Number(e.target.value) })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="0"
                              min="0"
                            />
                          </div>

                          <div>
                            <label htmlFor="lastServiceDate" className="block text-sm font-medium text-slate-700 mb-1">Last Service Date</label>
                            <input
                              id="lastServiceDate"
                              type="date"
                              value={newEquipment.last_service_date || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, last_service_date: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                            />
                          </div>

                          <div>
                            <label htmlFor="nextServiceDue" className="block text-sm font-medium text-slate-700 mb-1">Next Service Due</label>
                            <input
                              id="nextServiceDue"
                              type="date"
                              value={newEquipment.next_service_due || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, next_service_due: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'operational' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Location Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="currentLocation" className="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                            <input
                              id="currentLocation"
                              type="text"
                              value={newEquipment.current_location || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, current_location: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., Main Depot"
                            />
                          </div>

                          <div>
                            <label htmlFor="pickupLocation" className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
                            <input
                              id="pickupLocation"
                              type="text"
                              value={newEquipment.pickup_location || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, pickup_location: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., Warehouse A"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Delivery Options</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              id="deliveryAvailable"
                              type="checkbox"
                              checked={newEquipment.delivery_available || false}
                              onChange={e => setNewEquipment({ ...newEquipment, delivery_available: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="deliveryAvailable" className="ml-2 block text-sm text-slate-700">
                              Delivery Available
                            </label>
                          </div>

                          {newEquipment.delivery_available && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                              <div>
                                <label htmlFor="deliveryRadius" className="block text-sm font-medium text-slate-700 mb-1">Delivery Radius (km)</label>
                                <input
                                  id="deliveryRadius"
                                  type="number"
                                  value={newEquipment.delivery_radius || 0}
                                  onChange={e => setNewEquipment({ ...newEquipment, delivery_radius: Number(e.target.value) })}
                                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  disabled={actionLoading}
                                  placeholder="50"
                                  min="0"
                                />
                              </div>

                              <div>
                                <label htmlFor="deliveryFee" className="block text-sm font-medium text-slate-700 mb-1">Delivery Fee ($)</label>
                                <input
                                  id="deliveryFee"
                                  type="number"
                                  value={newEquipment.delivery_fee || 0}
                                  onChange={e => setNewEquipment({ ...newEquipment, delivery_fee: Number(e.target.value) })}
                                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  disabled={actionLoading}
                                  placeholder="100"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Management</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                            <input
                              id="serialNumber"
                              type="text"
                              value={newEquipment.serial_number || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., CM-2024-001"
                            />
                          </div>

                          <div>
                            <label htmlFor="assetTag" className="block text-sm font-medium text-slate-700 mb-1">Asset Tag</label>
                            <input
                              id="assetTag"
                              type="text"
                              value={newEquipment.asset_tag || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, asset_tag: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="e.g., SAAN-EQ-001"
                            />
                          </div>

                          <div>
                            <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                            <input
                              id="purchaseDate"
                              type="date"
                              value={newEquipment.purchase_date || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, purchase_date: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                            />
                          </div>

                          <div>
                            <label htmlFor="depreciationValue" className="block text-sm font-medium text-slate-700 mb-1">Current Value ($)</label>
                            <input
                              id="depreciationValue"
                              type="number"
                              value={newEquipment.depreciation_value || 0}
                              onChange={e => setNewEquipment({ ...newEquipment, depreciation_value: Number(e.target.value) })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="50000"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'requirements' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Rental Periods</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="minimumRentalPeriod" className="block text-sm font-medium text-slate-700 mb-1">Minimum Rental (days)</label>
                            <input
                              id="minimumRentalPeriod"
                              type="number"
                              value={newEquipment.minimum_rental_period || 1}
                              onChange={e => setNewEquipment({ ...newEquipment, minimum_rental_period: Number(e.target.value) })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="1"
                              min="1"
                            />
                          </div>

                          <div>
                            <label htmlFor="maximumRentalPeriod" className="block text-sm font-medium text-slate-700 mb-1">Maximum Rental (days)</label>
                            <input
                              id="maximumRentalPeriod"
                              type="number"
                              value={newEquipment.maximum_rental_period || 365}
                              onChange={e => setNewEquipment({ ...newEquipment, maximum_rental_period: Number(e.target.value) })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="365"
                              min="1"
                            />
                          </div>

                          <div>
                            <label htmlFor="advanceBookingDays" className="block text-sm font-medium text-slate-700 mb-1">Advance Booking (days)</label>
                            <input
                              id="advanceBookingDays"
                              type="number"
                              value={newEquipment.advance_booking_days || 30}
                              onChange={e => setNewEquipment({ ...newEquipment, advance_booking_days: Number(e.target.value) })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="30"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Operator Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center">
                            <input
                              id="operatorLicenseRequired"
                              type="checkbox"
                              checked={newEquipment.operator_license_required || false}
                              onChange={e => setNewEquipment({ ...newEquipment, operator_license_required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="operatorLicenseRequired" className="ml-2 block text-sm text-slate-700">
                              Operator License Required
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="trainingRequired"
                              type="checkbox"
                              checked={newEquipment.training_required || false}
                              onChange={e => setNewEquipment({ ...newEquipment, training_required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="trainingRequired" className="ml-2 block text-sm text-slate-700">
                              Training Required
                            </label>
                          </div>

                          <div>
                            <label htmlFor="ageRestriction" className="block text-sm font-medium text-slate-700 mb-1">Minimum Age</label>
                            <input
                              id="ageRestriction"
                              type="number"
                              value={newEquipment.age_restriction || 18}
                              onChange={e => setNewEquipment({ ...newEquipment, age_restriction: Number(e.target.value) })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="18"
                              min="16"
                              max="65"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              id="insuranceRequired"
                              type="checkbox"
                              checked={newEquipment.insurance_required || true}
                              onChange={e => setNewEquipment({ ...newEquipment, insurance_required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                              disabled={actionLoading}
                            />
                            <label htmlFor="insuranceRequired" className="ml-2 block text-sm text-slate-700">
                              Insurance Required
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documentation' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipment Documentation</h3>
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="manualUrl" className="block text-sm font-medium text-slate-700 mb-1">Operating Manual URL</label>
                            <input
                              id="manualUrl"
                              type="url"
                              value={newEquipment.manual_url || ''}
                              onChange={e => setNewEquipment({ ...newEquipment, manual_url: e.target.value })}
                              className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={actionLoading}
                              placeholder="https://example.com/manual.pdf"
                            />
                            <p className="text-xs text-slate-500 mt-1">Link to equipment operating manual or documentation</p>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-6">
                            <h4 className="font-medium text-slate-900 mb-3">Equipment Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">Name:</span>
                                <span className="ml-2 font-medium">{newEquipment.name || 'Not specified'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Category:</span>
                                <span className="ml-2 font-medium">
                                  {categories.find(c => c.id === newEquipment.category)?.name || 'Not selected'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">Daily Rate:</span>
                                <span className="ml-2 font-medium">${newEquipment.daily_rate || 0}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Status:</span>
                                <span className="ml-2 font-medium">{newEquipment.availability_status || 'Available'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Featured:</span>
                                <span className="ml-2 font-medium">{newEquipment.is_featured ? 'Yes' : 'No'}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Delivery:</span>
                                <span className="ml-2 font-medium">{newEquipment.delivery_available ? 'Available' : 'Not available'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                              <RiInformationLine className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div className="ml-3">
                                                                 <h4 className="text-sm font-medium text-blue-900">Ready to Add Equipment</h4>
                                 <p className="text-sm text-blue-700 mt-1">
                                   Review all the information above and click &quot;Add Equipment&quot; to save this equipment to your inventory.
                                   You can always edit these details later from the equipment management page.
                                 </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-200 flex justify-between">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        activeTab === tab.id ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      title={tab.label}
                    />
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      resetNewEquipment();
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEquipment}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] shadow-sm disabled:opacity-50"
                    disabled={actionLoading || !newEquipment.name || !newEquipment.daily_rate || !newEquipment.category}
                  >
                    {actionLoading ? 'Adding...' : 'Add Equipment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

            {/* Edit Equipment Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingEquipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">Edit Equipment</h2>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEquipment({});
                      setEditImage(null);
                      setEditActiveTab('basic');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Close modal"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-1 mt-4 bg-slate-100 p-1 rounded-lg">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setEditActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          editActiveTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {editActiveTab === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="editEquipmentImage" className="block text-sm font-medium text-slate-700 mb-2">Equipment Photo</label>
                      {(editImage || editingEquipment.image) && (
                        <div className="relative h-32 w-32 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={editImage ? URL.createObjectURL(editImage) : editingEquipment.image || ''}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <input
                        id="editEquipmentImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={actionLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="editEquipmentName" className="block text-sm font-medium text-slate-700 mb-1">Equipment Name *</label>
                        <input
                          id="editEquipmentName"
                          type="text"
                          value={editingEquipment.name || ''}
                          onChange={e => setEditingEquipment({ ...editingEquipment, name: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="Enter equipment name"
                        />
                      </div>

                      <div>
                        <label htmlFor="editEquipmentCategory" className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                        <select
                          id="editEquipmentCategory"
                          value={editingEquipment.category || ''}
                          onChange={e => setEditingEquipment({ ...editingEquipment, category: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="editEquipmentDescription" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea
                        id="editEquipmentDescription"
                        value={editingEquipment.description || ''}
                        onChange={e => setEditingEquipment({ ...editingEquipment, description: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        disabled={actionLoading}
                        placeholder="Enter equipment description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="editAvailabilityStatus" className="block text-sm font-medium text-slate-700 mb-1">Availability Status</label>
                        <select
                          id="editAvailabilityStatus"
                          value={editingEquipment.availability_status || 'AVAILABLE'}
                          onChange={e => setEditingEquipment({ ...editingEquipment, availability_status: e.target.value as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE' })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RENTED">Currently Rented</option>
                          <option value="MAINTENANCE">Under Maintenance</option>
                          <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="editIsFeatured"
                          type="checkbox"
                          checked={editingEquipment.is_featured || false}
                          onChange={e => setEditingEquipment({ ...editingEquipment, is_featured: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={actionLoading}
                        />
                        <label htmlFor="editIsFeatured" className="ml-2 block text-sm text-slate-700">
                          <FiStar className="inline w-4 h-4 mr-1" />
                          Featured Equipment (show on homepage)
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {editActiveTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="editDailyRate" className="block text-sm font-medium text-slate-700 mb-1">Daily Rate ($) *</label>
                        <input
                          id="editDailyRate"
                          type="number"
                          value={editingEquipment.daily_rate || 0}
                          onChange={e => setEditingEquipment({ ...editingEquipment, daily_rate: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="600"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label htmlFor="editWeeklyRate" className="block text-sm font-medium text-slate-700 mb-1">Weekly Rate ($)</label>
                        <input
                          id="editWeeklyRate"
                          type="number"
                          value={editingEquipment.weekly_rate || 0}
                          onChange={e => setEditingEquipment({ ...editingEquipment, weekly_rate: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="3500"
                          min="0"
                          step="0.01"
                        />
                        {editingEquipment.daily_rate && editingEquipment.weekly_rate && (
                          <p className="text-xs text-green-600 mt-1">
                            {((1 - (editingEquipment.weekly_rate / (editingEquipment.daily_rate * 7))) * 100).toFixed(1)}% discount
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="editMonthlyRate" className="block text-sm font-medium text-slate-700 mb-1">Monthly Rate ($)</label>
                        <input
                          id="editMonthlyRate"
                          type="number"
                          value={editingEquipment.monthly_rate || 0}
                          onChange={e => setEditingEquipment({ ...editingEquipment, monthly_rate: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="12000"
                          min="0"
                          step="0.01"
                        />
                        {editingEquipment.daily_rate && editingEquipment.monthly_rate && (
                          <p className="text-xs text-green-600 mt-1">
                            {((1 - (editingEquipment.monthly_rate / (editingEquipment.daily_rate * 30))) * 100).toFixed(1)}% discount
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="editSecurityDeposit" className="block text-sm font-medium text-slate-700 mb-1">Security Deposit ($)</label>
                        <input
                          id="editSecurityDeposit"
                          type="number"
                          value={editingEquipment.security_deposit || 0}
                          onChange={e => setEditingEquipment({ ...editingEquipment, security_deposit: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label htmlFor="editLateReturnFee" className="block text-sm font-medium text-slate-700 mb-1">Late Return Fee ($/day)</label>
                        <input
                          id="editLateReturnFee"
                          type="number"
                          value={editingEquipment.late_return_fee || 0}
                          onChange={e => setEditingEquipment({ ...editingEquipment, late_return_fee: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={actionLoading}
                          placeholder="50"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Add the same specs, operational, requirements, and documentation tabs as in the add modal */}
                {editActiveTab === 'specs' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="editOperatingWeight" className="block text-sm font-medium text-slate-700 mb-1">Operating Weight</label>
                          <input
                            id="editOperatingWeight"
                            type="text"
                            value={editingEquipment.operating_weight || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, operating_weight: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 18 tons"
                          />
                        </div>

                        <div>
                          <label htmlFor="editEnginePower" className="block text-sm font-medium text-slate-700 mb-1">Engine Power</label>
                          <input
                            id="editEnginePower"
                            type="text"
                            value={editingEquipment.engine_power || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, engine_power: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 168 hp"
                          />
                        </div>

                        <div>
                          <label htmlFor="editBladeCapacity" className="block text-sm font-medium text-slate-700 mb-1">Blade/Bucket Capacity</label>
                          <input
                            id="editBladeCapacity"
                            type="text"
                            value={editingEquipment.blade_capacity || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, blade_capacity: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 4.5 cubic yards"
                          />
                        </div>

                        <div>
                          <label htmlFor="editFuelCapacity" className="block text-sm font-medium text-slate-700 mb-1">Fuel Capacity</label>
                          <input
                            id="editFuelCapacity"
                            type="text"
                            value={editingEquipment.fuel_capacity || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, fuel_capacity: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 50 gallons"
                          />
                        </div>

                        <div>
                          <label htmlFor="editMaxSpeed" className="block text-sm font-medium text-slate-700 mb-1">Maximum Speed</label>
                          <input
                            id="editMaxSpeed"
                            type="text"
                            value={editingEquipment.max_speed || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, max_speed: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 25 mph"
                          />
                        </div>

                        <div>
                          <label htmlFor="editConditionRating" className="block text-sm font-medium text-slate-700 mb-1">Condition Rating</label>
                          <select
                            id="editConditionRating"
                            value={editingEquipment.condition_rating || 5}
                            onChange={e => setEditingEquipment({ ...editingEquipment, condition_rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                          >
                            <option value={5}>5 - Excellent</option>
                            <option value={4}>4 - Very Good</option>
                            <option value={3}>3 - Good</option>
                            <option value={2}>2 - Fair</option>
                            <option value={1}>1 - Poor</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Dimensions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="editLength" className="block text-sm font-medium text-slate-700 mb-1">Length</label>
                          <input
                            id="editLength"
                            type="text"
                            value={editingEquipment.length || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, length: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 8.5m"
                          />
                        </div>

                        <div>
                          <label htmlFor="editWidth" className="block text-sm font-medium text-slate-700 mb-1">Width</label>
                          <input
                            id="editWidth"
                            type="text"
                            value={editingEquipment.width || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, width: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 2.8m"
                          />
                        </div>

                        <div>
                          <label htmlFor="editHeight" className="block text-sm font-medium text-slate-700 mb-1">Height</label>
                          <input
                            id="editHeight"
                            type="text"
                            value={editingEquipment.height || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, height: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., 3.2m"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center">
                          <input
                            id="editGpsReady"
                            type="checkbox"
                            checked={editingEquipment.gps_ready || false}
                            onChange={e => setEditingEquipment({ ...editingEquipment, gps_ready: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editGpsReady" className="ml-2 block text-sm text-slate-700">
                            GPS Ready
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="editAirConditioning"
                            type="checkbox"
                            checked={editingEquipment.air_conditioning || false}
                            onChange={e => setEditingEquipment({ ...editingEquipment, air_conditioning: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editAirConditioning" className="ml-2 block text-sm text-slate-700">
                            Air Conditioning
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="editHydraulicSystem"
                            type="checkbox"
                            checked={editingEquipment.hydraulic_system || false}
                            onChange={e => setEditingEquipment({ ...editingEquipment, hydraulic_system: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editHydraulicSystem" className="ml-2 block text-sm text-slate-700">
                            Hydraulic System
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="editServiceHours" className="block text-sm font-medium text-slate-700 mb-1">Service Hours</label>
                          <input
                            id="editServiceHours"
                            type="number"
                            value={editingEquipment.service_hours || 0}
                            onChange={e => setEditingEquipment({ ...editingEquipment, service_hours: Number(e.target.value) })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label htmlFor="editLastServiceDate" className="block text-sm font-medium text-slate-700 mb-1">Last Service Date</label>
                          <input
                            id="editLastServiceDate"
                            type="date"
                            value={editingEquipment.last_service_date || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, last_service_date: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="editNextServiceDue" className="block text-sm font-medium text-slate-700 mb-1">Next Service Due</label>
                          <input
                            id="editNextServiceDue"
                            type="date"
                            value={editingEquipment.next_service_due || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, next_service_due: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add operational, requirements, and documentation tabs with similar structure */}
                
                {editActiveTab === 'operational' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Location Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="editCurrentLocation" className="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                          <input
                            id="editCurrentLocation"
                            type="text"
                            value={editingEquipment.current_location || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, current_location: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., Main Depot"
                          />
                        </div>

                        <div>
                          <label htmlFor="editPickupLocation" className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label>
                          <input
                            id="editPickupLocation"
                            type="text"
                            value={editingEquipment.pickup_location || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, pickup_location: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., Warehouse A"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Delivery Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="editDeliveryAvailable"
                            type="checkbox"
                            checked={editingEquipment.delivery_available || false}
                            onChange={e => setEditingEquipment({ ...editingEquipment, delivery_available: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editDeliveryAvailable" className="ml-2 block text-sm text-slate-700">
                            Delivery Available
                          </label>
                        </div>

                        {editingEquipment.delivery_available && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                            <div>
                              <label htmlFor="editDeliveryRadius" className="block text-sm font-medium text-slate-700 mb-1">Delivery Radius (km)</label>
                              <input
                                id="editDeliveryRadius"
                                type="number"
                                value={editingEquipment.delivery_radius || 0}
                                onChange={e => setEditingEquipment({ ...editingEquipment, delivery_radius: Number(e.target.value) })}
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={actionLoading}
                                placeholder="50"
                                min="0"
                              />
                            </div>

                            <div>
                              <label htmlFor="editDeliveryFee" className="block text-sm font-medium text-slate-700 mb-1">Delivery Fee ($)</label>
                              <input
                                id="editDeliveryFee"
                                type="number"
                                value={editingEquipment.delivery_fee || 0}
                                onChange={e => setEditingEquipment({ ...editingEquipment, delivery_fee: Number(e.target.value) })}
                                className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={actionLoading}
                                placeholder="100"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="editSerialNumber" className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                          <input
                            id="editSerialNumber"
                            type="text"
                            value={editingEquipment.serial_number || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, serial_number: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., CM-2024-001"
                          />
                        </div>

                        <div>
                          <label htmlFor="editAssetTag" className="block text-sm font-medium text-slate-700 mb-1">Asset Tag</label>
                          <input
                            id="editAssetTag"
                            type="text"
                            value={editingEquipment.asset_tag || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, asset_tag: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="e.g., SAAN-EQ-001"
                          />
                        </div>

                        <div>
                          <label htmlFor="editPurchaseDate" className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                          <input
                            id="editPurchaseDate"
                            type="date"
                            value={editingEquipment.purchase_date || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, purchase_date: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                          />
                        </div>

                        <div>
                          <label htmlFor="editDepreciationValue" className="block text-sm font-medium text-slate-700 mb-1">Current Value ($)</label>
                          <input
                            id="editDepreciationValue"
                            type="number"
                            value={editingEquipment.depreciation_value || 0}
                            onChange={e => setEditingEquipment({ ...editingEquipment, depreciation_value: Number(e.target.value) })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="50000"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editActiveTab === 'requirements' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Rental Periods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="editMinimumRentalPeriod" className="block text-sm font-medium text-slate-700 mb-1">Minimum Rental (days)</label>
                          <input
                            id="editMinimumRentalPeriod"
                            type="number"
                            value={editingEquipment.minimum_rental_period || 1}
                            onChange={e => setEditingEquipment({ ...editingEquipment, minimum_rental_period: Number(e.target.value) })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="1"
                            min="1"
                          />
                        </div>

                        <div>
                          <label htmlFor="editMaximumRentalPeriod" className="block text-sm font-medium text-slate-700 mb-1">Maximum Rental (days)</label>
                          <input
                            id="editMaximumRentalPeriod"
                            type="number"
                            value={editingEquipment.maximum_rental_period || 365}
                            onChange={e => setEditingEquipment({ ...editingEquipment, maximum_rental_period: Number(e.target.value) })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="365"
                            min="1"
                          />
                        </div>

                        <div>
                          <label htmlFor="editAdvanceBookingDays" className="block text-sm font-medium text-slate-700 mb-1">Advance Booking (days)</label>
                          <input
                            id="editAdvanceBookingDays"
                            type="number"
                            value={editingEquipment.advance_booking_days || 30}
                            onChange={e => setEditingEquipment({ ...editingEquipment, advance_booking_days: Number(e.target.value) })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="30"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Operator Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center">
                          <input
                            id="editOperatorLicenseRequired"
                            type="checkbox"
                            checked={editingEquipment.operator_license_required || false}
                            onChange={e => setEditingEquipment({ ...editingEquipment, operator_license_required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editOperatorLicenseRequired" className="ml-2 block text-sm text-slate-700">
                            Operator License Required
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="editTrainingRequired"
                            type="checkbox"
                            checked={editingEquipment.training_required || false}
                            onChange={e => setEditingEquipment({ ...editingEquipment, training_required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editTrainingRequired" className="ml-2 block text-sm text-slate-700">
                            Training Required
                          </label>
                        </div>

                        <div>
                          <label htmlFor="editAgeRestriction" className="block text-sm font-medium text-slate-700 mb-1">Minimum Age</label>
                          <input
                            id="editAgeRestriction"
                            type="number"
                            value={editingEquipment.age_restriction || 18}
                            onChange={e => setEditingEquipment({ ...editingEquipment, age_restriction: Number(e.target.value) })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="18"
                            min="16"
                            max="65"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            id="editInsuranceRequired"
                            type="checkbox"
                            checked={editingEquipment.insurance_required || true}
                            onChange={e => setEditingEquipment({ ...editingEquipment, insurance_required: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            disabled={actionLoading}
                          />
                          <label htmlFor="editInsuranceRequired" className="ml-2 block text-sm text-slate-700">
                            Insurance Required
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editActiveTab === 'documentation' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipment Documentation</h3>
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="editManualUrl" className="block text-sm font-medium text-slate-700 mb-1">Operating Manual URL</label>
                          <input
                            id="editManualUrl"
                            type="url"
                            value={editingEquipment.manual_url || ''}
                            onChange={e => setEditingEquipment({ ...editingEquipment, manual_url: e.target.value })}
                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={actionLoading}
                            placeholder="https://example.com/manual.pdf"
                          />
                          <p className="text-xs text-slate-500 mt-1">Link to equipment operating manual or documentation</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-6">
                          <h4 className="font-medium text-slate-900 mb-3">Equipment Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-600">Name:</span>
                              <span className="ml-2 font-medium">{editingEquipment.name || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Category:</span>
                              <span className="ml-2 font-medium">
                                {categories.find(c => c.id === editingEquipment.category)?.name || 'Not selected'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Daily Rate:</span>
                              <span className="ml-2 font-medium">${editingEquipment.daily_rate || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Status:</span>
                              <span className="ml-2 font-medium">{editingEquipment.availability_status || 'Available'}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Featured:</span>
                              <span className="ml-2 font-medium">{editingEquipment.is_featured ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                              <span className="text-slate-600">Delivery:</span>
                              <span className="ml-2 font-medium">{editingEquipment.delivery_available ? 'Available' : 'Not available'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex">
                            <RiInformationLine className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-green-900">Ready to Update Equipment</h4>
                              <p className="text-sm text-green-700 mt-1">
                                Review all the information above and click &quot;Update Equipment&quot; to save your changes.
                                All modifications will be immediately available to users.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-200 flex justify-between">
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setEditActiveTab(tab.id)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        editActiveTab === tab.id ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      title={tab.label}
                    />
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEquipment({});
                      setEditImage(null);
                      setEditActiveTab('basic');
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateEquipment}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] shadow-sm disabled:opacity-50"
                    disabled={actionLoading || !editingEquipment.name || !editingEquipment.daily_rate || !editingEquipment.category}
                  >
                    {actionLoading ? 'Updating...' : 'Update Equipment'}
                  </button>
                </div>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Equipment Image Header */}
              <div className="relative h-64 bg-slate-100">
                <Image
                  src={selectedEquipment.image}
                  alt={selectedEquipment.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                  title="Close modal"
                >
                  <RiCloseLine className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedEquipment.name}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <FiTag className="w-4 h-4 mr-1" />
                      {selectedEquipment.category_name}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEquipment.availability_status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      selectedEquipment.availability_status === 'RENTED' ? 'bg-orange-100 text-orange-800' :
                      selectedEquipment.availability_status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedEquipment.availability_status}
                    </span>
                    {selectedEquipment.is_featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        <FiStar className="w-4 h-4 mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{selectedEquipment.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Pricing Section */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Pricing</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Daily Rate:</span>
                        <span className="font-semibold text-slate-900">${selectedEquipment.daily_rate}</span>
                      </div>
                      {selectedEquipment.weekly_rate && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Weekly Rate:</span>
                          <span className="font-semibold text-slate-900">${selectedEquipment.weekly_rate}</span>
                        </div>
                      )}
                      {selectedEquipment.monthly_rate && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Monthly Rate:</span>
                          <span className="font-semibold text-slate-900">${selectedEquipment.monthly_rate}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Security Deposit:</span>
                        <span className="font-semibold text-slate-900">${selectedEquipment.security_deposit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {selectedEquipment.operating_weight && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Operating Weight:</span>
                          <span className="font-semibold text-slate-900">{selectedEquipment.operating_weight}</span>
                        </div>
                      )}
                      {selectedEquipment.engine_power && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Engine Power:</span>
                          <span className="font-semibold text-slate-900">{selectedEquipment.engine_power}</span>
                        </div>
                      )}
                      {selectedEquipment.blade_capacity && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Blade Capacity:</span>
                          <span className="font-semibold text-slate-900">{selectedEquipment.blade_capacity}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Condition:</span>
                        <span className="font-semibold text-slate-900">{selectedEquipment.condition_rating}/5 stars</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedEquipment.gps_ready ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600">GPS Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedEquipment.air_conditioning ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600">Air Conditioning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedEquipment.hydraulic_system ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600">Hydraulic System</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedEquipment.delivery_available ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600">Delivery Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Rental Requirements */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">Rental Requirements</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Min Rental:</span>
                        <span className="font-semibold text-slate-900">{selectedEquipment.minimum_rental_period} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Max Rental:</span>
                        <span className="font-semibold text-slate-900">{selectedEquipment.maximum_rental_period} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Min Age:</span>
                        <span className="font-semibold text-slate-900">{selectedEquipment.age_restriction} years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedEquipment.operator_license_required ? 'bg-orange-500' : 'bg-slate-300'}`}></span>
                        <span className="text-slate-600">License Required</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Asset Information */}
                {(selectedEquipment.serial_number || selectedEquipment.asset_tag || selectedEquipment.current_location) && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Asset Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedEquipment.serial_number && (
                        <div>
                          <span className="text-slate-600">Serial Number:</span>
                          <span className="ml-2 font-semibold text-slate-900">{selectedEquipment.serial_number}</span>
                        </div>
                      )}
                      {selectedEquipment.asset_tag && (
                        <div>
                          <span className="text-slate-600">Asset Tag:</span>
                          <span className="ml-2 font-semibold text-slate-900">{selectedEquipment.asset_tag}</span>
                        </div>
                      )}
                      {selectedEquipment.current_location && (
                        <div>
                          <span className="text-slate-600">Current Location:</span>
                          <span className="ml-2 font-semibold text-slate-900">{selectedEquipment.current_location}</span>
                        </div>
                      )}
                      {selectedEquipment.service_hours > 0 && (
                        <div>
                          <span className="text-slate-600">Service Hours:</span>
                          <span className="ml-2 font-semibold text-slate-900">{selectedEquipment.service_hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEditEquipment(selectedEquipment);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Edit Equipment
                  </button>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}