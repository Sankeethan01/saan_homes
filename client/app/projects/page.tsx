'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHome5Line, RiBuilding4Line, RiTimeLine, RiCheckLine, RiCalendarLine, RiTeamLine, RiMapPinLine, RiArrowRightLine, RiHomeSmileLine, RiPaletteLine, RiLeafLine } from 'react-icons/ri';
import Footer from '../components/Portfolio/Footer';
import HomeIcon from '../components/Portfolio/Home_Icon';

interface Project {
  id: number;
  title: string;
  type: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  progress: number;
  client: string;
  value: string;
  features: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "Modern Residential Complex",
    type: "Residential",
    status: "upcoming",
    image: "/projects/residential-1.jpg",
    location: "Downtown City Center",
    startDate: "2024-06-01",
    endDate: "2025-12-31",
    description: "Luxury residential complex featuring 200 premium apartments with modern amenities.",
    progress: 0,
    client: "City Development Corp",
    value: "$50M",
    features: ["200 Premium Units", "Underground Parking", "Rooftop Garden"]
  },
  {
    id: 2,
    title: "Tech Innovation Hub",
    type: "Commercial",
    status: "ongoing",
    image: "/projects/commercial-1.jpg",
    location: "Tech District",
    startDate: "2023-09-15",
    endDate: "2024-12-31",
    description: "State-of-the-art office complex designed for tech companies and startups.",
    progress: 45,
    client: "TechSpace Inc",
    value: "$75M",
    features: ["Smart Building Systems", "Collaborative Spaces", "Innovation Labs"]
  },
  {
    id: 3,
    title: "City Center Mall",
    type: "Commercial",
    status: "completed",
    image: "/projects/mall-1.jpg",
    location: "Metropolitan Area",
    startDate: "2022-03-01",
    endDate: "2023-11-30",
    description: "Modern shopping mall with entertainment facilities and dining options.",
    progress: 100,
    client: "Metro Retail Group",
    value: "$120M",
    features: ["200+ Retail Spaces", "Food Court", "Cinema Complex"]
  },
  {
    id: 4,
    title: "Sustainable Office Park",
    type: "Commercial",
    status: "upcoming",
    image: "/projects/office-1.jpg",
    location: "Green Business District",
    startDate: "2024-08-15",
    endDate: "2026-02-28",
    description: "Eco-friendly office park with renewable energy systems and green spaces.",
    progress: 0,
    client: "EcoWork Developments",
    value: "$95M",
    features: ["Solar Panels", "Green Spaces", "Smart Building Systems"]
  },
  {
    id: 5,
    title: "Healthcare Complex",
    type: "Healthcare",
    status: "ongoing",
    image: "/projects/healthcare-1.jpg",
    location: "Medical District",
    startDate: "2023-11-01",
    endDate: "2025-04-30",
    description: "Modern medical facility with state-of-the-art equipment and specialized units.",
    progress: 35,
    client: "Regional Health Authority",
    value: "$150M",
    features: ["Emergency Unit", "Specialized Care", "Research Facilities"]
  },
  {
    id: 6,
    title: "Urban Apartments",
    type: "Residential",
    status: "completed",
    image: "/projects/residential-2.jpg",
    location: "City Center",
    startDate: "2022-05-15",
    endDate: "2023-12-31",
    description: "Modern urban living spaces with smart home features and community areas.",
    progress: 100,
    client: "Urban Living Ltd",
    value: "$65M",
    features: ["Smart Home Tech", "Community Spaces", "Fitness Center"]
  },
  {
    id: 7,
    title: "Sports Complex",
    type: "Recreation",
    status: "upcoming",
    image: "/projects/sports-1.jpg",
    location: "Suburban District",
    startDate: "2024-09-01",
    endDate: "2026-03-31",
    description: "Multi-purpose sports facility with indoor and outdoor venues.",
    progress: 0,
    client: "City Sports Authority",
    value: "$85M",
    features: ["Olympic Pool", "Indoor Courts", "Training Facilities"]
  },
  {
    id: 8,
    title: "Educational Campus",
    type: "Education",
    status: "ongoing",
    image: "/projects/education-1.jpg",
    location: "Knowledge Park",
    startDate: "2023-10-15",
    endDate: "2025-08-31",
    description: "Modern educational campus with advanced learning facilities.",
    progress: 60,
    client: "Education Board",
    value: "$110M",
    features: ["Smart Classrooms", "Research Labs", "Library Complex"]
  },
  {
    id: 9,
    title: "Luxury Hotel",
    type: "Hospitality",
    status: "completed",
    image: "/projects/hotel-1.jpg",
    location: "Tourist District",
    startDate: "2022-01-15",
    endDate: "2023-09-30",
    description: "Five-star hotel with premium amenities and conference facilities.",
    progress: 100,
    client: "Global Hotels Group",
    value: "$130M",
    features: ["200 Rooms", "Conference Center", "Spa & Wellness"]
  }
];

