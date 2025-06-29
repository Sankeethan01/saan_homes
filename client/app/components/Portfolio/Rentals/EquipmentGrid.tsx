'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Updated interface to match backend serializer
interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  image: string;
  availability_status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  is_available: boolean;
  is_featured: boolean;
  pricing: {
    daily_rate: number;
    weekly_rate: number | null;
    monthly_rate: number | null;
    security_deposit: number;
    late_return_fee: number;
    weekly_discount?: number;
    monthly_discount?: number;
  };
  specifications: {
    operating_weight?: string;
    engine_power?: string;
    blade_capacity?: string;
    fuel_capacity?: string;
    max_speed?: string;
    dimensions?: {
      length?: string;
      width?: string;
      height?: string;
    };
  };
  features: string[];
  rental_requirements: {
    minimum_rental_period: number;
    maximum_rental_period: number;
    advance_booking_days: number;
    operator_license_required: boolean;
    training_required: boolean;
    age_restriction: number;
    insurance_required: boolean;
    delivery_available: boolean;
    delivery_radius: number;
    delivery_fee: number;
  };
  condition_rating: number;
  current_location: string;
  pickup_location: string;
}

interface EquipmentGridProps {
  searchQuery?: string;
  selectedCategory?: string;
}

const ITEMS_PER_PAGE = 18;

const EquipmentGridRentalsPortfolio = ({ searchQuery = '', selectedCategory = 'All Equipment' }: EquipmentGridProps) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Fetch equipments from backend with random ordering
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        // Fetch equipments with random ordering
        const equipmentsResponse = await fetch(`${apiBaseUrl}/equipments/equipment/?ordering=?`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!equipmentsResponse.ok) {
          throw new Error(`Failed to fetch equipments: ${equipmentsResponse.statusText}`);
        }

        const equipmentsData = await equipmentsResponse.json();
        setEquipments(equipmentsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch equipment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter equipments based on search and category
  const filteredEquipment = equipments.filter(item => {
    const matchesCategory = selectedCategory === 'All Equipment' || 
                           item.category_name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEquipments = filteredEquipment.slice(startIndex, endIndex);

  // Reset to page 1 when search/category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Helper function to get equipment image URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipment.png'; // fallback image
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If it's a relative path, prepend the API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  // Helper function to format features
  const formatFeatures = (equipment: Equipment): string[] => {
    const features: string[] = [];
    
    // Add specifications as features
    if (equipment.specifications.operating_weight) {
      features.push(`Operating Weight: ${equipment.specifications.operating_weight}`);
    }
    if (equipment.specifications.engine_power) {
      features.push(`Engine Power: ${equipment.specifications.engine_power}`);
    }
    if (equipment.specifications.blade_capacity) {
      features.push(`Blade Capacity: ${equipment.specifications.blade_capacity}`);
    }
    if (equipment.specifications.fuel_capacity) {
      features.push(`Fuel Capacity: ${equipment.specifications.fuel_capacity}`);
    }
    
    // Add boolean features
    if (equipment.features && equipment.features.length > 0) {
      features.push(...equipment.features);
    }
    
    // Add delivery info
    if (equipment.rental_requirements.delivery_available) {
      features.push(`Delivery Available (${equipment.rental_requirements.delivery_radius}km radius)`);
    }
    
    return features.slice(0, 4); // Limit to 4 features for display
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex space-x-1">
          {currentPage > 3 && totalPages > 5 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              >
                1
              </button>
              {currentPage > 4 && <span className="px-2 py-2 text-gray-500">...</span>}
            </>
          )}

          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#1b4965] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}

          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2 py-2 text-gray-500">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-800 mb-3">Error Loading Equipment</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (filteredEquipment.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No Equipment Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'All Equipment' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No equipment is currently available.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Results Info */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredEquipment.length)} of {filteredEquipment.length} equipment
              {selectedCategory !== 'All Equipment' && (
                <span className="ml-2 text-[#1b4965] font-medium">in {selectedCategory}</span>
              )}
            </p>
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentEquipments.map((equipment) => (
            <motion.div
              onClick={() => router.push('/equipments/' + equipment.id)}
              key={equipment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={getImageUrl(equipment.image)}
                  alt={equipment.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/equipment.png';
                  }}
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
                    equipment.availability_status === 'AVAILABLE'
                      ? 'bg-green-500 text-white'
                      : equipment.availability_status === 'RENTED'
                      ? 'bg-red-500 text-white'
                      : equipment.availability_status === 'MAINTENANCE'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {equipment.availability_status === 'AVAILABLE' ? 'Available' : 
                     equipment.availability_status === 'RENTED' ? 'Rented' :
                     equipment.availability_status === 'MAINTENANCE' ? 'Maintenance' : 'Out of Service'}
                  </span>
                </div>

                {/* Featured Badge */}
                {equipment.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white uppercase tracking-wide shadow-lg">
                      Featured
                    </span>
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {equipment.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {equipment.description}
                </p>

                {/* Pricing Section */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm font-medium">Daily Rate:</span>
                      <span className="font-bold text-lg text-gray-900">${equipment.pricing.daily_rate}</span>
                    </div>
                    
                    {equipment.pricing.weekly_rate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-medium">Weekly Rate:</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">${equipment.pricing.weekly_rate}</span>
                          {equipment.pricing.weekly_discount && (
                            <span className="text-green-600 text-xs font-medium ml-2 bg-green-100 px-2 py-1 rounded">
                              {equipment.pricing.weekly_discount}% off
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {equipment.pricing.monthly_rate && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-medium">Monthly Rate:</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">${equipment.pricing.monthly_rate}</span>
                          {equipment.pricing.monthly_discount && (
                            <span className="text-green-600 text-xs font-medium ml-2 bg-green-100 px-2 py-1 rounded">
                              {equipment.pricing.monthly_discount}% off
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {formatFeatures(equipment).map((feature, index) => (
                    <div key={index} className="flex items-start text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Location */}
                {equipment.current_location && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Location:</span>
                      <span className="ml-1">{equipment.current_location}</span>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <div className="pt-4">
                  <button className="w-full bg-[#1b4965] text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200">
                    View Details & Book
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        <PaginationControls />
      </div>
    </section>
  );
}

export default EquipmentGridRentalsPortfolio;