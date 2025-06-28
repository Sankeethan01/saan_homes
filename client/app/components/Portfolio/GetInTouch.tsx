import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const GetInTouchPortfolio = () => {
  return (
     <section id="contact" className="py-20 min-h-[600px]" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          {/* Left Side: Contact Form */}
          <div className="md:w-1/2 w-full mb-8 md:mb-0">
            <motion.form
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="space-y-6 bg-white/80 rounded-2xl p-6 shadow-md min-h-[480px] flex flex-col justify-center"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#1b4965] text-center">Have Questions? We're Here to Help!</h3>
                
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-400 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                ></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#1b4965] text-white px-6 py-3 rounded-lg font-medium transition-transform duration-500"
              >
                Send Message
              </motion.button>
            </motion.form>
          </div>
          {/* Right Side: Intro Paragraph */}
          <div className="md:w-1/2 w-full flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]">Get In Touch</h2>
            <p className="text-gray-600 text-xl md:text-2xl mb-4">Let's Build Something Great Together!</p>
            <p className="text-gray-700 mb-6">
              In our Contact section, you can easily reach out to us with any inquiries, feedback, or support needs. Whether you have questions about using QuickMatch, need assistance with your account, or want to provide feedback to help us improve, we're here to help. Fill out the contact form with your details and message, and our dedicated support team will respond promptly. Your satisfaction is our priority, and we strive to provide excellent customer service. Thank you for choosing QuickMatch! We look forward to assisting you.
            </p>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                <span>findquickmatch@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 01-2 2A18 18 0 013 5a2 2 0 012-2h2.09a2 2 0 012 1.72c.13.81.36 1.6.7 2.34a2 2 0 01-.45 2.11l-.27.27a16 16 0 006.29 6.29l.27-.27a2 2 0 012.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0122 16.92z" /></svg>
                <span>+77 276 3991</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Passara Road, Badulla, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#1b4965]" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                <span>facebook.com/quickmatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </section>
  );
};

export default GetInTouchPortfolio; 