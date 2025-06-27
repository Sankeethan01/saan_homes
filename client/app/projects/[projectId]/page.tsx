// import Image from 'next/image';
// import { motion } from 'framer-motion';

// interface Project {
//   title: string;
//   description: string;
//   owner: string;
//   price: string;
//   details: string;
//   images: string[];
//   vrVideo?: string;
// }

// const sampleProject: Project = {
//   title: 'Modern Villa',
//   description: `This modern villa project features contemporary architecture, sustainable materials, and smart home technology. The design emphasizes open spaces, natural light, and seamless indoor-outdoor living. Key highlights include a rooftop garden, infinity pool, and energy-efficient systems throughout the property.`,
//   owner: 'John Doe',
//   price: '$1,200,000',
//   details: '4 Bedrooms, 3 Bathrooms, 2,800 sq ft, Rooftop garden, Infinity pool, Smart home system.',
//   images: [
//     '/projects/modern-villa-1.jpg',
//     '/projects/modern-villa-2.jpg',
//     '/projects/modern-villa-3.jpg',
//   ],
//   vrVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
// };

// export default function ProjectDetailDesign({ project }: { project?: Project }) {
//   const proj = project || sampleProject;
//   return (
//     <main className="min-h-screen bg-gray-50 py-12">
//       <div className="container mx-auto px-4 max-w-5xl">
//         {/* Title */}
//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-4xl md:text-5xl font-bold mb-4 text-[#1b4965]"
//         >
//           {proj.title}
//         </motion.h1>
//         {/* Owner, Price, Details */}
//         <div className="mb-6 flex flex-wrap gap-6 text-lg text-gray-700">
//           <div>
//             <span className="font-semibold">Owner:</span> {proj.owner}
//           </div>
//           <div>
//             <span className="font-semibold">Price:</span> {proj.price}
//           </div>
//         </div>
//         <div className="mb-8 text-gray-600">{proj.details}</div>
//         {/* Description */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="text-lg text-gray-600 mb-8"
//         >
//           {proj.description}
//         </motion.p>
//         {/* Image Gallery */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           {proj.images.map((img: string, idx: number) => (
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
//         {/* VR Video Section */}
//         {proj.vrVideo && (
//           <div className="mb-10">
//             <h2 className="text-2xl font-semibold mb-4 text-[#1b4965]">VR/Project Video</h2>
//             <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-lg">
//               <iframe
//                 src={proj.vrVideo}
//                 title="Project VR Video"
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

// export { ProjectDetailDesign };

