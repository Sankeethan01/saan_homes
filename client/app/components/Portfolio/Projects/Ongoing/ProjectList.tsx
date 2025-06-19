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
    image: "/projects/commercial-1.jpg"
  },
  {
    id: 2,
    title: "Healthcare Complex",
    category: "Healthcare Facilities",
    description: "Each structure we create is a reflection of our commitment to excellence and forward-thinking. Together, we build for a future that lasts beyond today. Experience interior design that speaks to your individuality and lifestyle.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/projects/healthcare-1.jpg"
  },
  {
    id: 3,
    title: "Educational Campus",
    category: "Educational Institutions",
    description: "We specialize in creating modern educational spaces that combine functionality with aesthetic appeal. Our educational construction services are designed to meet the unique needs of institutions while ensuring maximum learning efficiency.",
    features: [
      "Modern Design Solutions",
      "Sustainable Building Practices",
      "Energy-Efficient Solutions",
      "Premium Materials",
      "Expert Craftsmanship"
    ],
    image: "/projects/education-1.jpg"
  }
];

const ProjectListOngoingProjectsPortfolio = () =>  {
  return (
    <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="space-y-32">
            {ongoingProjects.map((project, index) => (
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
  );
}

export default ProjectListOngoingProjectsPortfolio;
