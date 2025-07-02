 'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiEditLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiPriceTag3Line,
  RiSettings3Line,
  RiTruckLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiStarLine,
} from 'react-icons/ri';
import { FiTag, FiStar } from 'react-icons/fi';
import Image from 'next/image';
import { useAuthStore } from '@/app/stores/useAuthStore';

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

export default function EquipmentDetailsPage() {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.equipmentId as string;
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchEquipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/${equipmentId}/`, {
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
          if (response.status === 404) {
            setError('Equipment not found');
            return;
          }
          throw new Error('Failed to fetch equipment');
        }

        const data = await response.json();
        setEquipment(data);
      } catch {
        setError('Error loading equipment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId, token, router, clearToken]);

  const handleDelete = async () => {
    if (!equipment || !confirm('Are you sure you want to delete this equipment?')) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/${equipment.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete equipment');
      
      router.push('/dashboard/admin/equipments/equipments');
    } catch {
      alert('Error deleting equipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/admin/equipments/equipments?edit=${equipmentId}`);
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

  if (!equipment) {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-600 mb-4">Equipment not found</div>
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
                <h1 className="text-xl font-semibold text-slate-900">{equipment.name}</h1>
                <p className="text-sm text-slate-600">{equipment.category_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-white bg-[#1b4965] rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <RiEditLine className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <RiDeleteBinLine className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Equipment Image */}
              <div className="relative bg-slate-100 aspect-square">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              
              {/* Basic Info */}
              <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <FiTag className="w-4 h-4 mr-1" />
                    {equipment.category_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    equipment.availability_status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    equipment.availability_status === 'RENTED' ? 'bg-orange-100 text-orange-800' :
                    equipment.availability_status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {equipment.availability_status}
                  </span>
                  {equipment.is_featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <FiStar className="w-4 h-4 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
                
                <p className="text-slate-600 leading-relaxed mb-6">{equipment.description}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">LKR {equipment.daily_rate}</div>
                    <div className="text-sm text-slate-600">Daily Rate</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{equipment.condition_rating}/5</div>
                    <div className="text-sm text-slate-600">Condition</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Pricing Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RiPriceTag3Line className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Pricing Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Daily Rate</div>
                    <div className="text-xl font-bold text-slate-900">LKR {equipment.daily_rate}</div>
                  </div>
                  {equipment.weekly_rate && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-1">Weekly Rate</div>
                      <div className="text-xl font-bold text-slate-900">LKR {equipment.weekly_rate}</div>
                    </div>
                  )}
                  {equipment.monthly_rate && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-1">Monthly Rate</div>
                      <div className="text-xl font-bold text-slate-900">LKR {equipment.monthly_rate}</div>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Security Deposit</div>
                    <div className="text-xl font-bold text-slate-900">LKR {equipment.security_deposit}</div>
                  </div>
                </div>
              </motion.div>

              {/* Technical Specifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RiSettings3Line className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Technical Specifications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {equipment.operating_weight && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Operating Weight</div>
                      <div className="font-medium text-slate-900">{equipment.operating_weight}</div>
                    </div>
                  )}
                  {equipment.engine_power && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Engine Power</div>
                      <div className="font-medium text-slate-900">{equipment.engine_power}</div>
                    </div>
                  )}
                  {equipment.blade_capacity && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Blade/Bucket Capacity</div>
                      <div className="font-medium text-slate-900">{equipment.blade_capacity}</div>
                    </div>
                  )}
                  {equipment.fuel_capacity && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Fuel Capacity</div>
                      <div className="font-medium text-slate-900">{equipment.fuel_capacity}</div>
                    </div>
                  )}
                  {equipment.max_speed && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Maximum Speed</div>
                      <div className="font-medium text-slate-900">{equipment.max_speed}</div>
                    </div>
                  )}
                  {(equipment.length || equipment.width || equipment.height) && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Dimensions (L×W×H)</div>
                      <div className="font-medium text-slate-900">
                        {equipment.length || '—'} × {equipment.width || '—'} × {equipment.height || '—'}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Features & Capabilities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RiStarLine className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Features & Capabilities</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${equipment.gps_ready ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-sm text-slate-700">GPS Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${equipment.air_conditioning ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-sm text-slate-700">Air Conditioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${equipment.hydraulic_system ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-sm text-slate-700">Hydraulic System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${equipment.delivery_available ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-sm text-slate-700">Delivery Available</span>
                  </div>
                </div>
              </motion.div>

              {/* Operational Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RiTruckLine className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Operational Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {equipment.current_location && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Current Location</div>
                      <div className="font-medium text-slate-900">{equipment.current_location}</div>
                    </div>
                  )}
                  {equipment.pickup_location && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Pickup Location</div>
                      <div className="font-medium text-slate-900">{equipment.pickup_location}</div>
                    </div>
                  )}
                  {equipment.delivery_available && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Delivery Radius</div>
                      <div className="font-medium text-slate-900">{equipment.delivery_radius} km</div>
                    </div>
                  )}
                  {equipment.delivery_available && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Delivery Fee</div>
                      <div className="font-medium text-slate-900">LKR {equipment.delivery_fee}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Service Hours</div>
                    <div className="font-medium text-slate-900">{equipment.service_hours} hours</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Condition Rating</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <RiStarLine
                          key={star}
                          className={`w-4 h-4 ${
                            star <= equipment.condition_rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-slate-900">
                        {equipment.condition_rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Rental Requirements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RiShieldCheckLine className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Rental Requirements</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Rental Period</div>
                    <div className="font-medium text-slate-900">
                      {equipment.minimum_rental_period} - {equipment.maximum_rental_period} days
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Advance Booking</div>
                    <div className="font-medium text-slate-900">{equipment.advance_booking_days} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Minimum Age</div>
                    <div className="font-medium text-slate-900">{equipment.age_restriction} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Operator License</div>
                    <div className="font-medium text-slate-900">
                      {equipment.operator_license_required ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Training</div>
                    <div className="font-medium text-slate-900">
                      {equipment.training_required ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Insurance</div>
                    <div className="font-medium text-slate-900">
                      {equipment.insurance_required ? 'Required' : 'Not Required'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Asset Information */}
              {(equipment.serial_number || equipment.asset_tag || equipment.purchase_date) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <RiInformationLine className="w-5 h-5 text-slate-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Asset Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {equipment.serial_number && (
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Serial Number</div>
                        <div className="font-medium text-slate-900">{equipment.serial_number}</div>
                      </div>
                    )}
                    {equipment.asset_tag && (
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Asset Tag</div>
                        <div className="font-medium text-slate-900">{equipment.asset_tag}</div>
                      </div>
                    )}
                    {equipment.purchase_date && (
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Purchase Date</div>
                        <div className="font-medium text-slate-900">
                          {new Date(equipment.purchase_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {equipment.depreciation_value && (
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Current Value</div>
                        <div className="font-medium text-slate-900">LKR {equipment.depreciation_value}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Documentation */}
              {equipment.manual_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <RiFileTextLine className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Documentation</h2>
                  </div>
                  <div>
                    <a
                      href={equipment.manual_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <RiFileTextLine className="w-4 h-4" />
                      Operating Manual
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}