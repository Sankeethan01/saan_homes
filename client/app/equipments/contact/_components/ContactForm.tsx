'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactForm = () =>  {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    equipmentType: '',
    rentalDuration: '',
    startDate: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      // Here you would typically make an API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    { name: 'name', label: 'Full Name *', type: 'text', required: true },
    { name: 'email', label: 'Email Address *', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number *', type: 'tel', required: true },
    { name: 'company', label: 'Company Name', type: 'text', required: false },
    { name: 'equipmentType', label: 'Equipment Type *', type: 'select', required: true, options: [
      'Select Equipment Type', 'Excavators', 'Bulldozers', 'Cranes', 'Loaders', 'Trucks', 'Concrete Equipment'
    ]},
    { name: 'rentalDuration', label: 'Rental Duration *', type: 'select', required: true, options: [
      'Select Duration', 'Daily', 'Weekly', 'Monthly', 'Custom Duration'
    ]},
    { name: 'startDate', label: 'Preferred Start Date *', type: 'date', required: true },
  ];

  return (
    <section className="py-12 pt-4 pb-4 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-8 text-[#1b4965]"
            >
              Rental Inquiry Form
            </motion.h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.3 + index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="transition-all duration-200"
                  >
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 hover:border-[#1b4965]/50"
                      >
                        {field.options?.map((option, i) => (
                          <option key={i} value={option === field.options![0] ? '' : option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={formData[field.name as keyof typeof formData]}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 hover:border-[#1b4965]/50"
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="transition-all duration-200"
              >
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 hover:border-[#1b4965]/50"
                  placeholder="Please provide any additional details about your rental needs..."
                />
              </motion.div>

              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                viewport={{ once: true }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#1b4965] hover:bg-[#1b4965]/90'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center text-green-600 bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-block mb-2"
                    >
                      ✅
                    </motion.div>
                    <p>Thank you for your inquiry! We'll get back to you soon.</p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200"
                  >
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="inline-block mb-2"
                    >
                      ❌
                    </motion.div>
                    <p>There was an error submitting your inquiry. Please try again.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </section>
  );
}
export default ContactForm;