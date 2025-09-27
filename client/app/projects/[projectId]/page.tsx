'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { use, useState } from 'react';
import { FaVrCardboard, FaExpand } from 'react-icons/fa';
import { MdConstruction, MdCheckCircle, MdSchedule } from 'react-icons/md';
import NavBarProjects from '@/app/components/ui/NavBarProjects';
import Footer from '@/app/components/Portfolio/Footer';
import VRPlayer from '@/app/components/VRPlayer';

interface Project {
  id: string;
  title: string;
  description: string;
  owner: string;
  price: string;
  details: string;
  images: string[];
  vrVideo?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  progress: number;
  startDate: string;
  estimatedEndDate: string;
  location: string;
  steps: ProjectStep[];
}

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  completedDate?: string;
  images?: string[];
}

const sampleProject: Project = {
  id: '1',
  title: 'Modern Villa Construction',
  description: `This modern villa project features contemporary architecture, sustainable materials, and smart home technology. The design emphasizes open spaces, natural light, and seamless indoor-outdoor living. Key highlights include a rooftop garden, infinity pool, and energy-efficient systems throughout the property. The villa also integrates cutting-edge smart home technology, allowing for seamless control of lighting, security, and climate with just a touch, enhancing both convenience and efficiency.`,
  owner: 'Mr & Mrs. Vanojithan Lixsana',
  price: 'LKR 1,200,000',
  details: '4 Bedrooms, 3 Bathrooms, 2,800 sq ft, Rooftop garden, Infinity pool, Smart home system',
  location: 'Point Pedro, Jaffna',
  status: 'ongoing',
  progress: 65,
  startDate: '2024-01-15',
  estimatedEndDate: '2024-12-20',
  images: [
    '/assets/images/project1/1.jpg',
    '/assets/images/project1/2.jpg',
    '/assets/images/project1/3.jpg',
  ],
  vrVideo: 'https://www.youtube.com/embed/IG7Jrgl9h1o?si=To4jA86msX2av0GN',
  steps: [
    {
      id: '1',
      title: 'Foundation & Site Preparation',
      description: 'Site clearing, excavation, and foundation laying',
      status: 'completed',
      completedDate: '2024-02-15',
      images: ['/assets/images/project1/found01.png', '/assets/images/project1/found02.png']
    },
    {
      id: '2',
      title: 'Structural Framework',
      description: 'Steel frame construction and concrete work',
      status: 'completed',
      completedDate: '2024-04-10',
      images: ['/assets/images/project1/structure01.png', '/assets/images/project1/structure02.png']
    },
    {
      id: '3',
      title: 'Roofing & Exterior Walls',
      description: 'Roof installation and exterior wall construction',
      status: 'in-progress',
      images: ['/assets/images/project1/roof01.png', '/assets/images/project1/roof02.png']
    },
    {
      id: '4',
      title: 'Interior Construction',
      description: 'Interior walls, electrical, and plumbing',
      status: 'pending'
    },
    {
      id: '5',
      title: 'Finishing & Landscaping',
      description: 'Final touches, painting, and landscape design',
      status: 'pending'
    }
  ]
};

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  // Unwrap the params Promise using React.use()
  const { projectId } = use(params);
  
  // In a real implementation, you would fetch the project data using projectId
  console.log('Project ID:', projectId);
  const proj = sampleProject;
  
  const [showVRPlayer, setShowVRPlayer] = useState(false);
  const [, setSelectedImageIndex] = useState(0);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <MdCheckCircle className="w-5 h-5" />;
      case 'in-progress': return <MdConstruction className="w-5 h-5" />;
      case 'pending': return <MdSchedule className="w-5 h-5" />;
      default: return <MdSchedule className="w-5 h-5" />;
    }
  };

  const handleVROpen = () => {
    setShowVRPlayer(true);
  };

  const handleVRClose = () => {
    setShowVRPlayer(false);
  };
  
  return (
    <main className="min-h-screen bg-gray-50">

      {/* NavBar */}
      <NavBarProjects />

      {/* Hero Section */}
      <div className="relative h-70 bg-gradient-to-r from-[#1b4965] to-[#2d6a87] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              {proj.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl mb-6"
            >
              {proj.location}
            </motion.p>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Owner:</span> {proj.owner}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Budget:</span> {proj.price}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Progress:</span> {proj.progress}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Project Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-[#1b4965]">Project Overview</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg text-justify text-gray-600 mb-6">{proj.description}</p>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Project Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(proj.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Completion:</span>
                    <span className="font-medium">{new Date(proj.estimatedEndDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proj.status)}`}>
                      {proj.status.charAt(0).toUpperCase() + proj.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Progress Overview</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${proj.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-[#1b4965] to-[#2d6a87] h-3 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{proj.details}</p>
              </div>
              {/* Map Location Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg mt-8">
                <h3 className="text-xl font-semibold mb-4">Project Location</h3>
                <div className="w-full h-32 rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(proj.location)}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Project Location Map"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-[#1b4965]">Project Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proj.images.map((img: string, idx: number) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => setSelectedImageIndex(idx)}
              >
                <Image 
                  src={img} 
                  alt={`Project image ${idx + 1}`} 
                  fill 
                  className="object-cover !h-64 group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Construction Progress */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-[#1b4965]">Construction Progress</h2>
          <div className="space-y-6">
            {proj.steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${getStatusColor(step.status)}`}>
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(step.status)}`}>
                        {step.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    {step.completedDate && (
                      <p className="text-sm text-green-600 font-medium">
                        Completed on {new Date(step.completedDate).toLocaleDateString()}
                      </p>
                    )}
                    {step.images && (
                      <div className="flex gap-2 mt-4">
                        {step.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                            <Image src={img} alt={`Step ${step.id} image ${imgIdx + 1}`} fill className="object-cover !h-full" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* VR Walkthrough Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#1b4965]">VR Walkthrough</h2>
            <div className="flex gap-3">
              <button
                onClick={handleVROpen}
                className="flex items-center gap-2 px-6 py-3 bg-[#1b4965] text-white rounded-lg font-medium hover:bg-[#2d6a87] transition-colors shadow-lg"
              >
                <FaVrCardboard />
                Launch VR Experience
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1b4965] to-[#2d6a87] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaVrCardboard className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">360° Virtual Reality Experience</h3>
              <p className="text-gray-600 mb-4">
                Immerse yourself in this project with our interactive VR walkthrough
              </p>
            </div>
            
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <FaVrCardboard className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">Click "Launch VR Experience" to start</p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-white rounded-full">VR Headsets</span>
                  <span className="px-3 py-1 bg-white rounded-full">Mobile Devices</span>
                  <span className="px-3 py-1 bg-white rounded-full">Desktop</span>
                  <span className="px-3 py-1 bg-white rounded-full">360° Video</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Interactive Controls</h4>
                <p className="text-sm text-blue-600">Mouse, touch, or VR controllers</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Full Immersion</h4>
                <p className="text-sm text-green-600">360° panoramic viewing</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Multi-Platform</h4>
                <p className="text-sm text-purple-600">Works on all devices</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/*Footer*/}
      <Footer />

      {/* VR Player Modal */}
      {showVRPlayer && (
        <VRPlayer
          videoSrc="/assets/videos/vr.mp4"
          projectTitle={proj.title}
          onClose={handleVRClose}
        />
      )}

    </main>
  );
}

