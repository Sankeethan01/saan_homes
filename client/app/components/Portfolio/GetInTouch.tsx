import { motion } from 'framer-motion';
import { FaLandmark, FaMailBulk, FaPhone} from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

// Optimized Video Component with Intersection Observer
const LazyVideo = ({ src, poster, className }: { src: string; poster: string; className: string }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative rounded-xl overflow-hidden shadow-lg">
      {!shouldLoad ? (
        // Placeholder before loading
        <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1b4965] rounded-lg mx-auto mb-2 opacity-20"></div>
            <p className="text-gray-500 text-sm">Video Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-xl z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#1b4965] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading Video...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className={className}
            controls
            poster={poster}
            preload="metadata"
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setIsLoaded(true)} // Hide loader even on error
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-xl"></div>
        </>
      )}
    </div>
  );
};

const GetInTouchPortfolio = () => {
  return (
     <section id="contact" className="py-20 min-h-[600px] bg-gradient-radial from-blue-50 via-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          {/* Left Side: Video */}
          <div className="md:w-1/2 w-full mb-8 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="relative"
            >
              <h3 className="text-xl font-semibold text-[#1b4965] mb-4 text-center">Watch and Get Experience</h3>
              <LazyVideo
                src="/assets/videos/story.mp4"
                poster="/assets/images/hero_about_us.png"
                className="w-full h-auto rounded-xl"
              />
              <p className="text-sm text-gray-600 mt-3 text-center">
                Discover our journey and commitment to excellence
              </p>
            </motion.div>
          </div>

          {/* Right Side: Intro Paragraph */}
          <div className="md:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1b4965] mb-4">
                  Get in Touch
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Ready to bring your vision to life? We&apos;re here to help you every step of the way. 
                  From initial consultation to project completion, our team of experts is committed 
                  to delivering excellence in every detail.
                </p>
              </div>
              
              <div className="space-y-4">
                <motion.div {...fadeInUp} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-[#1b4965] rounded-full flex items-center justify-center">
                    <FaPhone className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Call Us</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </motion.div>
                
                <motion.div {...fadeInUp} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-[#1b4965] rounded-full flex items-center justify-center">
                    <FaMailBulk className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email Us</h4>
                    <p className="text-gray-600">info@saanhomes.com</p>
                  </div>
                </motion.div>
                
                <motion.div {...fadeInUp} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-[#1b4965] rounded-full flex items-center justify-center">
                    <FaLandmark className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Visit Us</h4>
                    <p className="text-gray-600">123 Construction Ave, City, State</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
        </div>
      </section>
  );
};

export default GetInTouchPortfolio; 