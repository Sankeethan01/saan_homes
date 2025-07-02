import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const services = [
  {
    id: 1,
    title: 'Custom Home Construction',
    subtitle: '2-5 Bedrooms – 1000-3000 sq ft',
    description: 'Each structure we create is a reflection of our commitment to excellence and forward-thinking. Together, we build for a future that lasts beyond today. Experience interior design that speaks to your individuality and lifestyle. Discover the art of personalized design, where every element is tailored just for you.',
    images: [
      '/assets/images/projects/home04.jpg',
      '/assets/images/projects/home05.jpg',
      '/assets/images/projects/home06.jpg',
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
      '/assets/images/services/com01.png',
      '/assets/images/services/com02.png',
      '/assets/images/services/com03.png',
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
      '/assets/images/services/ren01.png',
      '/assets/images/services/ren02.png',
      '/assets/images/services/ren03.png',
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
      '/assets/images/services/lan01.png',
      '/assets/images/services/lan02.png',
      '/assets/images/services/lan03.png',
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
      '/assets/images/services/interior01.png',
      '/assets/images/services/interior02.png',
      '/assets/images/services/interior03.png',
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
    title: 'Architectural Design',
    subtitle: 'Creative & Functional Design',
    description: 'Our architectural design services blend creativity with functionality to create stunning spaces that work for you. We focus on innovative solutions that make the most of your space and location.',
    images: [
      '/assets/images/projects/home07.png',
      '/assets/images/projects/home08.png',
      '/assets/images/projects/home09.png',
    ],
    features: [
      'Custom Design',
      '3D Visualization',
      'Site Analysis',
      'Permit Processing'
    ]
  },
  {
    id: 7,
    title: 'Equipment Rental',
    subtitle: 'Professional Grade Equipment',
    description: 'Access top-quality construction equipment through our comprehensive rental service. We provide well-maintained equipment and expert guidance to ensure your project runs smoothly.',
    images: [
      '/assets/images/equipments/excavator.jpeg',
      '/assets/images/equipments/concretemixer.png',
      '/assets/images/equipments/wheelborrow.png',
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

  return (
     <section className="py-20 bg-white" >
        <div className="container mx-auto px-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 mb-8 items-center bg-white rounded-3xl shadow-md p-13 pr-18 pl-18`}
            >
              {/* Image Section */}
              <motion.div 
                className="w-full lg:w-1/2 relative !h-[330px] overflow-hidden rounded-2xl shadow"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-white" />
                <motion.div
                  className="relative w-full h-full !object-cover"
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
                        <div className="relative !w-full !h-full !object-cover">
                          <Image
                            src={image}
                            alt={`${service.title} ${imgIndex + 1}`}
                            fill
                            className="object-cover w-full !h-full"
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
                      type="button"
                      title={`View image ${imgIndex + 1}`}
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