import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const FeaturedProjectsPortfolio = () => {
  return (
     <section id="projects" className="py-17 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              {...fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700"
            >
              Featured Projects
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-600 text-lg"
            >
              Discover our portfolio of exceptional construction projects and architectural achievements
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Modern Villa',
                category: 'Residential',
                image: '/projects/modern-villa.jpg',
                description: 'Contemporary design with sustainable features',
                bgColor: 'bg-blue-50'
              },
              {
                title: 'Commercial Complex',
                category: 'Commercial',
                image: '/projects/commercial.jpg',
                description: 'State-of-the-art office spaces',
                bgColor: 'bg-red-50'
              },
              {
                title: 'Luxury Apartments',
                category: 'Multi-Family',
                image: '/projects/apartments.jpg',
                description: 'High-end residential complex',
                bgColor: 'bg-green-50'
              },
              {
                title: 'Shopping Mall',
                category: 'Retail',
                image: '/projects/mall.jpg',
                description: 'Modern shopping experience center',
                bgColor: 'bg-yellow-50'
              },
              {
                title: 'Smart Homes',
                category: 'Residential',
                image: '/projects/smart-homes.jpg',
                description: 'Technology-integrated living spaces',
                bgColor: 'bg-purple-50'
              },
              {
                title: 'Industrial Park',
                category: 'Industrial',
                image: '/projects/industrial.jpg',
                description: 'Large-scale industrial development',
                bgColor: 'bg-indigo-50'
              }
            ].map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-md border border-white/40`}
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-red-100/40 opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="h-full bg-gray-100 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-600 bg-white/80 backdrop-blur-sm rounded-full`}>
                    {project.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600">{project.description}</p>
                  <Link href="/projects">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      Learn More →
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default FeaturedProjectsPortfolio; 