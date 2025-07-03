"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import {
  RiBuildingLine,
  RiProgress1Line,
  RiTimeLine,
  RiFileTextLine,
  RiEyeLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { FiSearch } from "react-icons/fi";

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Placeholder project data (replace with fetch logic)
  const project = {
    id: projectId,
    name: "Project Name",
    description: "Project description goes here.",
    start_date: "2025-07-03",
    estimated_end_date: "2025-08-09",
    is_completed: false,
    status: true,
    progress: 0,
    currentStep: "Planning",
    steps: [],
    thumbnail: "/assets/images/project_saan.png",
    location: "Location",
  };

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Dashboard", path: "/dashboard/supervisor" },
    { name: "Projects", path: "/dashboard/supervisor/projects" },
    { name: project.name, path: `/dashboard/supervisor/projects/${projectId}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-0 px-0">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm py-6 px-2">
          {breadcrumbs.map((item, idx) => (
            <span key={item.path} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-[#1b4965]">/</span>}
              {idx < breadcrumbs.length - 1 ? (
                <button onClick={() => router.push(item.path)} className="text-[#1b4965] hover:underline">{item.name}</button>
              ) : (
                <span className="text-[#1b4965] font-semibold">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6 mb-8 border border-white/20">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search in project..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-transparent transition-all duration-200 w-full"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-blue-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <RiBuildingLine className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-blue-600 font-medium">Total Phases</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-green-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <RiProgress1Line className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-amber-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <RiTimeLine className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-amber-600 font-medium">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-2xl p-6 shadow group border border-purple-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <RiFileTextLine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-purple-600 font-medium">Upcoming</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: "overview", label: "Project Overview", icon: RiEyeLine },
            { id: "progress", label: "Progress Logs", icon: RiProgress1Line },
            { id: "timeline", label: "Project Timeline", icon: RiTimeLine },
            { id: "invoices", label: "Invoices & Billing", icon: RiFileTextLine },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#1b4965] text-white shadow"
                  : "text-slate-600 hover:text-[#1b4965]-700 hover:bg-white/80 hover:shadow"
              }`}
            >
              <tab.icon className="text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow p-6 min-h-[300px]">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Project Overview</h2>
              {/* Project details, images, VR video placeholder */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <img src={project.thumbnail} alt={project.name} className="rounded-xl w-full h-48 object-cover mb-4" />
                  <div className="mb-2"><strong>Name:</strong> {project.name}</div>
                  <div className="mb-2"><strong>Description:</strong> {project.description}</div>
                  <div className="mb-2"><strong>Location:</strong> {project.location}</div>
                  <div className="mb-2"><strong>Status:</strong> {project.is_completed ? "Completed" : "In Progress"}</div>
                  <div className="mb-2"><strong>Progress:</strong> {project.progress}%</div>
                  <div className="mb-2"><strong>Start Date:</strong> {project.start_date}</div>
                  <div className="mb-2"><strong>End Date:</strong> {project.estimated_end_date}</div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-gray-100 rounded-xl p-4 text-center">[Images Upload/View Placeholder]</div>
                  <div className="bg-gray-100 rounded-xl p-4 text-center">[Videos Upload/View Placeholder]</div>
                  <div className="bg-gray-100 rounded-xl p-4 text-center">[VR Video View Placeholder]</div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "progress" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Progress Logs</h2>
              <div className="bg-gray-100 rounded-xl p-4 text-center">[Logs List & Upload/Edit Placeholder]</div>
            </div>
          )}
          {activeTab === "timeline" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Project Timeline</h2>
              <div className="bg-gray-100 rounded-xl p-4 text-center">[Timeline Placeholder]</div>
            </div>
          )}
          {activeTab === "invoices" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Invoices & Billing</h2>
              <div className="bg-gray-100 rounded-xl p-4 text-center">[Invoices & Billing Placeholder]</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
