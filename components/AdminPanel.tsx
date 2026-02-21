"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, Search, Filter, Eye, Download, PlayCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminPanel() {
  const [data, setData] = useState<{ users: any[]; jobs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "jobs">("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/summary");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading admin panel...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load admin data.</div>;
  }

  const filteredUsers = data.users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = data.jobs.filter((j) => {
    const matchesSearch =
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? j.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
             <span className="bg-purple-500 w-2 h-6 mr-3 rounded-sm"></span>
             Admin Panel
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage all users and service requests</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
            <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "users" ? "bg-purple-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
            >
                Users ({data.users.length})
            </button>
            <button
                onClick={() => setActiveTab("jobs")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "jobs" ? "bg-purple-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
            >
                Jobs ({data.jobs.length})
            </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            {activeTab === "jobs" && (
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                >
                    <option value="">All Status</option>
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            )}
        </div>

        {/* Content */}
        {activeTab === "users" ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || "N/A"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.subscription ? (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {user.subscription.plan} ({user.subscription.status})
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                         {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        ) : (
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div>{job.user.name || "N/A"}</div>
                                    <div className="text-xs text-gray-500">{job.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        job.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                                        job.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {job.urgency}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        job.status === 'NEW' ? 'bg-green-100 text-green-800' :
                                        job.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={() => setSelectedJob(job)}
                                        className="text-purple-600 hover:text-purple-900 font-bold flex items-center"
                                    >
                                        <Eye size={16} className="mr-1" /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredJobs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No jobs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Quick Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedJob(null)}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Job Details
                                </h3>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p className="font-bold text-gray-700">Customer</p>
                                        <p>{selectedJob.user.name} ({selectedJob.user.email})</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700">Type</p>
                                        <p>{selectedJob.type}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700">Status</p>
                                        <p>{selectedJob.status}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700">Urgency</p>
                                        <p className={selectedJob.urgency === 'EMERGENCY' ? 'text-red-600 font-bold' : ''}>{selectedJob.urgency}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="font-bold text-gray-700">Description</p>
                                        <p className="mt-1 bg-gray-50 p-2 rounded">{selectedJob.description}</p>
                                    </div>
                                     <div className="col-span-2">
                                        <p className="font-bold text-gray-700">Location</p>
                                        <p>{selectedJob.locationText || "Not provided"}</p>
                                    </div>
                                    
                                    {selectedJob.attachments && selectedJob.attachments.length > 0 && (
                                        <div className="col-span-2 mt-2">
                                            <p className="font-bold text-gray-700 mb-2">Attachments ({selectedJob.attachments.length})</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {selectedJob.attachments.map((file: any) => (
                                                    <a 
                                                        key={file.id} 
                                                        href={file.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="block relative group border border-gray-200 rounded overflow-hidden aspect-square"
                                                    >
                                                        {file.mime.startsWith('image/') ? (
                                                            <img src={file.url} alt="Attachment" className="object-cover w-full h-full" />
                                                        ) : file.mime.startsWith('video/') ? (
                                                            <div className="bg-black flex items-center justify-center w-full h-full">
                                                                <PlayCircle className="text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-100 flex flex-col items-center justify-center w-full h-full p-2 text-center">
                                                                <FileText className="text-gray-400 mb-1" />
                                                                <span className="text-xs truncate w-full">{file.key}</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                            View
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                         <Link 
                            href={`/admin/jobs/${selectedJob.id}`}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Full Details
                        </Link>
                        <button 
                            type="button" 
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setSelectedJob(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
