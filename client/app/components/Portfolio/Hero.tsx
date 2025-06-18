import { motion } from 'framer-motion';

const HeroPortfolio = () => {
  return (
     <section id="home" className="min-h-screen relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50">
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: 'url("images/hero-bg.jpg ")',
            backgroundSize: '1260px 660px' 
          }} />
        </div>

        <div className="container mx-auto px-4 pt-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 py-20"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-600 to-red-700 flex items-center justify-center"
            >
              <span className="text-4xl text-white">SH</span>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700"
            >
              SAAN HOMES
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light"
            >
              Building Dreams, Creating Homes with Innovation and Excellence
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
              >
                View Projects
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
  );
};

export default HeroPortfolio; 