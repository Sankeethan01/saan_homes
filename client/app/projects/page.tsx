'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiBuilding4Line, RiTimeLine, RiCheckLine, RiCalendarLine, RiTeamLine, RiMapPinLine, RiArrowRightLine,} from 'react-icons/ri';
import Footer from '../components/Portfolio/Footer';
import HeroProjectsPortfolio from '../components/Portfolio/Projects/Hero';
import NavBar from '../components/ui/NavBar';

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
    image: "/assets/images/projects/home01.jpg",
    location: "Downtown City Center",
    startDate: "2024-06-01",
    endDate: "2025-12-31",
    description: "Luxury residential complex featuring 200 premium apartments with modern amenities.",
    progress: 0,
    client: "City Development Corp",
    value: "LKR 50M",
    features: ["200 Premium Units", "Underground Parking", "Rooftop Garden"]
  },
  {
    id: 2,
    title: "Tech Innovation Hub",
    type: "Commercial",
    status: "ongoing",
    image: "/assets/images/projects/home04.jpg",
    location: "Tech District",
    startDate: "2023-09-15",
    endDate: "2024-12-31",
    description: "State-of-the-art office complex designed for tech companies and startups.",
    progress: 45,
    client: "TechSpace Inc",
    value: "LKR 75M",
    features: ["Smart Building Systems", "Collaborative Spaces", "Innovation Labs"]
  },
  {
    id: 3,
    title: "City Center Mall",
    type: "Commercial",
    status: "completed",
    image: "/assets/images/projects/home07.png",
    location: "Metropolitan Area",
    startDate: "2022-03-01",
    endDate: "2023-11-30",
    description: "Modern shopping mall with entertainment facilities and dining options.",
    progress: 100,
    client: "Metro Retail Group",
    value: "LKR 120M",
    features: ["200+ Retail Spaces", "Food Court", "Cinema Complex"]
  },
  {
    id: 4,
    title: "Sustainable Office Park",
    type: "Commercial",
    status: "upcoming",
    image: "/assets/images/projects/home02.jpg",
    location: "Green Business District",
    startDate: "2024-08-15",
    endDate: "2026-02-28",
    description: "Eco-friendly office park with renewable energy systems and green spaces.",
    progress: 0,
    client: "EcoWork Developments",
    value: "LKR 95M",
    features: ["Solar Panels", "Green Spaces", "Smart Building Systems"]
  },
  {
    id: 5,
    title: "Healthcare Complex",
    type: "Healthcare",
    status: "ongoing",
    image: "/assets/images/projects/home05.jpg",
    location: "Medical District",
    startDate: "2023-11-01",
    endDate: "2025-04-30",
    description: "Modern medical facility with state-of-the-art equipment and specialized units.",
    progress: 35,
    client: "Regional Health Authority",
    value: "LKR 150M",
    features: ["Emergency Unit", "Specialized Care", "Research Facilities"]
  },
  {
    id: 6,
    title: "Urban Apartments",
    type: "Residential",
    status: "completed",
    image: "/assets/images/projects/home08.png",
    location: "City Center",
    startDate: "2022-05-15",
    endDate: "2023-12-31",
    description: "Modern urban living spaces with smart home features and community areas.",
    progress: 100,
    client: "Urban Living Ltd",
    value: "LKR 65M",
    features: ["Smart Home Tech", "Community Spaces", "Fitness Center"]
  },
  {
    id: 7,
    title: "Sports Complex",
    type: "Recreation",
    status: "upcoming",
    image: "/assets/images/projects/home03.jpg",
    location: "Suburban District",
    startDate: "2024-09-01",
    endDate: "2026-03-31",
    description: "Multi-purpose sports facility with indoor and outdoor venues.",
    progress: 0,
    client: "City Sports Authority",
    value: "LKR 85M",
    features: ["Olympic Pool", "Indoor Courts", "Training Facilities"]
  },
  {
    id: 8,
    title: "Educational Campus",
    type: "Education",
    status: "ongoing",
    image: "/assets/images/projects/home06.jpg",
    location: "Knowledge Park",
    startDate: "2023-10-15",
    endDate: "2025-08-31",
    description: "Modern educational campus with advanced learning facilities.",
    progress: 60,
    client: "Education Board",
    value: "LKR 110M",
    features: ["Smart Classrooms", "Research Labs", "Library Complex"]
  },
  {
    id: 9,
    title: "Luxury Hotel",
    type: "Hospitality",
    status: "completed",
    image: "/assets/images/projects/home09.png",
    location: "Tourist District",
    startDate: "2022-01-15",
    endDate: "2023-09-30",
    description: "Five-star hotel with premium amenities and conference facilities.",
    progress: 100,
    client: "Global Hotels Group",
    value: "LKR 130M",
    features: ["200 Rooms", "Conference Center", "Spa & Wellness"]
  }
];

