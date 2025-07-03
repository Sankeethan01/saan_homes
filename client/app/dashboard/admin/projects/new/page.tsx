'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiUser, FiCheckCircle, FiAlertCircle, FiDollarSign, FiList, FiArrowRight, FiArrowLeft, FiUpload, FiCalendar, FiFileText, FiImage } from 'react-icons/fi';

interface Supervisor {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface MaterialDetail {
  quantity?: number;
  unit?: string;
  rate?: number;
}

interface BoqPreviewData {
  total_budget: number;
  material_count: number;
  columns_found: Record<string, string>;
  sheet_name?: string;
  phases?: Array<{
    name: string;
    budget: number;
    percentage: number;
    material_count: number;
  }>;
  sample_materials: Array<{
    name: string;
    details: MaterialDetail;
  }>;
}

const STEPS = [
  { id: 1, title: 'Project Basics', icon: FiFileText, description: 'Essential project information' },
  { id: 2, title: 'Timeline & Team', icon: FiCalendar, description: 'Dates and supervisor assignment' },
  { id: 3, title: 'Location & Client', icon: FiMapPin, description: 'Project location and client details' },
  { id: 4, title: 'Files & Media', icon: FiUpload, description: 'BOQ, images, and 3D models' },
  { id: 5, title: 'Review & Create', icon: FiCheckCircle, description: 'Final review and submission' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clear);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'RESIDENTIAL',
    priority: 'MEDIUM',
    start_date: '',
    estimated_end_date: '',
    location: '',
    address: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    supervisor: '',
  });
  
  const [boqFile, setBoqFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [model3dFile, setModel3dFile] = useState<File | null>(null);
  const [projectImages, setProjectImages] = useState<File[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // BOQ Preview states
  const [boqPreviewLoading, setBoqPreviewLoading] = useState(false);
  const [boqPreviewError, setBoqPreviewError] = useState<string | null>(null);
  const [boqPreviewData, setBoqPreviewData] = useState<BoqPreviewData | null>(null);

  // Fetch supervisors on component mount
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/?role=SUPERVISOR`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch supervisors');
        
        const data = await response.json();
        setSupervisors(data);
      } catch (err) {
        console.error('Error fetching supervisors:', err);
        setError('Failed to load supervisors. Please try again.');
      }
    };

    fetchSupervisors();
  }, [token]);

  // Step validation functions
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.project_type);
      case 2:
        return !!(formData.start_date && formData.estimated_end_date);
      case 3:
        return true; // Optional fields
      case 4:
        return !!boqFile;
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  const canProceedToStep = (step: number): boolean => {
    if (step <= currentStep) return true;
    
    // Check if all previous steps are valid
    for (let i = 1; i < step; i++) {
      if (!validateStep(i)) return false;
    }
    return true;
  };



  const goToStep = (step: number) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const requiredFields = [
        { key: 'name', label: 'Project Name' },
        { key: 'start_date', label: 'Start Date' },
        { key: 'estimated_end_date', label: 'Estimated End Date' },
      ];
      
      for (const field of requiredFields) {
        if (!formData[field.key as keyof typeof formData]) {
          throw new Error(`${field.label} is required`);
        }
      }
      
      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.estimated_end_date);
      
      if (endDate < startDate) {
        throw new Error('Estimated End Date cannot be earlier than Start Date');
      }
      
      // Validate BOQ file
      if (!boqFile) {
        throw new Error('BOQ file is required');
      }
      
      const fileExt = boqFile.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'xlsx' && fileExt !== 'xls') {
        throw new Error('Only Excel files (.xlsx, .xls) are supported for BOQ');
      }

      // Create FormData instance for file upload
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          // Rename supervisor field to supervisor_id for the API
          if (key === 'supervisor') {
            formDataToSend.append('supervisor_id', value);
          } else {
            formDataToSend.append(key, value);
          }
        }
      });
      
      // Add files
      if (boqFile) {
        formDataToSend.append('boq_file', boqFile);
      }
      
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }
      
      if (model3dFile) {
        formDataToSend.append('model_3d', model3dFile);
      }
      
      // Handle multiple project images
      if (projectImages.length > 0) {
        const imagesList = [];
        for (let i = 0; i < projectImages.length; i++) {
          const file = projectImages[i];
          const fileName = `project_image_${i}_${Date.now()}.${file.name.split('.').pop()}`;
          formDataToSend.append(`project_image_${i}`, file);
          imagesList.push(fileName);
        }
        formDataToSend.append('images', JSON.stringify(imagesList));
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || 'Failed to create project');
      }

      // Redirect to projects list on success
      router.push('/dashboard/admin/projects');
      router.refresh();
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setProjectImages(filesArray);
    }
  };

  const handleBoqFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBoqFile(file);
    
    if (!file) {
      setBoqPreviewData(null);
      return;
    }
    
    // Only process Excel files
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      setBoqPreviewError('Only Excel files (.xlsx, .xls) are supported for BOQ.');
      return;
    }
    
    // Preview the BOQ file
    setBoqPreviewLoading(true);
    setBoqPreviewError(null);
    
    try {
      // Check if token is available
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const formData = new FormData();
      formData.append('boq_file', file);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/preview-boq/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle authentication error
          clearToken();
          router.replace('/dashboard/login');
          throw new Error('Authentication expired. Please log in again.');
        }
        
        // Try to get error message from response
        let errorMessage = 'Failed to preview BOQ file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `Failed to preview BOQ file: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setBoqPreviewData(data);
    } catch (err) {
      console.error('Error previewing BOQ:', err);
      setBoqPreviewError(err instanceof Error ? err.message : 'Failed to preview BOQ file');
      setBoqPreviewData(null);
    } finally {
      setBoqPreviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-[#1b4965] bg-clip-text text-transparent mb-2">
            Create New Project
          </h1>
          <p className="text-gray-600 text-lg">Let's bring your construction project to life</p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20"
        >
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              const canAccess = canProceedToStep(step.id);
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <motion.button
                    onClick={() => canAccess && goToStep(step.id)}
                    disabled={!canAccess}
                    className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                      canAccess ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'
                    }`}
                    whileHover={canAccess ? { scale: 1.05 } : {}}
                    whileTap={canAccess ? { scale: 0.95 } : {}}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-[#1b4965] text-white shadow-lg' 
                        : isCompleted 
                          ? 'bg-green-500 text-white shadow-md' 
                          : canAccess
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <FiCheckCircle className="w-6 h-6" />
                      ) : (
                        <IconComponent className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`font-medium text-sm ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-20">
                        {step.description}
                      </p>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    )}
                  </motion.button>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                      completedSteps.includes(step.id) ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center"
            >
              <FiAlertCircle className="text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20"
        >
          {currentStep === 1 && <ProjectBasicsStep formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <TimelineTeamStep formData={formData} setFormData={setFormData} supervisors={supervisors} />}
          {currentStep === 3 && <LocationClientStep formData={formData} setFormData={setFormData} />}
          {currentStep === 4 && (
            <FilesMediaStep 
              boqFile={boqFile}
              setBoqFile={setBoqFile}
              thumbnailFile={thumbnailFile}
              setThumbnailFile={setThumbnailFile}
              model3dFile={model3dFile}
              setModel3dFile={setModel3dFile}
              projectImages={projectImages}
              setProjectImages={setProjectImages}
              boqPreviewLoading={boqPreviewLoading}
              boqPreviewError={boqPreviewError}
              boqPreviewData={boqPreviewData}
              handleBoqFileChange={handleBoqFileChange}
              handleImageChange={handleImageChange}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep 
              formData={formData}
              boqFile={boqFile}
              thumbnailFile={thumbnailFile}
              model3dFile={model3dFile}
              projectImages={projectImages}
              boqPreviewData={boqPreviewData}
              supervisors={supervisors}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <motion.button
              type="button"
              onClick={() => currentStep === 1 ? router.back() : setCurrentStep(currentStep - 1)}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiArrowLeft className="mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </motion.button>

            <div className="flex items-center space-x-3">
              {currentStep < STEPS.length ? (
                <motion.button
                  type="button"
                  onClick={() => {
                    if (validateStep(currentStep)) {
                      if (!completedSteps.includes(currentStep)) {
                        setCompletedSteps([...completedSteps, currentStep]);
                      }
                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  disabled={!validateStep(currentStep)}
                  className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
                    validateStep(currentStep)
                      ? 'bg-[#1b4965] text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={validateStep(currentStep) ? { scale: 1.05 } : {}}
                  whileTap={validateStep(currentStep) ? { scale: 0.95 } : {}}
                >
                  Continue
                  <FiArrowRight className="ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
                    loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                  whileHover={!loading ? { scale: 1.05 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Create Project
                    </>
                  )}
                </motion.button>
              )}
                         </div>
           </div>
         </motion.div>
       </div>
     </div>
   );
 }

 // Step Components
 interface StepProps {
   formData: typeof formData;
   setFormData: (data: typeof formData) => void;
 }

 const ProjectBasicsStep = ({ formData, setFormData }: StepProps) => (
   <div className="space-y-6">
     <div className="text-center mb-8">
       <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Basics</h2>
       <p className="text-gray-600">Let&apos;s start with the essential information about your project</p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="md:col-span-2"
       >
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Project Name *
         </label>
         <input
           type="text"
           placeholder="Enter your project name..."
           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
           value={formData.name}
           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
         />
       </motion.div>

       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
       >
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Project Type *
         </label>
         <div className="grid grid-cols-2 gap-2">
           {[
             { value: 'RESIDENTIAL', label: 'Residential', icon: '🏠' },
             { value: 'COMMERCIAL', label: 'Commercial', icon: '🏢' },
             { value: 'INDUSTRIAL', label: 'Industrial', icon: '🏭' },
             { value: 'RENOVATION', label: 'Renovation', icon: '🔨' },
           ].map((type) => (
             <button
               key={type.value}
               type="button"
               onClick={() => setFormData({ ...formData, project_type: type.value })}
               className={`p-3 rounded-xl border-2 transition-all text-center ${
                 formData.project_type === type.value
                   ? 'border-blue-500 bg-blue-50 text-blue-700'
                   : 'border-gray-200 hover:border-gray-300'
               }`}
             >
               <div className="text-2xl mb-1">{type.icon}</div>
               <div className="text-sm font-medium">{type.label}</div>
             </button>
           ))}
         </div>
       </motion.div>

       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
       >
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Priority Level
         </label>
         <div className="space-y-2">
           {[
             { value: 'HIGH', label: 'High Priority', color: 'red' },
             { value: 'MEDIUM', label: 'Medium Priority', color: 'yellow' },
             { value: 'LOW', label: 'Low Priority', color: 'green' },
           ].map((priority) => (
             <button
               key={priority.value}
               type="button"
               onClick={() => setFormData({ ...formData, priority: priority.value })}
               className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center ${
                 formData.priority === priority.value
                   ? `border-${priority.color}-500 bg-${priority.color}-50`
                   : 'border-gray-200 hover:border-gray-300'
               }`}
             >
               <div className={`w-3 h-3 rounded-full bg-${priority.color}-500 mr-3`}></div>
               {priority.label}
             </button>
           ))}
         </div>
       </motion.div>

       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="md:col-span-2"
       >
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Project Description
         </label>
         <textarea
           rows={4}
           placeholder="Describe your project goals, scope, and any special requirements..."
           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
           value={formData.description}
           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
         />
       </motion.div>
     </div>
   </div>
  );

 const TimelineTeamStep = ({ formData, setFormData, supervisors }: StepProps & { supervisors: Supervisor[] }) => (
   <div className="space-y-6">
     <div className="text-center mb-8">
       <h2 className="text-2xl font-bold text-gray-800 mb-2">Timeline & Team</h2>
       <p className="text-gray-600">Set your project timeline and assign a supervisor</p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-blue-50 p-6 rounded-xl"
       >
         <div className="flex items-center mb-4">
           <FiCalendar className="text-blue-600 mr-2" />
           <h3 className="font-semibold text-gray-800">Project Timeline</h3>
         </div>
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Start Date *
             </label>
             <input
               type="date"
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
               value={formData.start_date}
               onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Estimated End Date *
             </label>
             <input
               type="date"
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
               value={formData.estimated_end_date}
               onChange={(e) => setFormData({ ...formData, estimated_end_date: e.target.value })}
             />
           </div>
         </div>
       </motion.div>

       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="bg-purple-50 p-6 rounded-xl"
       >
         <div className="flex items-center mb-4">
           <FiUser className="text-purple-600 mr-2" />
           <h3 className="font-semibold text-gray-800">Team Assignment</h3>
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Project Supervisor
           </label>
           <select
             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
             value={formData.supervisor}
             onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
           >
             <option value="">Choose a supervisor...</option>
             {supervisors.map((supervisor) => (
               <option key={supervisor.id} value={supervisor.id}>
                 {supervisor.first_name && supervisor.last_name 
                   ? `${supervisor.first_name} ${supervisor.last_name}`
                   : supervisor.username} ({supervisor.email})
               </option>
             ))}
           </select>
         </div>
       </motion.div>
     </div>
   </div>
 );

 const LocationClientStep = ({ formData, setFormData }: StepProps) => (
   <div className="space-y-6">
     <div className="text-center mb-8">
       <h2 className="text-2xl font-bold text-gray-800 mb-2">Location & Client</h2>
       <p className="text-gray-600">Where will the project take place and who is the client?</p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-green-50 p-6 rounded-xl"
       >
         <div className="flex items-center mb-4">
           <FiMapPin className="text-green-600 mr-2" />
           <h3 className="font-semibold text-gray-800">Project Location</h3>
         </div>
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Location Name
             </label>
             <input
               type="text"
               placeholder="e.g., Downtown, North Side"
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
               value={formData.location}
               onChange={(e) => setFormData({ ...formData, location: e.target.value })}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Full Address
             </label>
             <textarea
               rows={3}
               placeholder="Enter complete project address..."
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none"
               value={formData.address}
               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
             />
           </div>
         </div>
       </motion.div>

       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="bg-orange-50 p-6 rounded-xl"
       >
         <div className="flex items-center mb-4">
           <FiUser className="text-orange-600 mr-2" />
           <h3 className="font-semibold text-gray-800">Client Information</h3>
         </div>
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Client Name
             </label>
             <input
               type="text"
               placeholder="Client full name"
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
               value={formData.client_name}
               onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Email Address
             </label>
             <input
               type="email"
               placeholder="client@example.com"
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
               value={formData.client_email}
               onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Phone Number
             </label>
             <input
               type="tel"
               placeholder="+1 (555) 123-4567"
               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
               value={formData.client_phone}
               onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
             />
           </div>
         </div>
       </motion.div>
     </div>
      </div>
 );

 interface FilesMediaStepProps {
   boqFile: File | null;
   setBoqFile: (file: File | null) => void;
   thumbnailFile: File | null;
   setThumbnailFile: (file: File | null) => void;
   model3dFile: File | null;
   setModel3dFile: (file: File | null) => void;
   projectImages: File[];
   setProjectImages: (files: File[]) => void;
   boqPreviewLoading: boolean;
   boqPreviewError: string | null;
   boqPreviewData: BoqPreviewData | null;
   handleBoqFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 }

 const FilesMediaStep = ({
   boqFile,
   thumbnailFile,
   setThumbnailFile,
   model3dFile,
   setModel3dFile,
   projectImages,
   boqPreviewLoading,
   boqPreviewError,
   boqPreviewData,
   handleBoqFileChange,
   handleImageChange
 }: FilesMediaStepProps) => (
   <div className="space-y-6">
     <div className="text-center mb-8">
       <h2 className="text-2xl font-bold text-gray-800 mb-2">Files & Media</h2>
       <p className="text-gray-600">Upload your BOQ file and project media</p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* BOQ File Upload */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="md:col-span-2 bg-red-50 p-6 rounded-xl"
       >
         <div className="flex items-center mb-4">
           <FiFileText className="text-red-600 mr-2" />
           <h3 className="font-semibold text-gray-800">BOQ File (Required)</h3>
         </div>
         
         <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center">
           <input
             type="file"
             accept=".xls,.xlsx"
             onChange={handleBoqFileChange}
             className="hidden"
             id="boq-upload"
           />
           <label
             htmlFor="boq-upload"
             className="cursor-pointer flex flex-col items-center"
           >
             <FiUpload className="w-12 h-12 text-red-400 mb-4" />
             <p className="text-lg font-medium text-gray-700 mb-2">
               {boqFile ? boqFile.name : 'Upload BOQ File'}
             </p>
             <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
           </label>
         </div>

         {/* BOQ Preview */}
         {boqPreviewLoading && (
           <div className="mt-4 p-4 bg-blue-50 rounded-xl">
             <div className="flex items-center">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
               <p className="text-sm text-blue-600">Analyzing BOQ file...</p>
             </div>
           </div>
         )}
         
         {boqPreviewError && (
           <div className="mt-4 p-4 bg-red-100 rounded-xl">
             <div className="flex items-center">
               <FiAlertCircle className="text-red-500 mr-2" />
               <p className="text-sm text-red-600">{boqPreviewError}</p>
             </div>
           </div>
         )}
         
         {boqPreviewData && !boqPreviewLoading && (
           <div className="mt-4 p-4 bg-green-100 rounded-xl">
             <div className="flex items-center mb-3">
               <FiCheckCircle className="text-green-500 mr-2" />
               <p className="text-sm font-medium text-green-700">BOQ file analyzed successfully</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-3 rounded-lg">
                 <div className="flex items-center">
                   <FiDollarSign className="text-green-600 mr-2" />
                   <span className="text-sm text-gray-600">Total Budget</span>
                 </div>
                 <p className="text-lg font-bold">LKR {boqPreviewData.total_budget.toLocaleString()}</p>
               </div>
               
               <div className="bg-white p-3 rounded-lg">
                 <div className="flex items-center">
                   <FiList className="text-green-600 mr-2" />
                   <span className="text-sm text-gray-600">Materials</span>
                 </div>
                 <p className="text-lg font-bold">{boqPreviewData.material_count} items</p>
               </div>
             </div>
           </div>
         )}
       </motion.div>

       {/* Other File Uploads */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="space-y-4"
       >
         <div className="bg-blue-50 p-4 rounded-xl">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Project Thumbnail
           </label>
           <input
             type="file"
             accept="image/*"
             onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
             className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
           />
           {thumbnailFile && (
             <p className="text-xs text-green-600 mt-1">✓ {thumbnailFile.name}</p>
           )}
         </div>

         <div className="bg-purple-50 p-4 rounded-xl">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Project Images
           </label>
           <input
             type="file"
             accept="image/*"
             multiple
             onChange={handleImageChange}
             className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
           />
           {projectImages.length > 0 && (
             <p className="text-xs text-green-600 mt-1">✓ {projectImages.length} images selected</p>
           )}
         </div>

         <div className="bg-orange-50 p-4 rounded-xl">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             3D Model
           </label>
           <input
             type="file"
             accept=".glb,.gltf,.obj,.fbx"
             onChange={(e) => setModel3dFile(e.target.files?.[0] || null)}
             className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
           />
           {model3dFile && (
             <p className="text-xs text-green-600 mt-1">✓ {model3dFile.name}</p>
           )}
         </div>
       </motion.div>
     </div>
   </div>
 );

 interface ReviewStepProps {
   formData: any;
   boqFile: File | null;
   thumbnailFile: File | null;
   model3dFile: File | null;
   projectImages: File[];
   boqPreviewData: BoqPreviewData | null;
   supervisors: Supervisor[];
 }

 const ReviewStep = ({
   formData,
   boqFile,
   thumbnailFile,
   model3dFile,
   projectImages,
   boqPreviewData,
   supervisors
 }: ReviewStepProps) => {
   const selectedSupervisor = supervisors.find(s => s.id === formData.supervisor);
   
   return (
     <div className="space-y-6">
       <div className="text-center mb-8">
         <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Create</h2>
         <p className="text-gray-600">Review all details before creating your project</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl"
         >
           <h3 className="font-bold text-gray-800 mb-4">Project Overview</h3>
           <div className="space-y-3">
             <div>
               <span className="text-sm text-gray-600">Name:</span>
               <p className="font-medium">{formData.name || 'Not specified'}</p>
             </div>
             <div>
               <span className="text-sm text-gray-600">Type:</span>
               <p className="font-medium">{formData.project_type}</p>
             </div>
             <div>
               <span className="text-sm text-gray-600">Priority:</span>
               <p className="font-medium">{formData.priority}</p>
             </div>
             <div>
               <span className="text-sm text-gray-600">Timeline:</span>
               <p className="font-medium">
                 {formData.start_date} to {formData.estimated_end_date}
               </p>
             </div>
           </div>
         </motion.div>

         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl"
         >
           <h3 className="font-bold text-gray-800 mb-4">Location & Client</h3>
           <div className="space-y-3">
             <div>
               <span className="text-sm text-gray-600">Location:</span>
               <p className="font-medium">{formData.location || 'Not specified'}</p>
             </div>
             <div>
               <span className="text-sm text-gray-600">Client:</span>
               <p className="font-medium">{formData.client_name || 'Not specified'}</p>
             </div>
             <div>
               <span className="text-sm text-gray-600">Supervisor:</span>
               <p className="font-medium">
                 {selectedSupervisor 
                   ? `${selectedSupervisor.first_name} ${selectedSupervisor.last_name}` 
                   : 'Not assigned'}
               </p>
             </div>
           </div>
         </motion.div>

         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="md:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl"
         >
           <h3 className="font-bold text-gray-800 mb-4">Files & Budget</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-4 rounded-lg">
               <div className="flex items-center mb-2">
                 <FiFileText className="text-red-500 mr-2" />
                 <span className="text-sm font-medium">BOQ File</span>
               </div>
               <p className="text-xs text-gray-600">
                 {boqFile ? `✓ ${boqFile.name}` : '❌ Required'}
               </p>
               {boqPreviewData && (
                 <p className="text-sm font-bold text-green-600 mt-1">
                   Budget: LKR {boqPreviewData.total_budget.toLocaleString()}
                 </p>
               )}
             </div>

             <div className="bg-white p-4 rounded-lg">
               <div className="flex items-center mb-2">
                 <FiImage className="text-blue-500 mr-2" />
                 <span className="text-sm font-medium">Media Files</span>
               </div>
               <p className="text-xs text-gray-600">
                 {thumbnailFile ? `✓ Thumbnail` : '○ No thumbnail'}
               </p>
               <p className="text-xs text-gray-600">
                 {projectImages.length > 0 ? `✓ ${projectImages.length} images` : '○ No images'}
               </p>
               <p className="text-xs text-gray-600">
                 {model3dFile ? `✓ 3D Model` : '○ No 3D model'}
               </p>
             </div>

             <div className="bg-white p-4 rounded-lg">
               <div className="flex items-center mb-2">
                 <FiCheckCircle className="text-green-500 mr-2" />
                 <span className="text-sm font-medium">Ready to Create</span>
               </div>
               <p className="text-xs text-gray-600">
                 All required fields completed
               </p>
             </div>
           </div>
         </motion.div>
       </div>
     </div>
   );
    }; 