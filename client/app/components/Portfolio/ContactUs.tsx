import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const ContactUsPortfolio = () => {
  return (
     <section id="contact" className="py-17 " style={{ background: 'radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl md:text-5xl text-center font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-red-600"
          >
            Contact Us
          </motion.h2>
          <div className="max-w-2xl mx-auto">
            <motion.form 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Send Message
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>
  );
};

export default ContactUsPortfolio; 