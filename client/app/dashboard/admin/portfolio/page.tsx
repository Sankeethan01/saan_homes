"use client";
import { useState } from 'react';

// Types
interface Service {
  id: number;
  name: string;
  desc: string;
}
interface ProjectPhoto {
  id: number;
  url: string;
  showInGallery: boolean;
}
interface Project {
  id: number;
  name: string;
  desc: string;
  showOnLanding: boolean;
  photos: ProjectPhoto[];
}
interface Testimonial {
  id: number;
  name: string;
  desc: string;
  showOnLanding: boolean;
}
interface Equipment {
  id: number;
  name: string;
  desc: string;
  showOnLanding: boolean;
}
type Tab = 'Services' | 'Projects' | 'Testimonials' | 'Equipment';
type ItemMap = {
  Services: Service[];
  Projects: Project[];
  Testimonials: Testimonial[];
  Equipment: Equipment[];
};
type Editing = { type: 'add' } | { type: 'edit'; id: number } | null;
type ProjectEditing = { type: 'edit'; id: number } | null;

const TABS: Tab[] = ['Services', 'Projects', 'Testimonials', 'Equipment'];

export default function AdminPortfolioPage() {
  const [tab, setTab] = useState<Tab>('Services');
  const [items, setItems] = useState<ItemMap>({
    Services: [
      { id: 1, name: 'Custom Home', desc: 'Build your dream home.' },
    ],
    Projects: [
      {
        id: 1,
        name: 'Modern Villa',
        desc: 'Luxury villa project.',
        showOnLanding: false,
        photos: [
          { id: 1, url: '/public/globe.svg', showInGallery: true },
          { id: 2, url: '/public/window.svg', showInGallery: false },
        ],
      },
      {
        id: 2,
        name: 'Urban Loft',
        desc: 'City living.',
        showOnLanding: true,
        photos: [
          { id: 3, url: '/public/next.svg', showInGallery: true },
        ],
      },
    ],
    Testimonials: [
      { id: 1, name: 'John Doe', desc: 'Great service!', showOnLanding: true },
      { id: 2, name: 'Jane Smith', desc: 'Amazing experience!', showOnLanding: false },
    ],
    Equipment: [
      { id: 1, name: 'Excavator', desc: 'Heavy duty.', showOnLanding: false },
      { id: 2, name: 'Bulldozer', desc: 'Earth moving.', showOnLanding: true },
    ],
  });
  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState<{ name: string; desc: string }>({ name: '', desc: '' });
  const [projectEditing, setProjectEditing] = useState<ProjectEditing>(null);
  const [projectDesc, setProjectDesc] = useState('');

  // Handlers for Services
  const handleAdd = () => {
    setEditing({ type: 'add' });
    setForm({ name: '', desc: '' });
  };
  const handleEdit = (item: Service) => {
    setEditing({ type: 'edit', id: item.id });
    setForm({ name: item.name, desc: item.desc });
  };
  const handleDelete = (id: number) => {
    setItems((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((item) => item.id !== id) as any,
    }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    if (editing.type === 'add') {
      setItems((prev) => ({
        ...prev,
        [tab]: [
          ...prev[tab],
          { id: Date.now(), name: form.name, desc: form.desc },
        ] as any,
      }));
    } else if (editing.type === 'edit') {
      setItems((prev) => ({
        ...prev,
        [tab]: prev[tab].map((item) =>
          item.id === editing.id ? { ...item, ...form } : item
        ) as any,
      }));
    }
    setEditing(null);
    setForm({ name: '', desc: '' });
  };

  // Toggle showOnLanding for Projects/Testimonials/Equipment
  const handleToggleShowOnLanding = (id: number) => {
    setItems((prev) => ({
      ...prev,
      [tab]: prev[tab].map((item) =>
        item.id === id ? { ...item, showOnLanding: !('showOnLanding' in item ? item.showOnLanding : false) } : item
      ) as any,
    }));
  };

  // Project description edit
  const handleProjectEdit = (project: Project) => {
    setProjectEditing({ type: 'edit', id: project.id });
    setProjectDesc(project.desc);
  };
  const handleProjectDescSave = (projectId: number) => {
    setItems((prev) => ({
      ...prev,
      Projects: prev.Projects.map((proj) =>
        proj.id === projectId ? { ...proj, desc: projectDesc } : proj
      ),
    }));
    setProjectEditing(null);
    setProjectDesc('');
  };

  // Toggle photo in gallery
  const handleTogglePhotoInGallery = (projectId: number, photoId: number) => {
    setItems((prev) => ({
      ...prev,
      Projects: prev.Projects.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              photos: proj.photos.map((photo) =>
                photo.id === photoId
                  ? { ...photo, showInGallery: !photo.showInGallery }
                  : photo
              ),
            }
          : proj
      ),
    }));
  };

  return (
    <main className="min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-6">Admin Portfolio Management</h1>
      <div className="flex gap-4 mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-white'}`}
            onClick={() => {
              setTab(t);
              setEditing(null);
              setProjectEditing(null);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{tab}</h2>
          {tab === 'Services' && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleAdd}
            >
              Add New
            </button>
          )}
        </div>
        <ul className="divide-y">
          {tab === 'Projects'
            ? (items.Projects as Project[]).map((project) => (
                <li key={project.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {projectEditing && projectEditing.id === project.id ? (
                        <div className="flex gap-2 items-center mt-2">
                          <textarea
                            className="w-full border px-3 py-2 rounded"
                            value={projectDesc}
                            onChange={(e) => setProjectDesc(e.target.value)}
                          />
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                            onClick={() => handleProjectDescSave(project.id)}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-300 px-3 py-1 rounded"
                            onClick={() => setProjectEditing(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm flex items-center gap-2">
                          {project.desc}
                          <button
                            className="text-blue-500 underline text-xs"
                            onClick={() => handleProjectEdit(project)}
                          >
                            Edit Description
                          </button>
                        </div>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!project.showOnLanding}
                        onChange={() => handleToggleShowOnLanding(project.id)}
                      />
                      <span className="text-sm">Show on Landing Page</span>
                    </label>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold mb-1">Gallery Photos</div>
                    <div className="flex gap-4 flex-wrap">
                      {project.photos.map((photo) => (
                        <div key={photo.id} className="flex flex-col items-center">
                          <img
                            src={photo.url}
                            alt="Project Photo"
                            className="w-20 h-20 object-contain border rounded mb-1"
                          />
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={photo.showInGallery}
                              onChange={() => handleTogglePhotoInGallery(project.id, photo.id)}
                            />
                            Show in Gallery
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              ))
            : items[tab].map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {tab === 'Services' ? (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded"
                          onClick={() => handleEdit(item as Service)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!('showOnLanding' in item && item.showOnLanding)}
                          onChange={() => handleToggleShowOnLanding(item.id)}
                        />
                        <span className="text-sm">Show on Landing Page</span>
                      </label>
                    )}
                  </div>
                </li>
              ))}
        </ul>
        {tab === 'Services' && editing && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <textarea
              className="w-full border px-3 py-2 rounded"
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              required
            />
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
