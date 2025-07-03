"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiStarLine,
  RiToolsLine,
  RiFileListLine,
  RiTeamLine,
  RiServiceLine,
  RiSaveLine,
} from 'react-icons/ri';
import { FiUpload, FiCalendar, FiUser, FiDollarSign } from 'react-icons/fi';
import Image from 'next/image';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { useRouter } from 'next/navigation';

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

interface Supervisor {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
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
  supervisor: Supervisor;
  status: 'planning' | 'in_progress' | 'completed';
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

interface ItemMap {
  Services: Service[];
  Projects: Project[];
  Testimonials: Testimonial[];
  Equipment: Equipment[];
}

type Editing = { type: 'add' } | { type: 'edit'; id: string } | null;
type ProjectEditing = { type: 'edit'; id: string } | null;

const TABS: { key: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'Services', label: 'Services', icon: RiServiceLine },
  { key: 'Projects', label: 'Projects', icon: RiFileListLine },
  { key: 'Testimonials', label: 'Testimonials', icon: RiTeamLine },
  { key: 'Equipment', label: 'Equipment', icon: RiToolsLine },
];

const PROJECT_STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', max: 3 },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200', max: 3 },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', max: 3 },
};

export default function AdminPortfolioPage() {
  const [tab, setTab] = useState<Tab>('Services');
  const [items, setItems] = useState<ItemMap>({
    Services: [],
    Projects: [],
    Testimonials: [],
    Equipment: [],
  });
  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState<{ name: string; desc: string; icon?: File | null }>({ 
    name: '', 
    desc: '', 
    icon: null 
  });
  const [projectEditing, setProjectEditing] = useState<ProjectEditing>(null);
  const [projectDesc, setProjectDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);

  // Helper function to determine project status
  const getProjectStatus = (project: Project): 'planning' | 'in_progress' | 'completed' => {
    if (project.is_completed) return 'completed';
    if (project.start_date && new Date(project.start_date) > new Date()) return 'planning';
    return 'in_progress';
  };

  // Get landing page counts
  const getLandingPageCounts = () => {
    const projectsByStatus = items.Projects.reduce((acc, project) => {
      const status = getProjectStatus(project);
      if (!acc[status]) acc[status] = 0;
      if (project.showOnLanding) acc[status]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      services: items.Services.filter(s => s.showOnLanding).length,
      projects: {
        planning: projectsByStatus.planning || 0,
        in_progress: projectsByStatus.in_progress || 0,
        completed: projectsByStatus.completed || 0,
        total: Object.values(projectsByStatus).reduce((sum, count) => sum + count, 0),
      },
      testimonials: items.Testimonials.filter(t => t.showOnLanding).length,
      equipment: items.Equipment.filter(e => e.showOnLanding).length,
    };
  };

  // Fetch data from backend
  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = '';
        switch (tab) {
          case 'Services':
            url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/services/`;
            break;
          case 'Equipment':
            url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/equipments/equipment/`;
            break;
          case 'Projects':
            url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`;
            break;
          case 'Testimonials':
            url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/testimonials/`;
            break;
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearToken();
            router.replace('/dashboard/login');
            return;
          }
          throw new Error(`Failed to fetch ${tab.toLowerCase()}`);
        }

        const data = await response.json();
        
        switch (tab) {
          case 'Services':
            setItems(prev => ({
              ...prev,
              Services: data.map((s: any) => ({
                id: s.id,
                name: s.title,
                desc: s.description,
                icon: s.icon,
                showOnLanding: false,
              })),
            }));
            break;
          case 'Equipment':
            setItems(prev => ({
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
            break;
          case 'Projects':
            setItems(prev => ({
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
                status: p.is_completed ? 'completed' : 
                        (p.start_date && new Date(p.start_date) > new Date()) ? 'planning' : 'in_progress',
              })),
            }));
            break;
          case 'Testimonials':
            setItems(prev => ({
              ...prev,
              Testimonials: data.map((t: any) => ({
                id: t.id,
                name: t.name,
                desc: t.text,
                avatar: t.avatar,
                showOnLanding: false,
              })),
            }));
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${tab}:`, error);
        setItems(prev => ({ ...prev, [tab]: [] }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, tab, router, clearToken]);

  // Service handlers
  const handleAdd = () => {
    setEditing({ type: 'add' });
    setForm({ name: '', desc: '', icon: null });
  };

  const handleEdit = (item: Service) => {
    setEditing({ type: 'edit', id: item.id });
    setForm({ name: item.name, desc: item.desc, icon: null });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/portfolio/services/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setItems(prev => ({
        ...prev,
        Services: prev.Services.filter(item => item.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setActionLoading(false);
    }
  };

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
      
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to save');
      const data = await response.json();
      
      if (editing.type === 'add') {
        setItems(prev => ({
          ...prev,
          Services: [...prev.Services, {
            id: data.id,
            name: data.title,
            desc: data.description,
            icon: data.icon,
            showOnLanding: false,
          }],
        }));
      } else {
        setItems(prev => ({
          ...prev,
          Services: prev.Services.map(item =>
            item.id === data.id ? {
              id: data.id,
              name: data.title,
              desc: data.description,
              icon: data.icon,
              showOnLanding: item.showOnLanding,
            } : item
          ),
        }));
      }
      
      setEditing(null);
      setForm({ name: '', desc: '', icon: null });
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle landing page visibility with limits
  const handleToggleShowOnLanding = (id: string) => {
    const counts = getLandingPageCounts();
    
    if (tab === 'Projects') {
      const project = items.Projects.find(p => p.id === id);
      if (!project) return;
      
      const status = getProjectStatus(project);
      const currentCount = counts.projects[status];
      const maxCount = PROJECT_STATUS_CONFIG[status].max;
      
      if (!project.showOnLanding && currentCount >= maxCount) {
        alert(`You can only select ${maxCount} projects for ${PROJECT_STATUS_CONFIG[status].label} status on the landing page.`);
        return;
      }
    } else if (tab === 'Equipment') {
      const currentCount = counts.equipment;
      const item = items.Equipment.find(e => e.id === id);
      if (!item?.showOnLanding && currentCount >= 9) {
        alert('You can only select up to 9 equipment items for the landing page.');
        return;
      }
    }
    
    setItems(prev => ({
      ...prev,
      [tab]: prev[tab].map((item: any) =>
        item.id === id ? { ...item, showOnLanding: !item.showOnLanding } : item
      ),
    }));
  };

  // Project description editing
  const handleProjectEdit = (project: Project) => {
    setProjectEditing({ type: 'edit', id: project.id });
    setProjectDesc(project.desc);
  };

  const handleProjectDescSave = (projectId: string) => {
    setItems(prev => ({
      ...prev,
      Projects: prev.Projects.map(proj =>
        proj.id === projectId ? { ...proj, desc: projectDesc } : proj
      ),
    }));
    setProjectEditing(null);
    setProjectDesc('');
  };

  const counts = getLandingPageCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
            Portfolio Management
          </h1>
          <p className="text-slate-600 mt-1">Manage content displayed on the landing page</p>
        </div>
      </div>

      {/* Landing Page Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <RiStarLine className="w-5 h-5 text-yellow-500" />
          Landing Page Content Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Services</p>
                <p className="text-2xl font-bold text-blue-900">{counts.services}</p>
                <p className="text-xs text-blue-600">All services shown</p>
              </div>
              <RiServiceLine className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Projects</p>
                <p className="text-2xl font-bold text-green-900">{counts.projects.total}/9</p>
                <p className="text-xs text-green-600">
                  P:{counts.projects.planning} | IP:{counts.projects.in_progress} | C:{counts.projects.completed}
                </p>
              </div>
              <RiFileListLine className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Testimonials</p>
                <p className="text-2xl font-bold text-purple-900">{counts.testimonials}</p>
                <p className="text-xs text-purple-600">No limit</p>
              </div>
              <RiTeamLine className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Equipment</p>
                <p className="text-2xl font-bold text-orange-900">{counts.equipment}/9</p>
                <p className="text-xs text-orange-600">Max 6-9 items</p>
              </div>
              <RiToolsLine className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setEditing(null);
                setProjectEditing(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                tab === key
                  ? 'bg-[#1b4965] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                tab === key 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {items[key].length}
              </span>
            </button>
          ))}
        </div>

        {/* Add Service Button */}
        {tab === 'Services' && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleAdd}
              disabled={actionLoading}
              className="bg-[#1b4965] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <RiAddLine className="w-4 h-4" />
              Add New Service
            </button>
          </div>
        )}

        {/* Content based on tab */}
        <div className="space-y-4">
          {tab === 'Services' && (
            <>
              {items.Services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.Services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {service.icon && (
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                            <Image
                              src={service.icon}
                              alt="Service icon"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{service.name}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{service.desc}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            disabled={actionLoading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit service"
                          >
                            <RiEditLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete service"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => setItems(prev => ({
                            ...prev,
                            Services: prev.Services.map(s =>
                              s.id === service.id ? { ...s, showOnLanding: !s.showOnLanding } : s
                            ),
                          }))}
                          className={`p-2 rounded-lg transition-colors ${
                            service.showOnLanding
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={service.showOnLanding ? 'Visible on landing' : 'Hidden from landing'}
                        >
                          {service.showOnLanding ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RiServiceLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No services yet</h3>
                  <p className="text-slate-500 mb-4">Add your first service to get started</p>
                  <button
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-blue-500 to-[#1b4965] text-white px-4 py-2 rounded-lg"
                  >
                    Add Service
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'Projects' && (
            <>
              {Object.entries(PROJECT_STATUS_CONFIG).map(([status, config]) => {
                const projectsInStatus = items.Projects.filter(p => getProjectStatus(p) === status);
                const selectedCount = projectsInStatus.filter(p => p.showOnLanding).length;
                
                return (
                  <div key={status} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium border ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-sm text-slate-500">
                          ({selectedCount}/{config.max} selected for landing)
                        </span>
                      </h3>
                    </div>
                    
                    {projectsInStatus.length > 0 ? (
                      <div className="space-y-3">
                        {projectsInStatus.map((project) => (
                          <div
                            key={project.id}
                            className="bg-white rounded-lg p-4 border border-slate-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900">{project.name}</h4>
                                
                                {projectEditing && projectEditing.id === project.id ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={projectDesc}
                                      onChange={(e) => setProjectDesc(e.target.value)}
                                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows={3}
                                      placeholder="Project description..."
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleProjectDescSave(project.id)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"
                                      >
                                        <RiSaveLine className="w-3 h-3" />
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setProjectEditing(null)}
                                        className="px-3 py-1 bg-slate-300 text-slate-700 rounded-lg text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1">
                                    <p className="text-sm text-slate-600">{project.desc}</p>
                                    <button
                                      onClick={() => handleProjectEdit(project)}
                                      className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                                    >
                                      Edit description
                                    </button>
                                  </div>
                                )}
                                
                                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                  {project.start_date && (
                                    <span className="flex items-center gap-1">
                                      <FiCalendar className="w-3 h-3" />
                                      {project.start_date}
                                    </span>
                                  )}
                                  {project.supervisor && (
                                    <span className="flex items-center gap-1">
                                      <FiUser className="w-3 h-3" />
                                      {typeof project.supervisor === 'object' 
                                        ? `${project.supervisor.first_name || ''} ${project.supervisor.last_name || ''}`.trim() || project.supervisor.username
                                        : project.supervisor}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleToggleShowOnLanding(project.id)}
                                disabled={!project.showOnLanding && selectedCount >= config.max}
                                className={`p-2 rounded-lg transition-colors ${
                                  project.showOnLanding
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : selectedCount >= config.max
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                                title={
                                  project.showOnLanding 
                                    ? 'Remove from landing page' 
                                    : selectedCount >= config.max
                                    ? `Maximum ${config.max} projects allowed for ${config.label}`
                                    : 'Add to landing page'
                                }
                              >
                                {project.showOnLanding ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">No {config.label.toLowerCase()} projects found</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {tab === 'Testimonials' && (
            <>
              {items.Testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.Testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {testimonial.avatar ? (
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                            <FiUser className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
                          <p className="text-sm text-slate-600 line-clamp-3">{testimonial.desc}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleToggleShowOnLanding(testimonial.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            testimonial.showOnLanding
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={testimonial.showOnLanding ? 'Visible on landing' : 'Hidden from landing'}
                        >
                          {testimonial.showOnLanding ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RiTeamLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No testimonials yet</h3>
                  <p className="text-slate-500">Customer testimonials will appear here</p>
                </div>
              )}
            </>
          )}

          {tab === 'Equipment' && (
            <>
              {items.Equipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.Equipment.map((equipment, index) => (
                    <motion.div
                      key={equipment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {equipment.image ? (
                          <Image
                            src={equipment.image}
                            alt={equipment.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                            <RiToolsLine className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{equipment.name}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{equipment.desc}</p>
                          {equipment.category && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {equipment.category}
                            </span>
                          )}
                          {equipment.daily_rate && (
                            <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">
                              <FiDollarSign className="w-3 h-3" />
                              ${equipment.daily_rate}/day
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleToggleShowOnLanding(equipment.id)}
                          disabled={!equipment.showOnLanding && counts.equipment >= 9}
                          className={`p-2 rounded-lg transition-colors ${
                            equipment.showOnLanding
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : counts.equipment >= 9
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={
                            equipment.showOnLanding 
                              ? 'Remove from landing page' 
                              : counts.equipment >= 9
                              ? 'Maximum 9 equipment items allowed'
                              : 'Add to landing page'
                          }
                        >
                          {equipment.showOnLanding ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RiToolsLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No equipment yet</h3>
                  <p className="text-slate-500">Equipment items will appear here</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Service Add/Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold bg-[#1b4965] bg-clip-text text-transparent">
                  {editing.type === 'add' ? 'Add New Service' : 'Edit Service'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="serviceName" className="block text-sm font-medium text-slate-700 mb-1">
                    Service Name
                  </label>
                  <input
                    id="serviceName"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                    required
                    disabled={actionLoading}
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <label htmlFor="serviceDescription" className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="serviceDescription"
                    value={form.desc}
                    onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                    rows={3}
                    required
                    disabled={actionLoading}
                    placeholder="Enter service description"
                  />
                </div>

                <div>
                  <label htmlFor="serviceIcon" className="block text-sm font-medium text-slate-700 mb-1">
                    Service Icon
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <FiUpload className="w-4 h-4 mr-2 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        {form.icon ? form.icon.name : 'Choose icon file'}
                      </span>
                      <input
                        id="serviceIcon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm(f => ({ ...f, icon: e.target.files?.[0] || null }))}
                        className="hidden"
                        disabled={actionLoading}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : 'Save Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
