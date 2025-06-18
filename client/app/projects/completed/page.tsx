'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { RiCheckLine, RiArrowRightLine } from 'react-icons/ri';
import Link from 'next/link';
import HomeIcon from '@/app/components/Home_Icon';

const completedProjects = [
  {
    id: 1,
    title: "City Center Mall",
    category: "Commercial Construction",
    description: "We specialize in creating modern commercial spaces that combine functionality with aesthetic appeal. Our commercial construction services are designed to meet the unique needs of businesses while ensuring maximum efficiency and sustainability.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/projects/mall-1.jpg"
  },
  {
    id: 2,
    title: "Urban Apartments",
    category: "Residential Buildings",
    description: "Each structure we create is a reflection of our commitment to excellence and forward-thinking. Together, we build for a future that lasts beyond today. Experience interior design that speaks to your individuality and lifestyle.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/projects/residential-2.jpg"
  },
  {
    id: 3,
    title: "Luxury Hotel",
    category: "Hospitality",
    description: "We specialize in creating luxurious hospitality spaces that combine comfort with aesthetic appeal. Our construction services are designed to meet the unique needs of the hospitality industry while ensuring maximum guest satisfaction.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/projects/hotel-1.jpg"
  }
];

export default function CompletedProjectsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-br from-blue-600 to-red-700">
        <div className="absolute inset-0 bg-black/30" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[url('/projects/hero-pattern.png')] bg-repeat opacity-10"
        />
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative">
          <div className="text-center z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Completed Projects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-3xl mx-auto"
            >
              We're reframing how companies can think about building. And we're still excited about solutions to create.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="space-y-32">
            {completedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 0 ? '' : 'lg:grid-flow-dense'
                }`}
              >
                <div className={`space-y-8 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-blue-600 font-medium mb-4"
                    >
                      {project.category}
                    </motion.p>
                    <h2 className="text-4xl font-bold mb-6">{project.title}</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {project.description}
                    </p>
                    <Link href={`/projects/${project.id}`}>
                      <motion.button
                        whileHover={{ x: 5 }}
                        className="group flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mt-4"
                      >
                        View Project Details
                        <RiArrowRightLine className="text-xl transition-transform group-hover:translate-x-1" />
                      </motion.button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {project.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <RiCheckLine className="text-blue-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`relative aspect-[4/3] ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover rounded-2xl shadow-xl"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Icon */}
          <HomeIcon />
    </main>
  );
}
