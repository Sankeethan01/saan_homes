"use client";

import { useState } from "react";
import {
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiUploadLine,
  RiCloseLine,
  RiAddLine,
  RiPlayLine,
  RiDownloadLine,
} from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  order: number;
  is_approved: boolean;
  actual_completed: string | null;
  expected_budget: number;
  progress: number;
  status: string;
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

interface Project {
  id: string;
  name: string;
  steps: ProjectStep[];
}

interface MediaUploadData {
  stepId: string;
  title: string;
  description: string;
  files: File[];
}

export default function ProgressLogs({ project }: { project: Project }) {
  const [selectedStep, setSelectedStep] = useState<ProjectStep | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<MediaUploadData>({
    stepId: '',
    title: '',
    description: '',
    files: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stepId || !formData.title || formData.files.length === 0) {
      alert('Please fill in all required fields and select at least one file');
      return;
    }

    setUploading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      // Create FormData for the progress log
      const formDataToSend = new FormData();
      formDataToSend.append('step', formData.stepId);
      formDataToSend.append('message', formData.description);
      
      // Add all media files
      formData.files.forEach((file, index) => {
        formDataToSend.append('media', file);
      });

      const response = await fetchWithAuth(`${apiBaseUrl}/projects/logs/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit progress log');
      }

      // Reset form and close modal
      setFormData({ stepId: '', title: '', description: '', files: [] });
      setShowUploadForm(false);
      
      // Refresh the page or update the logs list
      window.location.reload();
      
    } catch (error) {
      console.error('Error submitting progress log:', error);
      alert('Failed to submit progress log. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Project Step</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setSelectedStep(step)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedStep?.id === step.id
                  ? 'border-[#1b4965] bg-[#1b4965]/5'
                  : 'border-gray-200 hover:border-[#1b4965]/30 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{step.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  step.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  step.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {step.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{step.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Progress: {step.progress}%</span>
                <span>Budget: ${step.expected_budget?.toLocaleString() || '0'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Logs for Selected Step */}
      {selectedStep && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Progress Logs - {selectedStep.title}
            </h3>
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, stepId: selectedStep.id }));
                setShowUploadForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
              Add Progress Log
            </button>
          </div>

          <div className="space-y-4">
            {selectedStep.logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <RiFileTextLine className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>No progress logs submitted yet</p>
                <p className="text-sm">Click "Add Progress Log" to start tracking progress</p>
              </div>
            ) : (
              selectedStep.logs.map((log) => (
                <div key={log.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-800">{log.title}</h5>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{log.description}</p>
                  
                  {log.media.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="font-semibold text-gray-700 flex items-center gap-2">
                        <RiCameraLine className="text-blue-500" />
                        Attached Media ({log.media.length})
                      </h6>
                      <div className="flex gap-3 flex-wrap">
                        {log.media.map((media) => (
                          <div key={media.id} className="group/media relative overflow-hidden w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg">
                            {media.type === 'image' && (
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                <RiCameraLine className="text-white text-xl" />
                              </div>
                            )}
                            {media.type === 'video' && (
                              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                                <RiVideoLine className="text-white text-xl" />
                              </div>
                            )}
                            {media.type === 'pdf' && (
                              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                                <RiFileTextLine className="text-white text-xl" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-all duration-300 rounded-xl"></div>
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"
                            >
                              <RiDownloadLine className="text-white text-xl" />
                            </a>
                          </div>
                        ))}
                      </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Progress Log</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                  placeholder="Enter progress log title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                  rows={4}
                  placeholder="Describe the progress made..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Media *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">Supports: Images, Videos, Documents</p>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden" 
                    id="media-upload"
                    required
                  />
                  <label 
                    htmlFor="media-upload"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Choose Files
                  </label>
                </div>
                
                {/* Selected Files */}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-700">Selected Files:</h4>
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {file.type.startsWith('image/') && <RiCameraLine className="text-blue-500" />}
                          {file.type.startsWith('video/') && <RiVideoLine className="text-red-500" />}
                          {file.type.includes('pdf') && <RiFileTextLine className="text-orange-500" />}
                          <span className="text-sm text-gray-600">{file.name}</span>
                        </div>
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
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || formData.files.length === 0}
                  className="flex-1 px-4 py-2 bg-[#1b4965] text-white rounded-lg hover:bg-[#1b4965]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Submitting...' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 