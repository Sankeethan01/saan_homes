import { motion } from 'framer-motion';

const HeroCompletedProjectsPortfolio = () => {
  return (
    <section className="relative h-[100vh] py-16 overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-[url('/assets/images/hero_pro.png')] bg-cover bg-center z-0" />
      <div className="container mx-auto px-4 h-[25vh] flex items-center justify-start relative z-10">
        <div className="z-10 text-left">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            className="h-1 bg-white mb-8"
          />
          <h1 className="text-6xl font-light mt-150 mb-8 w-xl align-baseline text-white leading-tight text-left">

            <span className="relative">
              Built to Last,
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute bottom-[-6] left-0 h-3 bg-white/20 -z-10"
              />
            </span>{' '}
            <span className="relative inline-block">
              Designed to Inspire
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-[-9] left-0 h-3 bg-white/20 -z-10"
              />
            </span>
          </h1>
          <p className="text-xl text-white/90 w-160 leading-relaxed mb-12 text-justify">
            Take a look at the milestones we've proudly delivered. From residential homes to commercial spaces, each project is a testament to our commitment to quality, precision, and client satisfaction. Explore the structures that speak for our craftsmanship and vision of SAAN Excellence Engineering PVT LTD.
          </p>

        </div>
      </div>
    </section>
  );
};

export default HeroCompletedProjectsPortfolio; 