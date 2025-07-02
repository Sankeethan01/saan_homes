'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiInformationLine,
  RiPriceTag3Line,
  RiSettings3Line,
  RiTruckLine,
  RiShieldCheckLine,
  RiFileTextLine,
} from 'react-icons/ri';
import { FiStar } from 'react-icons/fi';
import Image from 'next/image';
import { useAuthStore } from '@/app/stores/useAuthStore';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface NewEquipment {
  name: string;
  description: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
  security_deposit: number;
  late_return_fee: number;
  category: number;
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
}

export default function NewEquipmentPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [equipment, setEquipment] = useState<NewEquipment>({
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
  
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clear);

  // Tab configuration
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
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token, router, clearToken]);

  const handleSave = async () => {
    if (!equipment.name || !equipment.daily_rate || !equipment.category) {
      alert('Please fill in all required fields (Name, Daily Rate, Category)');
      return;
    }
    
    setSaving(true);
    
    try {
      const formData = new FormData();
      
      // Basic Information
      formData.append('name', equipment.name);
      formData.append('description', equipment.description || '');
      formData.append('category', equipment.category.toString());
      if (newImage) {
        formData.append('image', newImage);
      }
      
      // Pricing
      formData.append('daily_rate', equipment.daily_rate.toString());
      if (equipment.weekly_rate) formData.append('weekly_rate', equipment.weekly_rate.toString());
      if (equipment.monthly_rate) formData.append('monthly_rate', equipment.monthly_rate.toString());
      formData.append('security_deposit', equipment.security_deposit.toString());
      formData.append('late_return_fee', equipment.late_return_fee.toString());
      
      // Status & Availability
      formData.append('availability_status', equipment.availability_status);
      formData.append('is_featured', equipment.is_featured.toString());
      
      // Technical Specifications
      if (equipment.operating_weight) formData.append('operating_weight', equipment.operating_weight);
      if (equipment.engine_power) formData.append('engine_power', equipment.engine_power);
      if (equipment.blade_capacity) formData.append('blade_capacity', equipment.blade_capacity);
      if (equipment.fuel_capacity) formData.append('fuel_capacity', equipment.fuel_capacity);
      if (equipment.max_speed) formData.append('max_speed', equipment.max_speed);
      if (equipment.length) formData.append('length', equipment.length);
      if (equipment.width) formData.append('width', equipment.width);
      if (equipment.height) formData.append('height', equipment.height);
      
      // Features
      formData.append('gps_ready', equipment.gps_ready.toString());
      formData.append('air_conditioning', equipment.air_conditioning.toString());
      formData.append('hydraulic_system', equipment.hydraulic_system.toString());
      
      // Operational Details
      if (equipment.current_location) formData.append('current_location', equipment.current_location);
      if (equipment.pickup_location) formData.append('pickup_location', equipment.pickup_location);
      formData.append('delivery_available', equipment.delivery_available.toString());
      formData.append('delivery_radius', equipment.delivery_radius.toString());
      formData.append('delivery_fee', equipment.delivery_fee.toString());
      
      // Maintenance & Condition
      formData.append('condition_rating', equipment.condition_rating.toString());
      if (equipment.last_service_date) formData.append('last_service_date', equipment.last_service_date);
      if (equipment.next_service_due) formData.append('next_service_due', equipment.next_service_due);
      formData.append('service_hours', equipment.service_hours.toString());
      
      // Asset Management
      if (equipment.serial_number) formData.append('serial_number', equipment.serial_number);
      if (equipment.asset_tag) formData.append('asset_tag', equipment.asset_tag);
      if (equipment.purchase_date) formData.append('purchase_date', equipment.purchase_date);
      if (equipment.depreciation_value) formData.append('depreciation_value', equipment.depreciation_value.toString());
      
      // Rental Requirements
      formData.append('minimum_rental_period', equipment.minimum_rental_period.toString());
      formData.append('maximum_rental_period', equipment.maximum_rental_period.toString());
      formData.append('advance_booking_days', equipment.advance_booking_days.toString());
      formData.append('operator_license_required', equipment.operator_license_required.toString());
      formData.append('training_required', equipment.training_required.toString());
      formData.append('age_restriction', equipment.age_restriction.toString());
      formData.append('insurance_required', equipment.insurance_required.toString());
      
      // Documentation
      if (equipment.manual_url) formData.append('manual_url', equipment.manual_url);

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
      router.push(`/dashboard/admin/equipments/equipments/${data.id}`);
    } catch {
      alert('Error adding equipment.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
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
          onClick={() => router.back()}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-md hover:from-blue-600 hover:to-[#1b4965] transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Go back"
              >
                <RiArrowLeftLine className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Add New Equipment</h1>
                <p className="text-sm text-slate-600">Create a new equipment entry</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors disabled:opacity-50"
                disabled={saving || !equipment.name || !equipment.daily_rate || !equipment.category}
              >
                <RiSaveLine className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Equipment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-8">
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Basic Information</h2>
                  <p className="text-slate-600">Enter the basic details about the equipment</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="equipmentImage" className="block text-sm font-medium text-slate-700 mb-2">Equipment Photo *</label>
                    {newImage && (
                      <div className="relative h-48 w-48 mb-4 rounded-lg overflow-hidden border border-slate-200">
                        <Image
                          src={URL.createObjectURL(newImage)}
                          alt="Preview"
                          fill
                          className="object-cover object-center"
                          sizes="192px"
                        />
                      </div>
                    )}
                    <input
                      id="equipmentImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="equipmentName" className="block text-sm font-medium text-slate-700 mb-2">Equipment Name *</label>
                      <input
                        id="equipmentName"
                        type="text"
                        value={equipment.name}
                        onChange={e => setEquipment({ ...equipment, name: e.target.value })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                        placeholder="Enter equipment name"
                      />
                    </div>

                    <div>
                      <label htmlFor="equipmentCategory" className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                      <select
                        id="equipmentCategory"
                        value={equipment.category}
                        onChange={e => setEquipment({ ...equipment, category: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="equipmentDescription" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      id="equipmentDescription"
                      value={equipment.description}
                      onChange={e => setEquipment({ ...equipment, description: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      disabled={saving}
                      placeholder="Enter equipment description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="availabilityStatus" className="block text-sm font-medium text-slate-700 mb-2">Availability Status</label>
                      <select
                        id="availabilityStatus"
                        value={equipment.availability_status}
                        onChange={e => setEquipment({ ...equipment, availability_status: e.target.value as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE' })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="RENTED">Currently Rented</option>
                        <option value="MAINTENANCE">Under Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-8">
                      <input
                        id="isFeatured"
                        type="checkbox"
                        checked={equipment.is_featured}
                        onChange={e => setEquipment({ ...equipment, is_featured: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        disabled={saving}
                      />
                      <label htmlFor="isFeatured" className="ml-3 block text-sm text-slate-700">
                        <FiStar className="inline w-4 h-4 mr-1" />
                        Featured Equipment (show on homepage)
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Pricing Information</h2>
                  <p className="text-slate-600">Set the rental rates and pricing details</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="dailyRate" className="block text-sm font-medium text-slate-700 mb-2">Daily Rate (LKR) *</label>
                      <input
                        id="dailyRate"
                        type="number"
                        value={equipment.daily_rate}
                        onChange={e => setEquipment({ ...equipment, daily_rate: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                        placeholder="600"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label htmlFor="weeklyRate" className="block text-sm font-medium text-slate-700 mb-2">Weekly Rate (LKR)</label>
                      <input
                        id="weeklyRate"
                        type="number"
                        value={equipment.weekly_rate || 0}
                        onChange={e => setEquipment({ ...equipment, weekly_rate: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                        placeholder="3500"
                        min="0"
                        step="0.01"
                      />
                      {equipment.daily_rate && equipment.weekly_rate && (
                        <p className="text-xs text-green-600 mt-1">
                          {((1 - (equipment.weekly_rate / (equipment.daily_rate * 7))) * 100).toFixed(1)}% discount
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="monthlyRate" className="block text-sm font-medium text-slate-700 mb-2">Monthly Rate (LKR)</label>
                      <input
                        id="monthlyRate"
                        type="number"
                        value={equipment.monthly_rate || 0}
                        onChange={e => setEquipment({ ...equipment, monthly_rate: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                        placeholder="12000"
                        min="0"
                        step="0.01"
                      />
                      {equipment.daily_rate && equipment.monthly_rate && (
                        <p className="text-xs text-green-600 mt-1">
                          {((1 - (equipment.monthly_rate / (equipment.daily_rate * 30))) * 100).toFixed(1)}% discount
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="securityDeposit" className="block text-sm font-medium text-slate-700 mb-2">Security Deposit (LKR)</label>
                      <input
                        id="securityDeposit"
                        type="number"
                        value={equipment.security_deposit}
                        onChange={e => setEquipment({ ...equipment, security_deposit: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                        placeholder="500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label htmlFor="lateReturnFee" className="block text-sm font-medium text-slate-700 mb-2">Late Return Fee (LKR/day)</label>
                      <input
                        id="lateReturnFee"
                        type="number"
                        value={equipment.late_return_fee}
                        onChange={e => setEquipment({ ...equipment, late_return_fee: Number(e.target.value) })}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                        placeholder="50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-medium text-blue-900 mb-2">Pricing Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Daily:</span>
                        <span className="ml-2 font-medium text-blue-900">LKR {equipment.daily_rate || 0}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Weekly:</span>
                        <span className="ml-2 font-medium text-blue-900">LKR {equipment.weekly_rate || 0}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Monthly:</span>
                        <span className="ml-2 font-medium text-blue-900">LKR {equipment.monthly_rate || 0}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Deposit:</span>
                        <span className="ml-2 font-medium text-blue-900">LKR {equipment.security_deposit || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Add other tabs content here - specs, operational, requirements, documentation */}
            {/* For brevity, I'll add a placeholder for now */}
            {activeTab !== 'basic' && activeTab !== 'pricing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-slate-600">This section is under development</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Technical Specifications</h2>
                  <p className="text-slate-600">Define the technical details and specifications</p>
                </div>

                <div className="space-y-8">
                  {/* Technical Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipment Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="operatingWeight" className="block text-sm font-medium text-slate-700 mb-2">Operating Weight</label>
                        <input
                          id="operatingWeight"
                          type="text"
                          value={equipment.operating_weight || ''}
                          onChange={e => setEquipment({ ...equipment, operating_weight: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 18 tons"
                        />
                      </div>

                      <div>
                        <label htmlFor="enginePower" className="block text-sm font-medium text-slate-700 mb-2">Engine Power</label>
                        <input
                          id="enginePower"
                          type="text"
                          value={equipment.engine_power || ''}
                          onChange={e => setEquipment({ ...equipment, engine_power: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 168 hp"
                        />
                      </div>

                      <div>
                        <label htmlFor="bladeCapacity" className="block text-sm font-medium text-slate-700 mb-2">Blade/Bucket Capacity</label>
                        <input
                          id="bladeCapacity"
                          type="text"
                          value={equipment.blade_capacity || ''}
                          onChange={e => setEquipment({ ...equipment, blade_capacity: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 4.5 cubic yards"
                        />
                      </div>

                      <div>
                        <label htmlFor="fuelCapacity" className="block text-sm font-medium text-slate-700 mb-2">Fuel Capacity</label>
                        <input
                          id="fuelCapacity"
                          type="text"
                          value={equipment.fuel_capacity || ''}
                          onChange={e => setEquipment({ ...equipment, fuel_capacity: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 50 gallons"
                        />
                      </div>

                      <div>
                        <label htmlFor="maxSpeed" className="block text-sm font-medium text-slate-700 mb-2">Maximum Speed</label>
                        <input
                          id="maxSpeed"
                          type="text"
                          value={equipment.max_speed || ''}
                          onChange={e => setEquipment({ ...equipment, max_speed: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 25 mph"
                        />
                      </div>

                      <div>
                        <label htmlFor="conditionRating" className="block text-sm font-medium text-slate-700 mb-2">Condition Rating</label>
                        <select
                          id="conditionRating"
                          value={equipment.condition_rating}
                          onChange={e => setEquipment({ ...equipment, condition_rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
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

                  {/* Dimensions */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Dimensions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="length" className="block text-sm font-medium text-slate-700 mb-2">Length</label>
                        <input
                          id="length"
                          type="text"
                          value={equipment.length || ''}
                          onChange={e => setEquipment({ ...equipment, length: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 8.5m"
                        />
                      </div>

                      <div>
                        <label htmlFor="width" className="block text-sm font-medium text-slate-700 mb-2">Width</label>
                        <input
                          id="width"
                          type="text"
                          value={equipment.width || ''}
                          onChange={e => setEquipment({ ...equipment, width: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 2.8m"
                        />
                      </div>

                      <div>
                        <label htmlFor="height" className="block text-sm font-medium text-slate-700 mb-2">Height</label>
                        <input
                          id="height"
                          type="text"
                          value={equipment.height || ''}
                          onChange={e => setEquipment({ ...equipment, height: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., 3.2m"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipment Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center">
                        <input
                          id="gpsReady"
                          type="checkbox"
                          checked={equipment.gps_ready}
                          onChange={e => setEquipment({ ...equipment, gps_ready: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="gpsReady" className="ml-3 block text-sm text-slate-700">
                          GPS Ready
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="airConditioning"
                          type="checkbox"
                          checked={equipment.air_conditioning}
                          onChange={e => setEquipment({ ...equipment, air_conditioning: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="airConditioning" className="ml-3 block text-sm text-slate-700">
                          Air Conditioning
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="hydraulicSystem"
                          type="checkbox"
                          checked={equipment.hydraulic_system}
                          onChange={e => setEquipment({ ...equipment, hydraulic_system: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="hydraulicSystem" className="ml-3 block text-sm text-slate-700">
                          Hydraulic System
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="serviceHours" className="block text-sm font-medium text-slate-700 mb-2">Service Hours</label>
                        <input
                          id="serviceHours"
                          type="number"
                          value={equipment.service_hours}
                          onChange={e => setEquipment({ ...equipment, service_hours: Number(e.target.value) })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastServiceDate" className="block text-sm font-medium text-slate-700 mb-2">Last Service Date</label>
                        <input
                          id="lastServiceDate"
                          type="date"
                          value={equipment.last_service_date || ''}
                          onChange={e => setEquipment({ ...equipment, last_service_date: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                        />
                      </div>

                      <div>
                        <label htmlFor="nextServiceDue" className="block text-sm font-medium text-slate-700 mb-2">Next Service Due</label>
                        <input
                          id="nextServiceDue"
                          type="date"
                          value={equipment.next_service_due || ''}
                          onChange={e => setEquipment({ ...equipment, next_service_due: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'operational' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Operational Details</h2>
                  <p className="text-slate-600">Configure location, delivery, and asset management</p>
                </div>

                <div className="space-y-8">
                  {/* Location Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="currentLocation" className="block text-sm font-medium text-slate-700 mb-2">Current Location</label>
                        <input
                          id="currentLocation"
                          type="text"
                          value={equipment.current_location || ''}
                          onChange={e => setEquipment({ ...equipment, current_location: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., Main Depot"
                        />
                      </div>

                      <div>
                        <label htmlFor="pickupLocation" className="block text-sm font-medium text-slate-700 mb-2">Pickup Location</label>
                        <input
                          id="pickupLocation"
                          type="text"
                          value={equipment.pickup_location || ''}
                          onChange={e => setEquipment({ ...equipment, pickup_location: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., Warehouse A"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Delivery Options</h3>
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <input
                          id="deliveryAvailable"
                          type="checkbox"
                          checked={equipment.delivery_available}
                          onChange={e => setEquipment({ ...equipment, delivery_available: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="deliveryAvailable" className="ml-3 block text-sm text-slate-700">
                          Delivery Available
                        </label>
                      </div>

                      {equipment.delivery_available && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                          <div>
                            <label htmlFor="deliveryRadius" className="block text-sm font-medium text-slate-700 mb-2">Delivery Radius (km)</label>
                            <input
                              id="deliveryRadius"
                              type="number"
                              value={equipment.delivery_radius}
                              onChange={e => setEquipment({ ...equipment, delivery_radius: Number(e.target.value) })}
                              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={saving}
                              placeholder="50"
                              min="0"
                            />
                          </div>

                          <div>
                            <label htmlFor="deliveryFee" className="block text-sm font-medium text-slate-700 mb-2">Delivery Fee (LKR)</label>
                            <input
                              id="deliveryFee"
                              type="number"
                              value={equipment.delivery_fee}
                              onChange={e => setEquipment({ ...equipment, delivery_fee: Number(e.target.value) })}
                              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={saving}
                              placeholder="100"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Asset Management */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Asset Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-slate-700 mb-2">Serial Number</label>
                        <input
                          id="serialNumber"
                          type="text"
                          value={equipment.serial_number || ''}
                          onChange={e => setEquipment({ ...equipment, serial_number: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., CM-2024-001"
                        />
                      </div>

                      <div>
                        <label htmlFor="assetTag" className="block text-sm font-medium text-slate-700 mb-2">Asset Tag</label>
                        <input
                          id="assetTag"
                          type="text"
                          value={equipment.asset_tag || ''}
                          onChange={e => setEquipment({ ...equipment, asset_tag: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="e.g., SAAN-EQ-001"
                        />
                      </div>

                      <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
                        <input
                          id="purchaseDate"
                          type="date"
                          value={equipment.purchase_date || ''}
                          onChange={e => setEquipment({ ...equipment, purchase_date: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                        />
                      </div>

                      <div>
                        <label htmlFor="depreciationValue" className="block text-sm font-medium text-slate-700 mb-2">Current Value (LKR)</label>
                        <input
                          id="depreciationValue"
                          type="number"
                          value={equipment.depreciation_value || 0}
                          onChange={e => setEquipment({ ...equipment, depreciation_value: Number(e.target.value) })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="50000"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'requirements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Rental Requirements</h2>
                  <p className="text-slate-600">Set rental periods and operator requirements</p>
                </div>

                <div className="space-y-8">
                  {/* Rental Periods */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Rental Period Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="minimumRentalPeriod" className="block text-sm font-medium text-slate-700 mb-2">Minimum Rental (days)</label>
                        <input
                          id="minimumRentalPeriod"
                          type="number"
                          value={equipment.minimum_rental_period}
                          onChange={e => setEquipment({ ...equipment, minimum_rental_period: Number(e.target.value) })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="1"
                          min="1"
                        />
                      </div>

                      <div>
                        <label htmlFor="maximumRentalPeriod" className="block text-sm font-medium text-slate-700 mb-2">Maximum Rental (days)</label>
                        <input
                          id="maximumRentalPeriod"
                          type="number"
                          value={equipment.maximum_rental_period}
                          onChange={e => setEquipment({ ...equipment, maximum_rental_period: Number(e.target.value) })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="365"
                          min="1"
                        />
                      </div>

                      <div>
                        <label htmlFor="advanceBookingDays" className="block text-sm font-medium text-slate-700 mb-2">Advance Booking (days)</label>
                        <input
                          id="advanceBookingDays"
                          type="number"
                          value={equipment.advance_booking_days}
                          onChange={e => setEquipment({ ...equipment, advance_booking_days: Number(e.target.value) })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="30"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operator Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Operator Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <input
                          id="operatorLicenseRequired"
                          type="checkbox"
                          checked={equipment.operator_license_required}
                          onChange={e => setEquipment({ ...equipment, operator_license_required: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="operatorLicenseRequired" className="ml-3 block text-sm text-slate-700">
                          Operator License Required
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="trainingRequired"
                          type="checkbox"
                          checked={equipment.training_required}
                          onChange={e => setEquipment({ ...equipment, training_required: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="trainingRequired" className="ml-3 block text-sm text-slate-700">
                          Training Required
                        </label>
                      </div>

                      <div>
                        <label htmlFor="ageRestriction" className="block text-sm font-medium text-slate-700 mb-2">Minimum Age</label>
                        <input
                          id="ageRestriction"
                          type="number"
                          value={equipment.age_restriction}
                          onChange={e => setEquipment({ ...equipment, age_restriction: Number(e.target.value) })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="18"
                          min="16"
                          max="65"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          id="insuranceRequired"
                          type="checkbox"
                          checked={equipment.insurance_required}
                          onChange={e => setEquipment({ ...equipment, insurance_required: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          disabled={saving}
                        />
                        <label htmlFor="insuranceRequired" className="ml-3 block text-sm text-slate-700">
                          Insurance Required
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Requirements Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="font-medium text-slate-900 mb-3">Requirements Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Min Period:</span>
                        <span className="ml-2 font-medium text-slate-900">{equipment.minimum_rental_period} days</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Max Period:</span>
                        <span className="ml-2 font-medium text-slate-900">{equipment.maximum_rental_period} days</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Min Age:</span>
                        <span className="ml-2 font-medium text-slate-900">{equipment.age_restriction} years</span>
                      </div>
                      <div>
                        <span className="text-slate-600">License:</span>
                        <span className="ml-2 font-medium text-slate-900">{equipment.operator_license_required ? 'Required' : 'Not Required'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documentation' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Documentation</h2>
                  <p className="text-slate-600">Add manuals and documentation links</p>
                </div>

                <div className="space-y-8">
                  {/* Documentation */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipment Documentation</h3>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="manualUrl" className="block text-sm font-medium text-slate-700 mb-2">Operating Manual URL</label>
                        <input
                          id="manualUrl"
                          type="url"
                          value={equipment.manual_url || ''}
                          onChange={e => setEquipment({ ...equipment, manual_url: e.target.value })}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={saving}
                          placeholder="https://example.com/manual.pdf"
                        />
                        <p className="text-xs text-slate-500 mt-1">Link to equipment operating manual or documentation</p>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <h3 className="font-medium text-slate-900 mb-4">Equipment Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Basic Information</h4>
                        <div className="space-y-1">
                          <div><span className="text-slate-600">Name:</span> <span className="ml-2 font-medium">{equipment.name || 'Not specified'}</span></div>
                          <div><span className="text-slate-600">Category:</span> <span className="ml-2 font-medium">{categories.find(c => c.id === equipment.category)?.name || 'Not selected'}</span></div>
                          <div><span className="text-slate-600">Status:</span> <span className="ml-2 font-medium">{equipment.availability_status}</span></div>
                          <div><span className="text-slate-600">Featured:</span> <span className="ml-2 font-medium">{equipment.is_featured ? 'Yes' : 'No'}</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Pricing</h4>
                        <div className="space-y-1">
                          <div><span className="text-slate-600">Daily Rate:</span> <span className="ml-2 font-medium">LKR {equipment.daily_rate || 0}</span></div>
                          <div><span className="text-slate-600">Weekly Rate:</span> <span className="ml-2 font-medium">LKR {equipment.weekly_rate || 0}</span></div>
                          <div><span className="text-slate-600">Monthly Rate:</span> <span className="ml-2 font-medium">LKR {equipment.monthly_rate || 0}</span></div>
                          <div><span className="text-slate-600">Security Deposit:</span> <span className="ml-2 font-medium">LKR {equipment.security_deposit || 0}</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Specifications</h4>
                        <div className="space-y-1">
                          <div><span className="text-slate-600">Operating Weight:</span> <span className="ml-2 font-medium">{equipment.operating_weight || 'Not specified'}</span></div>
                          <div><span className="text-slate-600">Engine Power:</span> <span className="ml-2 font-medium">{equipment.engine_power || 'Not specified'}</span></div>
                          <div><span className="text-slate-600">Condition:</span> <span className="ml-2 font-medium">{equipment.condition_rating}/5</span></div>
                          <div><span className="text-slate-600">GPS Ready:</span> <span className="ml-2 font-medium">{equipment.gps_ready ? 'Yes' : 'No'}</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Operations</h4>
                        <div className="space-y-1">
                          <div><span className="text-slate-600">Delivery:</span> <span className="ml-2 font-medium">{equipment.delivery_available ? 'Available' : 'Not available'}</span></div>
                          <div><span className="text-slate-600">Min Rental:</span> <span className="ml-2 font-medium">{equipment.minimum_rental_period} days</span></div>
                          <div><span className="text-slate-600">License Required:</span> <span className="ml-2 font-medium">{equipment.operator_license_required ? 'Yes' : 'No'}</span></div>
                          <div><span className="text-slate-600">Insurance:</span> <span className="ml-2 font-medium">{equipment.insurance_required ? 'Required' : 'Not required'}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ready to Save */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex">
                      <RiInformationLine className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="ml-3">
                                                 <h4 className="text-sm font-medium text-blue-900">Ready to Add Equipment</h4>
                         <p className="text-sm text-blue-700 mt-1">
                           Review all the information above and click &ldquo;Save Equipment&rdquo; to add this equipment to your inventory.
                           You can always edit these details later from the equipment management page.
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 