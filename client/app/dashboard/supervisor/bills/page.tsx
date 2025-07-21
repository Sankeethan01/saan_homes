"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/auth";
import {
  RiUploadLine,
  RiDeleteBin6Line,
  RiCloseLine,
} from "react-icons/ri";

interface StepBill {
  id: string;
  amount: number;
  description: string;
  stepId: string;
  projectId: string;
  invoice_file: string;
}

interface Project {
  id: string;
  name: string;
}

interface Step {
  id: string;
  title: string;
}

export default function BillsPage() {
  const [projectId, setProjectId] = useState<string>(""); // "" means all projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [stepBills, setStepBills] = useState<StepBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<{ step: string; files: File[] }>({
    step: "",
    files: [],
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [refresh, setRefresh] = useState<number>(0);

  const params = useParams();

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/supervisor_projects/`
        );
        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch bills when projectId changes
  useEffect(() => {
    const fetchBills = async () => {
      if (!projectId) {
        setStepBills([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let allBills: StepBill[] = [];

        // Fetch bills for a specific project
        const projectRes = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/`
        );
        if (projectRes.ok) {
          const projectData = await projectRes.json();
          const stepsData = projectData.steps || [];
          setSteps(stepsData);

          for (const step of stepsData) {
            const billsRes = await fetchWithAuth(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/?step=${step.id}`
            );
            if (billsRes.ok) {
              const billsData = await billsRes.json();

              allBills.push(
                ...billsData.map((b: any) => ({
                  id: b.id,
                  amount: b.ocr_data?.total || 0,
                  description: b.pdf?.split("/").pop() || "No description",
                  invoice_file: b.pdf,
                  stepId: step.id,
                  projectId: projectId,
                }))
              );
            }
          }
        }

        // Deduplicate bills to prevent React key errors
        const uniqueBills = Array.from(
          new Map(allBills.map((bill) => [bill.id, bill])).values()
        );
        setStepBills(uniqueBills);
      } catch (error) {
        console.error("Error fetching bills:", error);
        setStepBills([]);
      } finally {
        setLoading(false);
      }
    };

    if (projects.length > 0) {
      fetchBills();
    }
  }, [projectId, projects, refresh]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm((f) => ({ ...f, files: [...f.files, ...files] }));
  };

  const handleStepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, step: e.target.value }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !form.step || form.files.length === 0) {
      alert("Please select a step and upload at least one PDF.");
      return;
    }
    setSaving(true);
    try {
      for (const file of form.files) {
        const fd = new FormData();
        fd.append("step", form.step);
        fd.append("pdf", file); // Assuming the backend expects 'pdf'
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/`,
          {
            method: "POST",
            body: fd,
          }
        );
        if (!res.ok) throw new Error("Upload failed");
      }
      setShowForm(false);
      setForm({ step: "", files: [] });
      setToast("Bill uploaded successfully!");
      setRefresh((r) => r + 1);
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ step: "", files: [] });
  };


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Project Bills</h2>

      {/* Project Filter Dropdown */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Filter by Project
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="p-2 border rounded-md w-full"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional Rendering */}
      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : projectId === "" ? (
        // Show Project Grid if "All Projects" is selected
        <div>
          <h3 className="text-xl font-semibold mb-4">Select a project to view its bills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
                onClick={() => setProjectId(project.id)}
              >
                <h4 className="text-lg font-bold text-blue-800">{project.name}</h4>
                {/* You can add more project details here if needed */}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              Bills for {projects.find((p) => p.id === projectId)?.name}
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <RiUploadLine className="mr-2" />
              Add Bill
            </button>
          </div>
          {stepBills.length === 0 ? (
            <div className="text-center text-gray-600">
              No bills found for this project.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stepBills.map((bill) => {
                const project = projects.find((p) => p.id === bill.projectId);

                return (
                  <div
                    key={bill.id}
                    className="border border-gray-200 rounded-lg p-4 shadow hover:shadow-md transition"
                  >
                    <div className="text-sm text-blue-700 mb-1">
                      Project: {project?.name || "Unknown Project"}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      Rs. {bill.amount}
                    </div>
                    <p className="text-gray-700 mb-2">{bill.description}</p>
                    {bill.invoice_file && (
                      <a
                        href={bill.invoice_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                      >
                        <RiUploadLine className="mr-1" />
                        View Invoice
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Add New Bill</h2>
              <button
                onClick={handleCancel}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div>
                <label
                  htmlFor="step-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Step
                </label>
                <select
                  id="step-select"
                  value={form.step}
                  onChange={handleStepChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">-- Choose a step --</option>
                  {steps.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bill (PDF)
                </label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <RiUploadLine className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
                {form.files.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {form.files.map((f) => f.name).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
                  disabled={saving}
                >
                  <RiUploadLine className="mr-2" />
                  {saving ? "Uploading..." : "Upload Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: "#22c55e",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
