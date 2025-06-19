import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const ClientTestimonialsPortfolio = () => {
  return (
     <section id="testimonials" className="py-20" style={{ background: 'radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl font-bold text-center mb-12"
          >
            Client Testimonials
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'John Doe', role: 'Property Developer' },
              { name: 'Jane Smith', role: 'Architect' },
              { name: 'Mike Johnson', role: 'Project Manager' }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-3xl shadow-xl bg-white/80 backdrop-blur-md border border-white/40"
              >
                <p className="text-gray-600 mb-4">&quot;SAAN Homes exceeded our expectations with their professional service and attention to detail.&quot;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default ClientTestimonialsPortfolio; 