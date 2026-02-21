"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Video, MessageSquare, PlusCircle, Eye, Trash2, Loader2, MessageCircle } from "lucide-react";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import JobDetailsModal from "@/components/JobDetailsModal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { hasDashboardAccess } from "@/lib/access";
import AdminPanel from "@/components/AdminPanel";

export default function DashboardClient({ user }: { user: any }) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sub = user.subscription;
  const isActive = hasDashboardAccess(user, sub);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/service-requests");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) return;
    
    setDeletingId(id);
    try {
        const res = await fetch(`/api/service-requests/${id}`, {
            method: "DELETE"
        });
        
        if (res.ok) {
            setJobs(prev => prev.filter(job => job.id !== id));
        } else {
            const err = await res.json();
            alert(`Failed to delete: ${err.message || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete job. Please try again.");
    } finally {
        setDeletingId(null);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchJobs();
    }
  }, [isActive, fetchJobs]);

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-yellow-500 p-4 text-center">
            <h2 className="text-xl font-bold text-black">Choose Your Plan</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              You need an active subscription to access the dashboard features, log jobs, and use chat/video support.
            </p>
            <Link href="/packages" className="block w-full py-3 bg-gray-900 text-white rounded font-bold hover:bg-gray-800 transition-colors">
              VIEW PACKAGES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, {user.name || user.email}</p>
          </div>
          <div className="flex items-center space-x-4">
             {sub && (
               <>
                 <span className="text-sm text-gray-500">Plan: <span className="font-bold text-gray-900">{sub.plan}</span></span>
                 <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {sub.status}
                 </div>
               </>
             )}
             {user.role === "ADMIN" && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    ADMIN
                </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {user.role === "ADMIN" && (
           <AdminPanel />
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <button 
            onClick={() => setShowJobForm(true)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group border border-transparent hover:border-yellow-500 w-full"
          >
            <div className="bg-yellow-100 p-4 rounded-full mb-4 group-hover:bg-yellow-200 transition-colors">
              <PlusCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-bold text-lg mb-1">Log a Job</h3>
            <p className="text-sm text-gray-500">Request service or maintenance</p>
          </button>

          {/* Video Assessment */}
          <a
            href="https://wa.me/61410886899?text=Hi,%20I%20would%20like%20to%20request%20a%20video%20assessment."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group border border-transparent hover:border-blue-500 w-full"
          >
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-1">Video Assessment</h3>
            <p className="text-sm text-gray-500">Request a video call assessment</p>
          </a>

          {/* Chat on WhatsApp */}
          <a
            href="https://wa.me/61410886899?text=Hi,%20I%20need%20help%20with%20a%20service%20request."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group border border-transparent hover:border-green-500 w-full"
          >
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-1">Chat on WhatsApp</h3>
            <p className="text-sm text-gray-500">Instant support via WhatsApp</p>
          </a>
        </div>

        {/* Snapshot */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Coverage Snapshot</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Included Visits Remaining</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.entitlement?.includedVisitsRemaining || 0}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">CCTV / Jet Blast Due</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.entitlement?.cctvDueAt ? new Date(user.entitlement.cctvDueAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Hot Water Inspection Due</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                   {user.entitlement?.hotWaterInspectionDueAt ? new Date(user.entitlement.hotWaterInspectionDueAt).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* My Jobs List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Jobs</h3>
            <button onClick={fetchJobs} className="text-sm text-yellow-600 hover:text-yellow-700">Refresh</button>
          </div>
          <div className="border-t border-gray-200">
            {jobs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    No jobs logged yet.
                </div>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                        <li key={job.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-yellow-600 truncate">
                                        {job.type.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {job.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        job.status === 'NEW' ? 'bg-green-100 text-green-800' : 
                                        job.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {job.status}
                                    </span>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2 flex space-x-2">
                                        <button 
                                            onClick={() => setSelectedJob(job)}
                                            className="text-gray-400 hover:text-blue-500 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <a 
                                            href={buildWhatsAppUrl({
                                                name: user.name || user.email,
                                                email: user.email,
                                                jobId: job.id,
                                                serviceType: job.type,
                                                description: job.description,
                                                location: job.locationText,
                                                urgency: job.urgency
                                            })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-green-500 transition-colors"
                                            title="Chat on WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </a>
                                        <button 
                                            onClick={() => handleDeleteJob(job.id)}
                                            disabled={deletingId === job.id}
                                            className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            title="Delete Job"
                                        >
                                            {deletingId === job.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>

        {/* Job Details Modal */}
        {selectedJob && (
            <JobDetailsModal 
                job={selectedJob} 
                onClose={() => setSelectedJob(null)} 
            />
        )}

        {/* Job Form Modal */}
        {showJobForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
             <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowJobForm(false)}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                   <ServiceRequestForm 
                    onClose={() => setShowJobForm(false)} 
                    onSuccess={fetchJobs}
                   />
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
