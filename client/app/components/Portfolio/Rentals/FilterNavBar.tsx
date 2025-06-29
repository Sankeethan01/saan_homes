'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiUser3Line, RiDashboardLine, RiLogoutBoxRLine, RiArrowDownSLine } from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';


interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  equipment_count: number;
}

interface FilterSectionProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  selectedCategory: string;
}

const FilterSectionRentalsPortfolio = ({ 
  onSearchChange, 
  onCategoryChange, 
  searchQuery, 
  selectedCategory 
}: FilterSectionProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token, clear } = useAuthStore();
  const router = useRouter();

  // Fetch categories from backend (no auth required)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiBaseUrl}/equipments/categories/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Handle logout
  const handleLogout = () => {
    clear();
    setShowDropdown(false);
    router.push('/');
  };

  // Create category options for dropdown
  const categoryOptions = [
    { name: 'All Equipment', count: categories.reduce((sum, cat) => sum + cat.equipment_count, 0) },
    ...categories.map(cat => ({ name: cat.name, count: cat.equipment_count }))
  ];

  return (
    <section className="py-3 px-2 bg-white shadow-md sticky top-0 z-60">
      <div className="container mx-auto px-4 pt-2">
        <div className="flex items-center justify-between w-full mb-4">
          {/* All in one row: logo, filter, search, login */}
          <div className="flex items-center w-full gap-6">
            {/* Logo only, actual shape */}
            <Link href="/" className="flex items-center">
              <Image src="/assets/logo.jpg" alt="Logo" width={100} height={100} />
            </Link>
            
            {/* Filter and search options */}
            <div className="flex flex-1 gap-4 items-center">
              {/* Category Filter Dropdown */}
              <div className="relative w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                  disabled={loading}
                  aria-label="Filter equipment by category"
                >
                  {loading ? (
                    <option>Loading categories...</option>
                  ) : (
                    categoryOptions.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <RiFilter3Line className="text-gray-400 text-xl" />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-72">
                <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Keep original right side buttons */}
            {/* User icon button or Profile dropdown */}
            {token ? (
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1b4965] hover:bg-[#1b4965]-700 text-white transition-all duration-200 relative"
                  aria-label="Profile menu"
                  title="Profile menu"
                >
                  <RiUser3Line className="text-2xl" />
                  <RiArrowDownSLine className="text-sm absolute -bottom-1 -right-1 bg-[#1b4965] rounded-full" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link href="/dashboard/me" onClick={() => setShowDropdown(false)}>
                      <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <RiDashboardLine className="text-lg mr-3" />
                        Dashboard
                      </div>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <RiLogoutBoxRLine className="text-lg mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/dashboard/login">
                <button 
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1b4965] hover:bg-[#1b4965]-700 text-white transition-all duration-200"
                  aria-label="Login"
                  title="Login"
                >
                  <RiUser3Line className="text-2xl" />
                </button>
              </Link>
            )}
            
            {/* Home Button */}
            <Link href="/">
              <button 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1b4965] hover:bg-[#1b4965]-700 text-white transition-all duration-200"
                aria-label="Home"
                title="Home"
              >
                <RiHome5Line className="text-2xl" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSectionRentalsPortfolio;