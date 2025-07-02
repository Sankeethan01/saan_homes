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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-800">Progress Logs</h3>
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
                <p className="text-sm">No logs available for this step.</p>
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
    </div>
  );
} 