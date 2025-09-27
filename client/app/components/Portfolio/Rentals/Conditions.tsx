'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';


const ConditionsRentalsPortfolio = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {/* Heading: above 3rd grid item, in line with 1st row on large screens */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 10 }}
              className="text-3xl font-bold mb-0 mt-8 lg:mt-12 lg:col-start-3 md:col-span-2 md:text-center md:order-first lg:row-start-1 lg:text-center text-[#1b4965]"
            >
              {t.rentalsPage.conditions.title}
            </motion.h2>
            <div className="lg:col-start-3 lg:row-start-1 md:col-span-2 md:order-2 text-center mt-0 mb-4">
              <span className="text-lg md:text-center text-gray-500 font-medium"> &quot;{t.rentalsPage.conditions.subtitle}&quot; </span>
            </div>
            {[
              {
                title: t.rentalsPage.conditions.items.loginRequired.title,
                description: t.rentalsPage.conditions.items.loginRequired.description,
                icon: "🔐"
              },
              {
                title: t.rentalsPage.conditions.items.securityDeposit.title,
                description: t.rentalsPage.conditions.items.securityDeposit.description,
                icon: "💰"
              },
              {
                title: t.rentalsPage.conditions.items.validDocumentation.title,
                description: t.rentalsPage.conditions.items.validDocumentation.description,
                icon: "📄"
              },
              {
                title: t.rentalsPage.conditions.items.minimumRentalPeriod.title,
                description: t.rentalsPage.conditions.items.minimumRentalPeriod.description,
                icon: "⏰"
              },
              {
                title: t.rentalsPage.conditions.items.damagePolicy.title,
                description: t.rentalsPage.conditions.items.damagePolicy.description,
                icon: "🛡️"
              }
            ].map((condition, index) => {
              let gridClass = '';
              if (index === 0) gridClass = 'lg:row-start-1 lg:col-start-1';
              if (index === 1) gridClass = 'lg:row-start-1 lg:col-start-2';
              if (index === 2) gridClass = 'lg:row-start-2 lg:col-start-1';
              if (index === 3) gridClass = 'lg:row-start-2 lg:col-start-2';
              if (index === 4) gridClass = 'lg:row-start-2 lg:col-start-3';
              let colorClass = '';
              if ([t.rentalsPage.conditions.items.securityDeposit.title, t.rentalsPage.conditions.items.validDocumentation.title, t.rentalsPage.conditions.items.damagePolicy.title].includes(condition.title)) {
                colorClass = 'bg-[rgba(27,73,101,0.2)] ' ;
              } else {
                colorClass = 'bg-white';
              }
              return (
                <motion.div
                  key={condition.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.07 }}
                  className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-[#1b4965] ${colorClass} ${gridClass} md:order-3`}
                >
                  <div className="text-4xl mb-4">{condition.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{condition.title}</h3>
                  <p className="text-gray-600">{condition.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
  );
}
export default ConditionsRentalsPortfolio; 