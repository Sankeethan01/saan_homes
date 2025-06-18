// import { useClient } from 'react';

// const TABS = ['Services', 'Projects', 'Equipment', 'Testimonials'];

// export default function AdminPortfolioPage() {
//   const [tab, setTab] = useState('Services');
//   const [items, setItems] = useState({
//     Services: [{ id: 1, name: 'Custom Home', desc: 'Build your dream home.' }],
//     Projects: [{ id: 1, name: 'Modern Villa', desc: 'Luxury villa project.' }],
//     Equipment: [{ id: 1, name: 'Excavator', desc: 'Heavy duty.' }],
//     Testimonials: [{ id: 1, name: 'John Doe', desc: 'Great service!' }],
//   });
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({ name: '', desc: '' });

//   // Handlers
//   const handleAdd = () => {
//     setEditing({ type: 'add' });
//     setForm({ name: '', desc: '' });
//   };
//   const handleEdit = (item) => {
//     setEditing({ type: 'edit', id: item.id });
//     setForm({ name: item.name, desc: item.desc });
//   };
//   const handleDelete = (id) => {
//     setItems((prev) => ({
//       ...prev,
//       [tab]: prev[tab].filter((item) => item.id !== id),
//     }));
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (editing.type === 'add') {
//       setItems((prev) => ({
//         ...prev,
//         [tab]: [
//           ...prev[tab],
//           { id: Date.now(), name: form.name, desc: form.desc },
//         ],
//       }));
//     } else if (editing.type === 'edit') {
//       setItems((prev) => ({
//         ...prev,
//         [tab]: prev[tab].map((item) =>
//           item.id === editing.id ? { ...item, ...form } : item
//         ),
//       }));
//     }
//     setEditing(null);
//     setForm({ name: '', desc: '' });
//   };

//   return (
//     <main className="min-h-screen bg-gray-50 p-8">
//       <h1 className="text-3xl font-bold mb-6">Admin Portfolio Management</h1>
//       <div className="flex gap-4 mb-8">
//         {TABS.map((t) => (
//           <button
//             key={t}
//             className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-white'}`}
//             onClick={() => setTab(t)}
//           >
//             {t}
//           </button>
//         ))}
//       </div>
//       <div className="bg-white rounded-xl shadow p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">{tab}</h2>
//           <button
//             className="bg-green-500 text-white px-4 py-2 rounded"
//             onClick={handleAdd}
//           >
//             Add New
//           </button>
//         </div>
//         <ul className="divide-y">
//           {items[tab].map((item) => (
//             <li key={item.id} className="py-3 flex justify-between items-center">
//               <div>
//                 <div className="font-medium">{item.name}</div>
//                 <div className="text-gray-500 text-sm">{item.desc}</div>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   className="px-3 py-1 bg-blue-500 text-white rounded"
//                   onClick={() => handleEdit(item)}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   className="px-3 py-1 bg-red-500 text-white rounded"
//                   onClick={() => handleDelete(item.id)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//         {editing && (
//           <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
//             <input
//               className="w-full border px-3 py-2 rounded"
//               placeholder="Name"
//               value={form.name}
//               onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//               required
//             />
//             <textarea
//               className="w-full border px-3 py-2 rounded"
//               placeholder="Description"
//               value={form.desc}
//               onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
//               required
//             />
//             <div className="flex gap-2">
//               <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
//                 Save
//               </button>
//               <button
//                 className="bg-gray-300 px-4 py-2 rounded"
//                 type="button"
//                 onClick={() => setEditing(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </main>
//   );
// }