const testimonials = [
  {
    id: 1,
    name: "John Smith",
    position: "CEO, Smith Construction",
    image: "/assets/images/vano.jpg",
    quote: "SAAN HOMES delivered our project ahead of schedule with exceptional quality. Their attention to detail and professional approach made the entire process smooth.",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Director, Metropolitan Development",
    image: "/assets/images/sankee.jpg",
    quote: "Working with SAAN HOMES was a great experience. Their innovative solutions and commitment to sustainability aligned perfectly with our vision.",
    rating: 5
  },
  {
    id: 3,
    name: "Michael Chen",
    position: "Property Developer",
    image: "/assets/images/dina.jpg",
    quote: "The team's expertise and dedication to excellence is remarkable. They transformed our concept into reality with precision and creativity.",
    rating: 5
  }
];

export default function ProjectsPage() {
  const upcomingProjects = projects.filter(p => p.status === 'upcoming');
  const ongoingProjects = projects.filter(p => p.status === 'ongoing');
  const completedProjects = projects.filter(p => p.status === 'completed');

  // Navbar scroll state
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      console.log(showNavbar);
      setShowNavbar(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-lg hover:shadow-[0_4px_10px_0_#1b4965] transition-all duration-300"
    >
      <div className="relative !h-64 !w-full">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover !w-full !h-full"
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
    <>
      {/* Custom Navbar */}
      
        <NavBar />

      <main className="min-h-screen bg-gradient-radial from-blue-50 via-slate-50 to-slate-100">
        {/* Hero Section */}
        <HeroProjectsPortfolio />

        {/* Statistics Section */}
        <section className="py-6 pt-10 bg-white">
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
                  initial={{ opacity: 0, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[rgba(27,73,101,0.1)] shadow-lg  p-8 rounded-xl text-center transform hover:scale-105 transition-all duration-300"
                >
                  <motion.div 
                    className="flex justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="text-5xl text-[#1b4965]" />
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
        <section className="py-6 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4 ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h2 className="text-4xl font-bold mb-4 text-[#1b4965]">Upcoming Projects</h2>
              <p className="text-xl text-gray-600">Discover our future developments and innovations</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
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
              className="mt-6 text-center"
            >
              <Link href="/projects/upcoming">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#1b4965] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#163a52] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                  View All Upcoming Projects
                  <RiArrowRightLine className="text-xl" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Ongoing Projects Section */}
        <section className="py-6 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <h2 className="text-4xl font-bold mb-4 text-[#1b4965]">Ongoing Projects</h2>
              <p className="text-xl text-gray-600">Watch our current projects take shape</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              className="mt-6 text-center"
            >
              <Link href="/projects/ongoing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#1b4965] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#163a52] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                  View All Ongoing Projects
                  <RiArrowRightLine className="text-xl" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Completed Projects Section */}
        <section className="py-6 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <h2 className="text-4xl font-bold mb-4 text-[#1b4965]">Completed Projects</h2>
              <p className="text-xl text-gray-600">Explore our successfully delivered projects</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              className="mt-6 text-center"
            >
              <Link href="/projects/completed">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#1b4965] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#163a52] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                  View All Completed Projects
                  <RiArrowRightLine className="text-xl" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-6 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl font-bold mb-4 text-[#1b4965]">Client Testimonials</h2>
              <p className="text-xl text-gray-600">What our clients say about us</p>
            </motion.div>
            <div className="grid grid-cols-1 h-[50vh] mt-3 md:grid-cols-3 gap-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="relative bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="mt-12 text-center">
                    <h3 className="font-bold text-lg text-[#1b4965]">{testimonial.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{testimonial.position}</p>
                    <p className="text-gray-700 italic mb-4">&quot;{testimonial.quote}&quot;</p>
                    <div className="flex justify-center text-yellow-400 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-xl">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
