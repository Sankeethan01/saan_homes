"use client";
import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import React from 'react';

// Types
interface Service {
  id: string;
  name: string;
  desc: string;
  icon?: string;
  showOnLanding?: boolean;
}
interface ProjectPhoto {
  id: number;
  url: string;
  showInGallery: boolean;
}
interface Project {
  id: string;
  name: string;
  desc: string;
  showOnLanding?: boolean;
  photos?: ProjectPhoto[];
  category?: string;
  start_date?: string;
  estimated_end_date?: string;
  is_completed: boolean;
  supervisor: any;
}
interface Testimonial {
  id: string;
  name: string;
  desc: string;
  showOnLanding?: boolean;
  avatar?: string;
}
interface Equipment {
  id: string;
  name: string;
  desc: string;
  category?: string;
  image?: string;
  daily_rate?: number;
  showOnLanding?: boolean;
}
type Tab = 'Services' | 'Projects' | 'Testimonials' | 'Equipment';
type ItemMap = {
  Services: Service[];
  Projects: Project[];
  Testimonials: Testimonial[];
  Equipment: Equipment[];
};
type Editing = { type: 'add' } | { type: 'edit'; id: string } | null;
type ProjectEditing = { type: 'edit'; id: string } | null;

const TABS: Tab[] = ['Services', 'Projects', 'Testimonials', 'Equipment'];