const testimonials = [
  {
    id: 1,
    name: "John Smith",
    position: "CEO, Smith Construction",
    image: "/testimonials/person1.jpg",
    quote: "SAAN HOMES delivered our project ahead of schedule with exceptional quality. Their attention to detail and professional approach made the entire process smooth.",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Director, Metropolitan Development",
    image: "/testimonials/person2.jpg",
    quote: "Working with SAAN HOMES was a great experience. Their innovative solutions and commitment to sustainability aligned perfectly with our vision.",
    rating: 5
  },
  {
    id: 3,
    name: "Michael Chen",
    position: "Property Developer",
    image: "/testimonials/person3.jpg",
    quote: "The team's expertise and dedication to excellence is remarkable. They transformed our concept into reality with precision and creativity.",
    rating: 5
  }
];

export default function ProjectsPage() {
  const upcomingProjects = projects.filter(p => p.status === 'upcoming');
  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-64">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'completed' ? 'bg-green-100 text-green-600' :
            project.status === 'ongoing' ? 'bg-blue-100 text-blue-600' :
            'bg-yellow-100 text-yellow-600'
          }`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-gray-600 mb-4">{project.description}</p>
        
        {project.status === 'ongoing' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-blue-600 h-2 rounded-full"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <RiMapPinLine className="mr-2" />
            {project.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <RiTeamLine className="mr-2" />
            {project.client}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <RiCalendarLine className="mr-2" />
            {project.startDate} - {project.endDate}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <main className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%), radial-gradient(ellipse at 80% 60%, #ffe5ec 0%, #f8fafc 100%)' }}>
      {/* Hero Section */}
      <section className="relative h-[120vh] bg-gradient-to-br from-blue-600 to-red-700">
        <div className="absolute inset-0 bg-black/30" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[url('/projects/hero-pattern.png')] bg-repeat opacity-10"
        />
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl z-10"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                className="h-1 bg-white mb-8"
              />
              <h1 className="text-6xl font-light mb-8 text-white leading-tight">
                We're reframing how our companies can{' '}
                <span className="relative">
                  think about
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>{' '}
                <span className="relative inline-block">
                  building
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-12">
                Each structure we create is a reflection of our commitment to excellence and forward-thinking. 
                Together, we build for a future that lasts beyond today.
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiHomeSmileLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiPaletteLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Modern Design</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiLeafLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Sustainable</span>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"
        />
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "Total Projects", value: projects.length, icon: RiBuilding4Line },
              { label: "Completed", value: completedProjects.length, icon: RiCheckLine },
              { label: "Ongoing", value: ongoingProjects.length, icon: RiTimeLine },
              { label: "Upcoming", value: upcomingProjects.length, icon: RiCalendarLine }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl text-center transform hover:scale-105 transition-all duration-300"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="text-5xl text-blue-600" />
                </motion.div>
                <motion.h3 
                  className="text-4xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Projects Section */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Upcoming Projects</h2>
            <p className="text-xl text-gray-600">Discover our future developments and innovations</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingProjects.map((project, index) => (
              <motion.div
                key={`${project.id}-upcoming`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <Link href="/projects/upcoming">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-red-700 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                View All Upcoming Projects
                <RiArrowRightLine className="text-xl" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ongoing Projects Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Ongoing Projects</h2>
            <p className="text-xl text-gray-600">Watch our current projects take shape</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ongoingProjects.map((project, index) => (
              <motion.div
                key={`${project.id}-ongoing`}
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <Link href="/projects/ongoing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-red-700 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                View All Ongoing Projects
                <RiArrowRightLine className="text-xl" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Completed Projects Section */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Completed Projects</h2>
            <p className="text-xl text-gray-600">Explore our successfully delivered projects</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {completedProjects.map((project, index) => (
              <motion.div
                key={`${project.id}-completed`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <Link href="/projects/completed">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-red-700 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                View All Completed Projects
                <RiArrowRightLine className="text-xl" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Client Testimonials</h2>
            <p className="text-xl text-gray-600">What our clients say about us</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl"
              >
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-2xl">⭐</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Home Button */}
            <HomeIcon />
    </main>
  );
}
