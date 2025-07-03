'use client';

import { useState } from 'react';
import {
  RiUploadLine,
  RiCameraLine,
  RiVideoLine,
  RiFileTextLine,
  RiCloseLine,
} from 'react-icons/ri';

interface Project {
  id: string;
  title: string;
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

export default function ProgressLogs({ project }: { project: Project }) {
  const [selectedStep, setSelectedStep] = useState<ProjectStep | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    stepId: '',
    title: '',
    description: '',
    media: [] as File[]
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to submit progress log
    console.log('Submitting progress log:', formData);
    setShowUploadForm(false);
    setFormData({ stepId: '', title: '', description: '', media: [] });
  };

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
            {selectedStep.logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <RiFileTextLine className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No progress logs submitted yet</p>
                <p className="text-sm">Click "Add Progress Log" to start tracking progress</p>
              </div>
            ) : (
              selectedStep.logs.map((log) => (
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
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Add Progress Log</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="text-2xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Step</label>
                <select 
                  value={formData.stepId}
                  onChange={(e) => setFormData(prev => ({ ...prev, stepId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a step</option>
                  {project.steps.map((step) => (
                    <option key={step.id} value={step.id}>{step.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter log title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the progress made..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">Supports: Images, Videos, PDFs</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden" 
                    id="media-upload"
                  />
                  <label 
                    htmlFor="media-upload"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Choose Files
                  </label>
                </div>
                
                {/* Selected Files */}
                {formData.media.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-700">Selected Files:</h4>
                    {formData.media.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <RiCloseLine />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
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