"use client";

import { motion } from "framer-motion";
import { RiMapPinLine, RiPhoneLine, RiMailLine, RiTimeLine } from "react-icons/ri";
import { useLanguage } from '../../../context/LanguageContext';



const contactInfo = {
    address: "No.47, Courts Road, Point Pedo, Jaffna.",
    phone: "+94 77 727 6391",
    email: "saanexeng@gmail.com",
    workingHours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 4:00 PM"
  };

const ContactAboutUsPortfolio = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1b4965] mb-4">{t.aboutUsPage.contact.title}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
            {t.aboutUsPage.contact.subtitle}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-gray-50 p-8 rounded-xl">
                <h3 className="text-2xl font-semibold text-[#1b4965] mb-6">{t.aboutUsPage.contact.getInTouch}</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <RiMapPinLine className="text-[#1b4965] text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{t.aboutUsPage.contact.address}</h4>
                      <p className="text-gray-600">{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <RiPhoneLine className="text-[#1b4965] text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{t.aboutUsPage.contact.phone}</h4>
                      <p className="text-gray-600">{contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <RiMailLine className="text-[#1b4965] text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{t.aboutUsPage.contact.email}</h4>
                      <p className="text-gray-600">{contactInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <RiTimeLine className="text-[#1b4965] text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{t.aboutUsPage.contact.workingHours}</h4>
                      <p className="text-gray-600">{contactInfo.workingHours}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Google Maps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="h-96 rounded-xl overflow-hidden shadow-lg"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.3212424868016!2d80.23197847795156!3d9.823363365193302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3aff030020e64cdd%3A0x2e005fe73d75cf54!2sSAAN%20Travels%20and%20Rent%20a%20car!5e0!3m2!1sen!2slk!4v1751102216025!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SAAN Homes Location"
              />
            </motion.div>
          </div>
        </div>
      </section>
  );
}

export default  ContactAboutUsPortfolio;