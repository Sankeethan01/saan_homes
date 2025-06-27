'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiCalendarLine, RiTimeLine, RiMessage2Line, RiUser3Line, RiHomeSmileLine, RiPaletteLine, RiLeafLine, RiToolsLine, RiLoginCircleLine } from 'react-icons/ri';



interface Equipment {
  id: number;
  name: string;
  category: string;
  image: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  description: string;
  features: string[];
  availability: boolean;
}

const equipmentCategories = [
  'All Equipment',
  'Excavators',
  'Bulldozers',
  'Cranes',
  'Loaders',
  'Trucks',
  'Concrete Equipment'
] as const;

const equipmentList: Equipment[] = [
  {
    id: 1,
    name: 'CAT 320 Excavator',
    category: 'Excavators',
    image: '/rentals/excavator-1.jpg',
    dailyRate: 450,
    weeklyRate: 2800,
    monthlyRate: 9000,
    description: 'Powerful 20-ton excavator perfect for large construction projects.',
    features: [
      'Operating Weight: 20 tons',
      'Dig Depth: 22 ft',
      'Engine Power: 162 hp',
      'Bucket Capacity: 1.5 cubic yards'
    ],
    availability: true
  },
  {
    id: 2,
    name: 'Komatsu D61 Bulldozer',
    category: 'Bulldozers',
    image: '/rentals/bulldozer-1.jpg',
    dailyRate: 600,
    weeklyRate: 3500,
    monthlyRate: 12000,
    description: 'Versatile bulldozer suitable for various earthmoving applications.',
    features: [
      'Operating Weight: 18 tons',
      'Blade Capacity: 4.5 cubic yards',
      'Engine Power: 168 hp',
      'GPS Ready'
    ],
    availability: true
  },
  {
    id: 3,
    name: 'Liebherr LTM 1100 Crane',
    category: 'Cranes',
    image: '/rentals/crane-1.jpg',
    dailyRate: 1200,
    weeklyRate: 7000,
    monthlyRate: 25000,
    description: 'Mobile crane with excellent maneuverability and lifting capacity.',
    features: [
      'Max Lift Capacity: 100 tons',
      'Max Boom Length: 180 ft',
      'All-Terrain Capability',
      'Computer-Aided Control'
    ],
    availability: true
  },
  {
    id: 4,
    name: 'Volvo L120H Wheel Loader',
    category: 'Loaders',
    image: '/rentals/loader-1.jpg',
    dailyRate: 550,
    weeklyRate: 3200,
    monthlyRate: 11000,
    description: 'Versatile wheel loader perfect for material handling and loading operations.',
    features: [
      'Operating Weight: 28 tons',
      'Bucket Capacity: 3.5 cubic yards',
      'Engine Power: 276 hp',
      'Advanced Hydraulics'
    ],
    availability: true
  },
  {
    id: 5,
    name: 'Mack Granite Dump Truck',
    category: 'Trucks',
    image: '/rentals/truck-1.jpg',
    dailyRate: 400,
    weeklyRate: 2400,
    monthlyRate: 8500,
    description: 'Heavy-duty dump truck ideal for construction material transport.',
    features: [
      'Payload Capacity: 40 tons',
      'Engine Power: 455 hp',
      'All-Wheel Drive',
      'Heated Dump Body'
    ],
    availability: false
  },
  {
    id: 6,
    name: 'Putzmeister BSF 38-5 Concrete Pump',
    category: 'Concrete Equipment',
    image: '/rentals/concrete-pump-1.jpg',
    dailyRate: 800,
    weeklyRate: 4800,
    monthlyRate: 16000,
    description: 'High-performance concrete pump truck for efficient concrete placement.',
    features: [
      'Vertical Reach: 126 ft',
      'Max Output: 160 cubic yards/hr',
      'Radio Remote Control',
      '5-Section Boom'
    ],
    availability: true
  },
  {
    id: 7,
    name: 'JCB 3CX Backhoe Loader',
    category: 'Loaders',
    image: '/rentals/backhoe-1.jpg',
    dailyRate: 350,
    weeklyRate: 2000,
    monthlyRate: 7000,
    description: 'Versatile backhoe loader combining loading and excavating capabilities.',
    features: [
      'Dig Depth: 14.6 ft',
      'Loader Capacity: 1.4 cubic yards',
      'Engine Power: 109 hp',
      'Extended Dipper Option'
    ],
    availability: true
  },
  {
    id: 8,
    name: 'Bobcat S650 Skid Steer',
    category: 'Loaders',
    image: '/rentals/skidsteer-1.jpg',
    dailyRate: 250,
    weeklyRate: 1400,
    monthlyRate: 4800,
    description: 'Compact and maneuverable skid steer loader for various applications.',
    features: [
      'Rated Capacity: 2,690 lbs',
      'Height to Hinge Pin: 10.5 ft',
      'Engine Power: 74 hp',
      'High-Flow Hydraulics'
    ],
    availability: true
  }
];

const FilterSectionRentalsPortfolio = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Equipment');

  const filteredEquipment = equipmentList.filter(item =>
    (selectedCategory === 'All Equipment' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section className="py-3 px-2 bg-white shadow-md sticky top-0 z-60">
        <div className="container mx-auto px-5">
          <div className="flex items-center justify-between w-full  mb-4">
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
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                  >
                    {equipmentCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* User icon button */}
              <Link href="/dashboard/login">
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1b4965] hover:bg-[#1b4965]-700 text-white transition-all duration-200">
                  <RiUser3Line className="text-2xl" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
  );
}

export default FilterSectionRentalsPortfolio;