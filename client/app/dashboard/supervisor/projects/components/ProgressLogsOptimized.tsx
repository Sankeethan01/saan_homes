"use client";

import type React from "react";
import { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import {
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiDownloadLine,
  RiCheckLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiSendPlaneLine,
} from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import SupervisorInvoiceModal from "./SupervisorInvoiceModal";
import InvoiceGenerationModal from "./InvoiceGenerationModal";
import { useOptimizedAPI, useCacheInvalidation } from "@/app/hooks/useOptimizedAPI";

// Memoized Step Card Component
const StepCard = memo(({ 
  step, 
  isCurrent, 
  isCompleted, 
  stepMedia, 
  latestBill, 
  onMediaEdit, 
  onInvoiceGenerate 
}: {
  step: any;
  isCurrent: boolean;
  isCompleted: boolean;
  stepMedia: any[];
  latestBill: any;
  onMediaEdit: () => void;
  onInvoiceGenerate: () => void;
}) => {
  const statusColor = useMemo(() => {
    if (isCompleted) return "bg-green-100 text-green-800 border-green-200";
    if (isCurrent) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  }, [isCompleted, isCurrent]);

  const statusIcon = useMemo(() => {
    if (isCompleted) return <RiCheckLine className="w-4 h-4" />;
    if (isCurrent) return <RiTimeLine className="w-4 h-4" />;
    return <RiCalendarLine className="w-4 h-4" />;
  }, [isCompleted, isCurrent]);

  return (
    <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${statusColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-sm opacity-75">{step.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">Progress: {step.progress}%</div>
          <div className="w-24 h-2 bg-white/50 rounded-full mt-1">
            <div 
              className="h-full bg-current rounded-full transition-all duration-500"
              style={{ width: `${step.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Media Preview */}
      {stepMedia.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stepMedia.slice(0, 3).map((media: any) => (
              <div key={media.id} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                {media.media_type === 'IMAGE' ? (
                  <img 
                    src={media.url} 
                    alt={media.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <RiVideoLine className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            {stepMedia.length > 3 && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center">
                <span className="text-xs font-medium">+{stepMedia.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bill Information */}
      {latestBill && (
        <div className="mb-4 p-3 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <RiMoneyDollarCircleLine className="w-4 h-4" />
            <span className="text-sm font-medium">Latest Bill</span>
          </div>
          <div className="text-sm">
            <div>Amount: ₹{latestBill.amount || 0}</div>
            <div>Date: {new Date(latestBill.uploaded_at).toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onMediaEdit}
          className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg text-sm font-medium hover:bg-white/70 transition-colors"
        >
          <RiCameraLine className="w-4 h-4" />
          Media
        </button>
        <button
          onClick={onInvoiceGenerate}
          className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg text-sm font-medium hover:bg-white/70 transition-colors"
        >
          <RiFileTextLine className="w-4 h-4" />
          Invoice
        </button>
      </div>
    </div>
  );
});

StepCard.displayName = 'StepCard';

// Memoized Media Upload Component
const MediaUpload = memo(({ 
  stepId, 
  onUploadComplete 
}: { 
  stepId: string; 
  onUploadComplete: () => void; 
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('media_files', file);
      });
      formData.append('step', stepId);

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/progress-logs/`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [stepId, onUploadComplete]);

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-800 transition-colors"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <RiCameraLine className="w-5 h-5" />
            Upload Media Files
          </>
        )}
      </button>
    </div>
  );
});

MediaUpload.displayName = 'MediaUpload';

// Main ProgressLogs Component
interface ProgressLogsProps {
  project: any;
  onMediaEdited?: () => void;
}

const ProgressLogsOptimized = memo(function ProgressLogsOptimized({
  project,
  onMediaEdited,
}: ProgressLogsProps) {
  const [localProject, setLocalProject] = useState(project);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInvoiceGeneration, setShowInvoiceGeneration] = useState(false);
  const { invalidateProject } = useCacheInvalidation();

  // Memoized sorted steps
  const sortedSteps = useMemo(() => {
    if (!localProject?.steps) return [];
    return [...localProject.steps].sort((a, b) => {
      const statusOrder = { 'COMPLETED': 0, 'IN_PROGRESS': 1, 'PLANNING': 2 };
      return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
             (statusOrder[b.status as keyof typeof statusOrder] || 3);
    });
  }, [localProject?.steps]);

  // Update local project when prop changes
  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const handleMediaEdit = useCallback((step: any) => {
    setSelectedStep(step);
  }, []);

  const handleInvoiceGenerate = useCallback((step: any) => {
    setSelectedStep(step);
    setShowInvoiceGeneration(true);
  }, []);

  const handleMediaUploadComplete = useCallback(() => {
    invalidateProject(project.id);
    onMediaEdited?.();
  }, [project.id, invalidateProject, onMediaEdited]);

  if (!localProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{localProject.name}</h2>
        <p className="text-gray-600 mb-4">{localProject.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Start: {new Date(localProject.start_date).toLocaleDateString()}</span>
          <span>End: {new Date(localProject.estimated_end_date).toLocaleDateString()}</span>
          <span>Location: {localProject.location}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-green-200 shadow-lg" />
        
        <div className="space-y-6">
          {sortedSteps.map((step, index) => {
            const isCurrent = step.status === "IN_PROGRESS";
            const isCompleted = step.status === "COMPLETED";
            const stepMedia = (localProject.media_files || []).filter(
              (m: any) => (m.step && String(m.step) === String(step.id)) ||
                         (m.step_id && String(m.step_id) === String(step.id))
            );

            // Find the latest bill for this step
            const latestBill = step.bills && step.bills.length > 0
              ? [...step.bills].sort((a, b) => {
                  const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
                  const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
                  return dateB - dateA;
                })[0]
              : null;

            return (
              <div key={step.id} className="relative pl-16">
                <div className="absolute left-0 top-6 w-12 h-12 bg-white rounded-full border-4 border-current flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
                
                <StepCard
                  step={step}
                  isCurrent={isCurrent}
                  isCompleted={isCompleted}
                  stepMedia={stepMedia}
                  latestBill={latestBill}
                  onMediaEdit={() => handleMediaEdit(step)}
                  onInvoiceGenerate={() => handleInvoiceGenerate(step)}
                />

                {/* Media Upload for current step */}
                {isCurrent && (
                  <div className="mt-4">
                    <MediaUpload
                      stepId={step.id}
                      onUploadComplete={handleMediaUploadComplete}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showInvoiceGeneration && selectedStep && (
        <InvoiceGenerationModal
          open={showInvoiceGeneration}
          step={selectedStep}
          project={localProject}
          onClose={() => {
            setShowInvoiceGeneration(false);
            setSelectedStep(null);
          }}
          onInvoiceGenerated={() => {
            setShowInvoiceGeneration(false);
            setSelectedStep(null);
            invalidateProject(project.id);
          }}
        />
      )}

      {showInvoiceModal && selectedStep && (
        <SupervisorInvoiceModal
          open={showInvoiceModal}
          step={selectedStep}
          invoice={selectedStep.invoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedStep(null);
          }}
          onSaved={() => {
            setShowInvoiceModal(false);
            setSelectedStep(null);
            invalidateProject(project.id);
          }}
        />
      )}
    </div>
  );
});

export default ProgressLogsOptimized;
