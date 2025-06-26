'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/stores/useAuthStore';
import axios from 'axios';
import {
  RiBuildingLine,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiUploadLine,
  RiCheckLine,
  RiTimeLine,
  RiProgress1Line,
  RiEyeLine,
  RiEditLine,
  RiDownloadLine,
} from 'react-icons/ri';

interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  estimated_end_date: string;
  supervisor: string | { id: string; first_name: string; last_name: string; email: string };
  boq_file?: string;
  is_completed: boolean;
  location: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progress: number;
  currentStep: string;
  client: string;
  budget: number;
  steps: ProjectStep[];
}

interface ProjectStep {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  progress: number;
  logs: ProgressLog[];
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: MediaFile[];
  timestamp: string;
  type: 'TEXT' | 'PHOTO' | 'VIDEO';
}

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'pdf';
  filename: string;
}

export default function SupervisorProjectsPage() {
  const token = useAuthStore((s) => s.token);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'timeline' | 'invoices'>('overview');

  useEffect(() => {
    if (!token) return;
    
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects/supervisor-projects/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        // Mock data for development
        setProjects([
          {
            id: '1',
            name: 'Modern Office Complex',
            description: 'Construction of a 5-story modern office building with sustainable features',
            location: 'Downtown Business District',
            start_date: '2024-01-01',
            estimated_end_date: '2024-12-31',
            status: 'IN_PROGRESS',
            progress: 65,
            currentStep: 'Electrical Installation',
            supervisor: 'John Smith',
            client: 'TechCorp Inc.',
            budget: 2500000,
            is_completed: false,
            steps: [
              {
                id: '1',
                name: 'Foundation',
                description: 'Site preparation and foundation work',
                status: 'COMPLETED',
                startDate: '2024-01-01',
                endDate: '2024-02-15',
                progress: 100,
                logs: []
              },
              {
                id: '2',
                name: 'Framing',
                description: 'Structural framework construction',
                status: 'COMPLETED',
                startDate: '2024-02-16',
                endDate: '2024-04-30',
                progress: 100,
                logs: []
              },
              {
                id: '3',
                name: 'Electrical Installation',
                description: 'Electrical systems and wiring',
                status: 'IN_PROGRESS',
                startDate: '2024-05-01',
                progress: 65,
                logs: []
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Site Supervisor Dashboard
          </h1>
          <p className="text-gray-600">Manage assigned projects and track construction progress</p>
        </div>

        {/* Project Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <RiBuildingLine className="text-blue-600" />
            Assigned Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
                    project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RiMapPinLine className="text-blue-500" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <RiCalendarLine className="text-blue-500" />
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.estimated_end_date).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Current Step:</strong> {project.currentStep}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Details */}
        {selectedProject && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-1 p-4">
                {[
                  { id: 'overview', label: 'Overview', icon: RiEyeLine },
                  { id: 'progress', label: 'Progress Logs', icon: RiProgress1Line },
                  { id: 'timeline', label: 'Timeline', icon: RiTimeLine },
                  { id: 'invoices', label: 'Invoices', icon: RiFileTextLine }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="text-lg" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'overview' && <ProjectOverview project={selectedProject} />}
              {activeTab === 'progress' && <ProgressLogs project={selectedProject} />}
              {activeTab === 'timeline' && <ProjectTimeline project={selectedProject} />}
              {activeTab === 'invoices' && <ProjectInvoices project={selectedProject} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Overview Component
function ProjectOverview({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{project.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Description:</span>
              <span className="font-medium">{project.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Start date:</span>
              <span className="font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated end date:</span>
              <span className="font-medium">{new Date(project.estimated_end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supervisor:</span>
              <span className="font-medium">
                {typeof project.supervisor === 'string'
                  ? project.supervisor
                  : `${project.supervisor.first_name} ${project.supervisor.last_name}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Boq file:</span>
              <span className="font-medium">
                {project.boq_file ? (
                  <a
                    href={`http://localhost:8000${project.boq_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Download
                  </a>
                ) : (
                  'No file'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Is completed:</span>
              <span className="font-medium">{project.is_completed ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Overall Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{project.currentStep}</div>
              <div className="text-sm text-gray-600">Current Phase</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Description</h3>
        <p className="text-gray-600 leading-relaxed">{project.description}</p>
      </div>
    </div>
  );
}

// Progress Logs Component
function ProgressLogs({ project }: { project: Project }) {
  const [selectedStep, setSelectedStep] = useState<ProjectStep | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800">Progress Logs</h3>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
        >
          <RiUploadLine className="text-lg" />
          Add Progress Log
        </button>
      </div>

      {/* Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.steps.map((step) => (
          <div
            key={step.id}
            onClick={() => setSelectedStep(step)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedStep?.id === step.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{step.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                step.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                step.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {step.status}
              </span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{step.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${step.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {step.logs.length} logs submitted
            </div>
          </div>
        ))}
      </div>

      {/* Selected Step Logs */}
      {selectedStep && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">{selectedStep.name} - Progress Logs</h4>
          <div className="space-y-4">
            {selectedStep.logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800">{log.title}</h5>
                  <span className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{log.description}</p>
                {log.media.length > 0 && (
                  <div className="flex gap-2">
                    {log.media.map((media) => (
                      <div key={media.id} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {media.type === 'image' && <RiCameraLine className="text-2xl text-gray-400" />}
                        {media.type === 'video' && <RiVideoLine className="text-2xl text-gray-400" />}
                        {media.type === 'pdf' && <RiFileTextLine className="text-2xl text-gray-400" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add Progress Log</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Step</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {project.steps.map((step) => (
                    <option key={step.id} value={step.id}>{step.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter log title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the progress made..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag and drop files here or click to browse</p>
                  <input type="file" multiple className="hidden" />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Project Timeline Component
function ProjectTimeline({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800">Project Timeline</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-8">
          {project.steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start">
              {/* Timeline Dot */}
              <div className={`absolute left-4 w-4 h-4 rounded-full border-4 ${
                step.status === 'COMPLETED' ? 'bg-green-500 border-green-500' :
                step.status === 'IN_PROGRESS' ? 'bg-blue-500 border-blue-500' :
                'bg-gray-300 border-gray-300'
              }`}></div>
              
              {/* Content */}
              <div className="ml-12 bg-white border border-gray-200 rounded-xl p-6 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">{step.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    step.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    step.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {step.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {step.startDate && (
                    <div className="flex items-center gap-2">
                      <RiCalendarLine />
                      Start: {new Date(step.startDate).toLocaleDateString()}
                    </div>
                  )}
                  {step.endDate && (
                    <div className="flex items-center gap-2">
                      <RiCalendarLine />
                      End: {new Date(step.endDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <RiProgress1Line />
                    {step.progress}% Complete
                  </div>
                </div>
                
                {step.logs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-2">Recent Logs ({step.logs.length})</h5>
                    <div className="space-y-2">
                      {step.logs.slice(0, 3).map((log) => (
                        <div key={log.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {log.title} - {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Project Invoices Component
function ProjectInvoices({ project }: { project: Project }) {
  const [invoices, setInvoices] = useState([
    {
      id: '1',
      phase: 'Foundation',
      amount: 25000,
      status: 'DRAFT',
      submittedDate: '2024-01-15',
      verified: false,
      bills: ['foundation_materials.pdf', 'labor_costs.pdf']
    },
    {
      id: '2',
      phase: 'Framing',
      amount: 35000,
      status: 'PENDING_VERIFICATION',
      submittedDate: '2024-01-20',
      verified: false,
      bills: ['framing_materials.pdf', 'contractor_bill.pdf']
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800">Project Invoices</h3>
        <button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg">
          <RiFileTextLine className="text-lg" />
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{invoice.phase}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                invoice.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                invoice.status === 'PENDING_VERIFICATION' ? 'bg-blue-100 text-blue-700' :
                invoice.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span>{new Date(invoice.submittedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bills:</span>
                <span>{invoice.bills.length} files</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h5 className="font-medium text-gray-800">Attached Bills:</h5>
              {invoice.bills.map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{bill}</span>
                  <button className="text-blue-600 hover:text-blue-700">
                    <RiDownloadLine className="text-lg" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <RiEyeLine />
                View Invoice
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <RiCheckLine />
                Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
