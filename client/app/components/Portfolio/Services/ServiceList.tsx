import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '../../../context/LanguageContext';
import { useState, useEffect } from 'react';

// Interface for service data from backend
interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  show_on_landing?: boolean;
}

// Default fallback images for services
const defaultServiceImages = [
  '/assets/images/projects/home04.jpg',
  '/assets/images/projects/home05.jpg',
  '/assets/images/projects/home06.jpg',
];

// Default features for services
const defaultFeatures = [
  'Professional Service',
  'Quality Assurance',
  'Expert Team',
  'Customer Satisfaction'
];

const ServiceListServicesPortfolio = () => {
  const { t } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live services from backend
  useEffect(() => {
    const fetchLiveServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/services/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        
        // Filter only services that are marked as live (show_on_landing: true)
        const liveServices = data.filter((service: Service) => service.show_on_landing === true);
        
        setServices(liveServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveServices();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965]"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Services</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no live services
  if (services.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600">No services are currently available. Please check back later.</p>
          </div>
        </div>
      </section>
    );
  }

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
                    {defaultServiceImages.map((image, imgIndex) => (
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
                  {defaultServiceImages.map((_, imgIndex) => (
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
                  Professional Service
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
                  {defaultFeatures.map((feature, featureIndex) => (
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