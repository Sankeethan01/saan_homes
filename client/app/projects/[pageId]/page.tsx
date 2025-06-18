
// import Image from 'next/image';
// import { motion } from 'framer-motion';

// // Placeholder data (replace with real data fetching as needed)
// const projectData = {
//   title: 'Modern Villa',
//   description: `This modern villa project features contemporary architecture, sustainable materials, and smart home technology. The design emphasizes open spaces, natural light, and seamless indoor-outdoor living. Key highlights include a rooftop garden, infinity pool, and energy-efficient systems throughout the property.`,
//   images: [
//     '/projects/modern-villa-1.jpg',
//     '/projects/modern-villa-2.jpg',
//     '/projects/modern-villa-3.jpg',
//   ],
//   video: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example video
// };

// export default function ProjectDetailPage() {
//   // In a real app, fetch project data based on pageid param
//   // const router = useRouter();
//   // const { pageid } = router.query;

//   return (
//     <main className="min-h-screen bg-gray-50 py-12">
//       <div className="container mx-auto px-4 max-w-5xl">
//         {/* Title */}
//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
//         >
//           {projectData.title}
//         </motion.h1>
//         {/* Description */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="text-lg text-gray-600 mb-8"
//         >
//           {projectData.description}
//         </motion.p>
//         {/* Image Gallery */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           {projectData.images.map((img, idx) => (
//             <motion.div
//               key={img}
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.3 + idx * 0.1 }}
//               className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg"
//             >
//               <Image src={img} alt={`Project image ${idx + 1}`} fill className="object-cover" />
//             </motion.div>
//           ))}
//         </div>
//         {/* Video Section */}
//         {projectData.video && (
//           <div className="mb-10">
//             <h2 className="text-2xl font-semibold mb-4 text-gray-800">Project Video</h2>
//             <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-lg">
//               <iframe
//                 src={projectData.video}
//                 title="Project Video"
//                 frameBorder="0"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 className="w-full h-full"
//               ></iframe>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
