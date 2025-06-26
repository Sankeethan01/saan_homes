import { motion } from 'framer-motion';

const HeroPortfolio = () => {
  return (
    <section id="home" className="min-h-screen flex items-center bg-white relative overflow-hidden">
      {/* Left: Text and Search */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 py-24 z-10">
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight"
        >
          Easy Way<br />
          <span className="text-teal-900">To Find Your<br />Dream House</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-[#175676] text-lg md:text-xl mb-10 max-w-lg"
        >
          Search and find your dream house at affordable prices, but with the best quality. Only available in Saan Homes!
        </motion.p>
        {/* Search Form */}
        <form className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-xl shadow-lg p-4 w-full max-w-xl">
          <select className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-700">
            <option>Location</option>
            <option>Colombo</option>
            <option>Kandy</option>
            <option>Jaffna</option>
          </select>
          <select className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-gray-700">
            <option>Price Range</option>
            <option>Below 10M</option>
            <option>10M - 30M</option>
            <option>Above 30M</option>
          </select>
          <button type="submit" className="px-8 py-3 bg-[#175676] text-white rounded-lg font-semibold hover:bg-teal-800 transition-all">Search</button>
        </form>
      </div>
      {/* Right: Image */}
      <div className="hidden md:block md:w-1/2 h-full absolute right-0 top-0 bottom-0 z-0">
        <div className="w-full h-full flex items-center justify-center">
          <img src="/assets/images/hero-bg.jpg" alt="Modern Building" className="object-cover w-full h-full max-h-[90vh] rounded-bl-3xl shadow-2xl" />
        </div>
        {/* Diagonal overlay for style */}
        <div
          className="absolute inset-0 clip-diagonal z-[-1]"
          style={{ backgroundColor: '#22577a', opacity: 0.9 }}
        />
      </div>
      {/* Custom diagonal clip-path style */}
      <style>{`
        .clip-diagonal {
          clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 100%);
        }
      `}</style>
    </section>
  );
};

export default HeroPortfolio; 