export default function AdminPortfolioPage() {
  const [tab, setTab] = useState<Tab>('Services');
  const [items, setItems] = useState<ItemMap>({
    Services: [],
    Projects: [],
    Testimonials: [],
    Equipment: [],
  });
  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState<{ name: string; desc: string; icon?: File | null }>({ name: '', desc: '', icon: null });
  const [projectEditing, setProjectEditing] = useState<ProjectEditing>(null);
  const [projectDesc, setProjectDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  // Fetch services from backend
  React.useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }
    if (tab === 'Services') {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/services/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              clearToken();
              router.replace('/dashboard/login');
              return;
            }
            throw new Error('Failed to fetch services');
          }
          const data = await res.json();
          setItems((prev) => ({
            ...prev,
            Services: data.map((s: any) => ({
              id: s.id,
              name: s.title,
              desc: s.description,
              icon: s.icon,
              showOnLanding: false,
            })),
          }));
        })
        .catch(() => setItems((prev) => ({ ...prev, Services: [] })))
        .finally(() => setLoading(false));
    } else if (tab === 'Equipment') {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              clearToken();
              router.replace('/dashboard/login');
              return;
            }
            throw new Error('Failed to fetch equipment');
          }
          const data = await res.json();
          setItems((prev) => ({
            ...prev,
            Equipment: data.map((e: any) => ({
              id: e.id,
              name: e.name,
              desc: e.description,
              category: e.category_name || '',
              image: e.image,
              daily_rate: e.daily_rate,
              showOnLanding: false,
            })),
          }));
        })
        .catch(() => setItems((prev) => ({ ...prev, Equipment: [] })))
        .finally(() => setLoading(false));
    } else if (tab === 'Projects') {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              clearToken();
              router.replace('/dashboard/login');
              return;
            }
            throw new Error('Failed to fetch projects');
          }
          const data = await res.json();
          setItems((prev) => ({
            ...prev,
            Projects: data.map((p: any) => ({
              id: p.id,
              name: p.name,
              desc: p.description,
              showOnLanding: false,
              photos: [],
              category: '',
              start_date: p.start_date,
              estimated_end_date: p.estimated_end_date,
              is_completed: p.is_completed,
              supervisor: p.supervisor,
            })),
          }));
        })
        .catch(() => setItems((prev) => ({ ...prev, Projects: [] })))
        .finally(() => setLoading(false));
    } else if (tab === 'Testimonials') {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/testimonials/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              clearToken();
              router.replace('/dashboard/login');
              return;
            }
            throw new Error('Failed to fetch testimonials');
          }
          const data = await res.json();
          setItems((prev) => ({
            ...prev,
            Testimonials: data.map((t: any) => ({
              id: t.id,
              name: t.name,
              desc: t.text,
              avatar: t.avatar,
              showOnLanding: false,
            })),
          }));
        })
        .catch(() => setItems((prev) => ({ ...prev, Testimonials: [] })))
        .finally(() => setLoading(false));
    }
  }, [token, tab, router, clearToken]);

  // Add Service
  const handleAdd = () => {
    setEditing({ type: 'add' });
    setForm({ name: '', desc: '', icon: null });
  };
  // Edit Service
  const handleEdit = (item: Service) => {
    setEditing({ type: 'edit', id: item.id });
    setForm({ name: item.name, desc: item.desc, icon: null });
  };
  // Delete Service
  const handleDelete = async (id: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/services/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setItems((prev) => ({
        ...prev,
        Services: prev.Services.filter((item) => item.id !== id),
      }));
    } catch {
      // Optionally show error
    } finally {
      setActionLoading(false);
    }
  };
  // Submit Add/Edit Service
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing || !token) return;
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.name);
      formData.append('description', form.desc);
      if (form.icon) formData.append('icon', form.icon);
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/services/`;
      let method: 'POST' | 'PATCH' = 'POST';
      if (editing.type === 'edit') {
        url += `${editing.id}/`;
        method = 'PATCH';
      }
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      if (editing.type === 'add') {
        setItems((prev) => ({
          ...prev,
          Services: [
            ...prev.Services,
            {
              id: data.id,
              name: data.title,
              desc: data.description,
              icon: data.icon,
              showOnLanding: false,
            },
          ],
        }));
      } else {
        setItems((prev) => ({
          ...prev,
          Services: prev.Services.map((item) =>
            item.id === data.id
              ? {
                  id: data.id,
                  name: data.title,
                  desc: data.description,
                  icon: data.icon,
                  showOnLanding: item.showOnLanding,
                }
              : item
          ),
        }));
      }
      setEditing(null);
      setForm({ name: '', desc: '', icon: null });
    } catch {
      // Optionally show error
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle showOnLanding for Projects/Testimonials/Equipment
  const handleToggleShowOnLanding = (id: string) => {
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
  const handleProjectDescSave = (projectId: string) => {
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
  const handleTogglePhotoInGallery = (projectId: string, photoId: number) => {
    setItems((prev) => ({
      ...prev,
      Projects: prev.Projects.map((proj) =>
        proj.id === projectId
          ? {
              ...proj,
              photos: proj.photos?.map((photo) =>
                photo.id === photoId
                  ? { ...photo, showInGallery: !photo.showInGallery }
                  : photo
              ),
            }
          : proj
      ),
    }));
  };

  // Toggle showOnLanding for Services
  const handleServiceShowOnLanding = (id: string) => {
    setItems((prev) => ({
      ...prev,
      Services: prev.Services.map((service) =>
        service.id === id ? { ...service, showOnLanding: !service.showOnLanding } : service
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
      {tab === "Services" && (
        <div className="mb-4 flex justify-end">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleAdd}
            disabled={actionLoading}
          >
            Add New
          </button>
        </div>
      )}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{tab}</h2>
        </div>
        {tab === "Services" && loading ? (
          <div className="py-8 text-center text-gray-400">Loading...</div>
        ) : (
          <ul className="divide-y">
            {tab === "Projects"
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
                        {project.photos?.map((photo) => (
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
              : Array.isArray(items[tab]) ? (items[tab] as any[]).map((item) => (
                  <li key={item.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {tab === "Services" && item.icon && (
                        <img src={item.icon} alt="icon" className="w-8 h-8 object-contain rounded" />
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.desc}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {tab === "Services" ? (
                        <>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                            onClick={() => handleEdit(item as Service)}
                            disabled={actionLoading}
                          >
                            Edit
                          </button>
                          <div className="relative group ml-2 inline-block">
                            <button
                              type="button"
                              className={`border rounded-full p-2 bg-white transition-colors duration-200 flex items-center justify-center ${item.showOnLanding ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-400'}`}
                              onClick={() => handleServiceShowOnLanding(item.id)}
                              aria-label="Apply to landing"
                              disabled={actionLoading}
                            >
                              <FaCheck />
                            </button>
                            <span className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded bg-black text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                              Apply to landing
                            </span>
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200"
                            onClick={() => handleDelete(item.id)}
                            aria-label="Delete"
                            disabled={actionLoading}
                          >
                            <RiDeleteBinLine />
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
                )) : null}
          </ul>
        )}
        {tab === "Services" && editing && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              className="w-full border px-3 py-2 rounded"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              disabled={actionLoading}
            />
            <textarea
              className="w-full border px-3 py-2 rounded"
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              required
              disabled={actionLoading}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.files?.[0] || null }))}
              className="w-full border px-3 py-2 rounded"
              disabled={actionLoading}
            />
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={actionLoading}>
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                type="button"
                onClick={() => setEditing(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {tab === "Equipment" && loading ? (
          <div className="py-8 text-center text-gray-400">Loading...</div>
        ) : null}
        {tab === "Equipment" && !loading && (
          <ul className="divide-y">
            {Array.isArray(items.Equipment) && items.Equipment.map((item) => (
              <li key={item.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                    {item.category && (
                      <div className="text-xs text-gray-400">Category: {item.category}</div>
                    )}
                    {item.daily_rate !== undefined && (
                      <div className="text-xs text-gray-400">Daily Rate: ${item.daily_rate}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className={`border rounded-full p-2 bg-white transition-colors duration-200 flex items-center justify-center ${item.showOnLanding ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-400'}`}
                  >
                    <FaCheck />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {tab === "Projects" && loading ? (
          <div className="py-8 text-center text-gray-400">Loading...</div>
        ) : null}
        {tab === "Projects" && !loading && (
          <ul className="divide-y">
            {Array.isArray(items.Projects) && items.Projects.map((project) => (
              <li key={project.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-gray-500 text-sm flex items-center gap-2">
                      {project.desc}
                    </div>
                    {project.start_date && (
                      <div className="text-xs text-gray-400">Start: {project.start_date}</div>
                    )}
                    {project.estimated_end_date && (
                      <div className="text-xs text-gray-400">End: {project.estimated_end_date}</div>
                    )}
                    {project.supervisor && (
                      <div className="text-xs text-gray-400">Supervisor: {typeof project.supervisor === 'object' ? (project.supervisor.first_name && project.supervisor.last_name ? `${project.supervisor.first_name} ${project.supervisor.last_name}` : project.supervisor.username) : project.supervisor}</div>
                    )}
                    <div className="text-xs text-gray-400">Status: {project.is_completed ? 'Completed' : 'In Progress'}</div>
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
              </li>
            ))}
          </ul>
        )}
        {tab === "Testimonials" && loading ? (
          <div className="py-8 text-center text-gray-400">Loading...</div>
        ) : null}
        {tab === "Testimonials" && !loading && (
          <ul className="divide-y">
            {Array.isArray(items.Testimonials) && items.Testimonials.map((item) => (
              <li key={item.id} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.avatar && (
                    <img src={item.avatar} alt={item.name} className="w-10 h-10 object-cover rounded-full" />
                  )}
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-sm">{item.desc}</div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!item.showOnLanding}
                    onChange={() => handleToggleShowOnLanding(item.id)}
                  />
                  <span className="text-sm">Show on Landing Page</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
