import { motion } from 'framer-motion';
import { FaFacebookF, FaLandmark, FaMailBulk, FaPhone} from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

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

    const currentRef = containerRef.current;
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
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
     <section id="contact" className="py-20 min-h-[600px]" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
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
              
              {/* Contact Information - Visible on tablet and mobile */}
              <div className="mt-6 space-y-4 text-gray-700 md:block hidden">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><FaMailBulk size={23} /></svg>
                  <span>saanexeng@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><FaPhone size={23} /></svg>
                  <span>+94 77 727 6391</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><FaLandmark size={23} /></svg>
                  <span>No.47, Courts Road, Point Pedo, Jaffna.</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#1b4965]" fill="currentColor" viewBox="0 0 24 24"><FaFacebookF size={23} /></svg>
                  <span>SAAN Homes</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Intro Paragraph */}
          <div className="md:w-1/2 w-full flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]">Get In Touch</h2>
              <p className="text-gray-600 text-xl md:text-2xl mb-4">Let&apos;s Build Something Great Together!</p>
              <p className="text-gray-700 text-justify mb-6">
                In our Contact section, you can easily reach out to us with any inquiries, feedback, or support needs. Whether you have questions about using QuickMatch, need assistance with your account, or want to provide feedback to help us improve, we&apos;re here to help. Fill out the contact form with your details and message, and our dedicated support team will respond promptly. Your satisfaction is our priority, and we strive to provide excellent customer service. Thank you for choosing QuickMatch! We look forward to assisting you.
              </p>
            </motion.div>
          </div>

          {/* Video Section - Mobile Only */}
          <div className="w-full md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
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

          {/* Contact Information - Mobile Only */}
          <div className="w-full md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="space-y-4 text-gray-700"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><FaMailBulk size={23} /></svg>
                <span>saanexeng@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><FaPhone size={23} /></svg>
                <span>+94 77 727 6391</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><FaLandmark size={23} /></svg>
                <span>No.47, Courts Road, Point Pedo, Jaffna.</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="currentColor" viewBox="0 0 24 24"><FaFacebookF size={23} /></svg>
                <span>SAAN Homes</span>
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