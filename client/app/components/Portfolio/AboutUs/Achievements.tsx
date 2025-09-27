"use client";

import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '../../../context/LanguageContext';

const getAchievements = (t: any) => [
    { number: 500, label: t.aboutUsPage.achievements.items.projectsCompleted, suffix: "+" },
    { number: 25, label: t.aboutUsPage.achievements.items.yearsExperience, suffix: "+" },
    { number: 100, label: t.aboutUsPage.achievements.items.happyClients, suffix: "%" },
    { number: 200, label: t.aboutUsPage.achievements.items.awardsWon, suffix: "+" }
  ];

const AchievementsAboutUsPortfolio = () => {
  const { t } = useLanguage();
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      animateCounts();
    }
  }, [isInView, hasAnimated]);

  const animateCounts = () => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      
      const newCounts = getAchievements(t).map((achievement) => {
        const progress = currentStep / steps;
        const currentCount = Math.floor(achievement.number * progress);
        return currentCount;
      });

      setCounts(newCounts);

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounts(getAchievements(t).map(a => a.number));
      }
    }, stepDuration);
  };

  return (
    <section ref={ref} className="py-15 bg-[#1b4965] text-white achievements-section">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">{t.aboutUsPage.achievements.title}</h2>
            <p className="text-xl opacity-90">{t.aboutUsPage.achievements.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {getAchievements(t).map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="text-center"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold mb-2"
                  initial={{ scale: 1 }}
                  animate={hasAnimated ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {counts[index]}{achievement.suffix}
                </motion.div>
                <div className="text-lg opacity-90">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default AchievementsAboutUsPortfolio;