import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

const services = [
  {
    id: 1,
    title: 'Custom Home Construction',
    subtitle: '2-5 Bedrooms – 1000-3000 sq ft',
    description: 'Each structure we create is a reflection of our commitment to excellence and forward-thinking. Together, we build for a future that lasts beyond today. Experience interior design that speaks to your individuality and lifestyle. Discover the art of personalized design, where every element is tailored just for you.',
    images: [
      '/services/custom-home-1.jpg',
      '/services/custom-home-2.jpg',
      '/services/custom-home-3.jpg',
    ],
    features: [
      'Personalized Design Consultation',
      'Energy-Efficient Solutions',
      'Premium Materials',
      'Expert Craftsmanship'
    ]
  },
  {
    id: 2,
    title: 'Commercial Construction',
    subtitle: 'Office Spaces & Retail Buildings',
    description: 'We specialize in creating modern commercial spaces that combine functionality with aesthetic appeal. Our commercial construction services are designed to meet the unique needs of businesses while ensuring maximum efficiency and sustainability.',
    images: [
      '/services/commercial-1.jpg',
      '/services/commercial-2.jpg',
      '/services/commercial-3.jpg',
    ],
    features: [
      'Modern Design Solutions',
      'Sustainable Building Practices',
      'Project Management',
      'Safety Compliance'
    ]
  },
  {
    id: 3,
    title: 'Renovation & Remodeling',
    subtitle: 'Transform Your Space',
    description: 'Give your property a new life with our comprehensive renovation and remodeling services. We combine modern design trends with practical solutions to create spaces that are both beautiful and functional.',
    images: [
      '/services/renovation-1.jpg',
      '/services/renovation-2.jpg',
      '/services/renovation-3.jpg',
    ],
    features: [
      'Kitchen & Bathroom Remodeling',
      'Space Optimization',
      'Modern Upgrades',
      'Quality Finishes'
    ]
  },
  {
    id: 4,
    title: 'Landscape Design',
    subtitle: 'Outdoor Living Spaces',
    description: 'Transform your outdoor space into a beautiful, functional landscape that enhances your property value and lifestyle. Our landscape design services create stunning gardens, patios, and outdoor living areas that blend seamlessly with your home.',
    images: [
      '/services/landscape-1.jpg',
      '/services/landscape-2.jpg',
      '/services/landscape-3.jpg',
    ],
    features: [
      'Garden Design & Installation',
      'Patio & Hardscaping',
      'Irrigation Systems',
      'Seasonal Maintenance'
    ]
  },
  {
    id: 5,
    title: 'Interior Design',
    subtitle: 'Bespoke Interior Solutions',
    description: 'Our interior design service creates personalized spaces that reflect your style and meet your needs. We focus on creating harmonious environments that combine aesthetics with functionality.',
    images: [
      '/services/interior-1.jpg',
      '/services/interior-2.jpg',
      '/services/interior-3.jpg',
    ],
    features: [
      'Custom Design Plans',
      'Material Selection',
      'Color Consultation',
      'Furniture Layout'
    ]
  },
  {
    id: 6,
    title: 'Sustainable Building',
    subtitle: 'Eco-Friendly Construction',
    description: 'Were committed to sustainable construction practices that minimize environmental impact while maximizing energy efficiency. Our green building solutions help create a better future for generations to come.',
    images: [
      '/services/sustainable-1.jpg',
      '/services/sustainable-2.jpg',
      '/services/sustainable-3.jpg',
    ],
    features: [
      'Solar Integration',
      'Energy-Efficient Systems',
      'Sustainable Materials',
      'Water Conservation'
    ]
  },
  {
    id: 7,
    title: 'Project Management',
    subtitle: 'End-to-End Solutions',
    description: 'Our experienced project management team ensures your construction project is completed on time, within budget, and to the highest standards. We handle all aspects of the project from planning to execution.',
    images: [
      '/services/project-1.jpg',
      '/services/project-2.jpg',
      '/services/project-3.jpg',
    ],
    features: [
      'Timeline Management',
      'Budget Control',
      'Quality Assurance',
      'Risk Management'
    ]
  },
  {
    id: 8,
    title: 'Architectural Design',
    subtitle: 'Creative & Functional Design',
    description: 'Our architectural design services blend creativity with functionality to create stunning spaces that work for you. We focus on innovative solutions that make the most of your space and location.',
    images: [
      '/services/architecture-1.jpg',
      '/services/architecture-2.jpg',
      '/services/architecture-3.jpg',
    ],
    features: [
      'Custom Design',
      '3D Visualization',
      'Site Analysis',
      'Permit Processing'
    ]
  },
  {
    id: 9,
    title: 'Equipment Rental',
    subtitle: 'Professional Grade Equipment',
    description: 'Access top-quality construction equipment through our comprehensive rental service. We provide well-maintained equipment and expert guidance to ensure your project runs smoothly.',
    images: [
      '/services/equipment-1.jpg',
      '/services/equipment-2.jpg',
      '/services/equipment-3.jpg',
    ],
    features: [
      'Wide Equipment Selection',
      'Flexible Rental Terms',
      'Maintenance Support',
      'Operator Training'
    ]
  },
];

const ServiceListServicesPortfolio = () => {
const [activeImageIndex, setActiveImageIndex] = useState(0);
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
     <section className="py-20 bg-white" >
        <div className="container mx-auto px-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 mb-8 items-center bg-white rounded-3xl shadow-md p-10`}
            >
              {/* Image Section */}
              <motion.div 
                className="w-full lg:w-1/2 relative h-[300px] overflow-hidden rounded-2xl shadow"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-red-700/20 z-10" />
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative w-full h-full">
                    {service.images.map((image, imgIndex) => (
                      <motion.div
                        key={imgIndex}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: activeImageIndex === imgIndex ? 1 : 0,
                          scale: activeImageIndex === imgIndex ? 1 : 1.1
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={image}
                            alt={`${service.title} ${imgIndex + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                {/* Image Navigation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {service.images.map((_, imgIndex) => (
                    <button
                      key={imgIndex}
                      onClick={() => setActiveImageIndex(imgIndex)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeImageIndex === imgIndex ? 'bg-white w-6' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Content Section */}
              <div className="w-full lg:w-1/2">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-[#1b4965] font-medium"
                >
                  {service.subtitle}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-bold mt-2 mb-6"
                >
                  {service.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 mb-8 leading-relaxed"
                >
                  {service.description}
                </motion.p>
                <motion.ul className="space-y-4">
                  {service.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + featureIndex * 0.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-[#1b4965]">
                        ✓
                      </span>
                      {feature}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
  );
};

export default ServiceListServicesPortfolio; 