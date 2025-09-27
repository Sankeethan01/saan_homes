'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { RiCheckLine, RiArrowRightLine } from 'react-icons/ri';
import Link from 'next/link';

const ongoingProjects = [
  {
    id: 1,
    title: "Tech Innovation Hub",
    category: "Commercial Construction",
    description: "We specialize in creating modern commercial spaces that combine functionality with aesthetic appeal. Our commercial construction services are designed to meet the unique needs of businesses while ensuring maximum efficiency and sustainability.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/assets/images/projects/home04.jpg"
  },
  {
    id: 2,
    title: "2 Floor Smart Home",
    category: "2 Floor Smart Home",
    description: "Each structure we create is a reflection of our commitment to excellence and forward-thinking. Together, we build for a future that lasts beyond today. Experience interior design that speaks to your individuality and lifestyle.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/assets/images/projects/home05.jpg"
  },
  {
    id: 3,
    title: "Educational Campus",
    category: "Smart Home Construction",
    description: "This modern villa project features contemporary architecture, sustainable materials, and smart home technology. The design emphasizes open spaces, natural light, and seamless indoor-outdoor living. Key highlights include a rooftop garden, infinity pool, and energy-efficient systems throughout the property. The villa also integrates cutting-edge smart home technology, allowing for seamless control of lighting, security, and climate with just a touch, enhancing both convenience and efficiency..",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/assets/images/projects/home06.jpg"
  }
];

const ProjectListOngoingProjectsPortfolio = () =>  {
  return (
    <section className="py-16 bg-[#f1f4f7]">
      <div className="container mx-auto px-4">
        <div className="space-y-16">
          {ongoingProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 35 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/70 rounded-3xl shadow-xl flex flex-col lg:flex-row items-stretch overflow-hidden"
            >
              {/* Left: Text */}
              <div className="flex-1 flex flex-col justify-center p-10">
                <p className="text-blue-600 font-medium mb-2">{project.category}</p>
                <h2 className="text-4xl font-bold mb-6 text-gray-900">{project.title}</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {project.description}
                </p>
                <div className="space-y-3 mb-8">
                  {project.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <RiCheckLine className="text-blue-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="group flex items-center gap-2 bg-[#003049] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#01416b] transition-colors"
                  >
                    View Project Details
                    <RiArrowRightLine className="text-xl transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
              </div>
              {/* Right: Image */}
              <div className="relative flex-1 min-h-[320px]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover !w-full !h-full"
                  style={{ borderTopRightRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectListOngoingProjectsPortfolio;
