import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Clock, Calendar, FileText, Download, PlayCircle, Phone, Mail } from "lucide-react";
import JobActions from "./JobActions";

export default async function AdminJobDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const job = await prisma.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      assignedTo: true,
      attachments: true,
    },
  });

  if (!job) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h1>
            <Link href="/admin/jobs" className="text-yellow-600 hover:underline">Back to Jobs</Link>
        </div>
    );
  }

  // Fetch staff for assignment dropdown
  const staff = await prisma.user.findMany({
    where: { role: "STAFF" },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <Link href="/admin/jobs" className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
                Job #{job.id.slice(-6).toUpperCase()}
            </h1>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                job.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                job.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
            }`}>
              {job.status}
            </span>
          </div>
        </div>
        
        <JobActions id={job.id} currentStatus={job.status} currentAssignedTo={job.assignedToId} staffList={staff} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Request Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Type</label>
                <p className="font-medium text-gray-900 mt-1 text-lg">{job.type}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Urgency</label>
                 <p className={`font-bold mt-1 text-lg ${
                    job.urgency === 'EMERGENCY' ? 'text-red-600' :
                    job.urgency === 'HIGH' ? 'text-orange-600' :
                    'text-blue-600'
                }`}>
                  {job.urgency}
                </p>
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Technician</label>
                 <div className="flex items-center mt-1 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-2">
                        {job.assignedTo?.name?.charAt(0) || <User size={16} />}
                    </div>
                    <p className="font-medium">{job.assignedTo?.name || "Unassigned"}</p>
                 </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                 <div className="flex items-start mt-1 text-gray-700">
                    <MapPin size={18} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p>{job.locationText || "Not provided"}</p>
                 </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Created At</label>
                 <div className="flex items-center mt-1 text-gray-700">
                    <Calendar size={18} className="mr-2 text-gray-400 flex-shrink-0" />
                    <p>{new Date(job.createdAt).toLocaleString()}</p>
                 </div>
              </div>
               <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">After Hours</label>
                 <div className="flex items-center mt-1 text-gray-700">
                    <Clock size={18} className="mr-2 text-gray-400 flex-shrink-0" />
                    <p>{job.afterHours ? "Yes" : "No"}</p>
                 </div>
              </div>
              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preferred Contact</label>
                 <div className="flex items-center mt-1 text-gray-700">
                    <Phone size={18} className="mr-2 text-gray-400 flex-shrink-0" />
                    <p>{job.preferredContactMethod}</p>
                 </div>
              </div>
            </div>

            <div className="mt-8">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
               <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {job.description}
               </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <FileText size={20} className="mr-2 text-gray-500" />
                    Attachments
                </h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                    {job.attachments.length}
                </span>
             </div>
             
             {job.attachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {job.attachments.map((file) => (
                    <div key={file.id} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                       {file.mime.startsWith("image/") ? (
                          <div className="aspect-square relative bg-gray-200">
                            <img src={file.url} alt="Attachment" className="object-cover w-full h-full" />
                          </div>
                       ) : file.mime.startsWith("video/") ? (
                          <div className="aspect-square relative flex items-center justify-center bg-black">
                             <video src={file.url} className="w-full h-full object-cover opacity-60" />
                             <PlayCircle size={32} className="text-white absolute z-10" />
                          </div>
                       ) : (
                          <div className="aspect-square flex flex-col items-center justify-center p-4 text-center bg-white">
                             <FileText size={32} className="text-gray-400 mb-2" />
                             <span className="text-xs text-gray-500 truncate w-full px-2" title={file.key}>{file.key.split("/").pop()}</span>
                          </div>
                       )}
                       
                       <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-medium p-2 text-center"
                       >
                          <Download size={24} className="mb-2" />
                          <span className="text-xs">Download</span>
                       </a>
                    </div>
                  ))}
                </div>
             ) : (
               <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                   <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                   <p className="text-gray-500 text-sm">No attachments provided.</p>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* User Info */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center">
                  <User size={20} className="mr-2 text-gray-500" />
                  Customer Details
              </h2>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
                    <p className="font-medium text-gray-900 mt-1 text-lg">{job.user.name || "N/A"}</p>
                 </div>
                 
                 <div className="pt-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Contact</label>
                    <a href={`mailto:${job.user.email}`} className="flex items-center text-gray-700 hover:text-yellow-600 transition-colors mb-2 break-all">
                      <Mail size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                      {job.user.email}
                    </a>
                    {job.user.phone && (
                        <a href={`tel:${job.user.phone}`} className="flex items-center text-gray-700 hover:text-yellow-600 transition-colors">
                            <Phone size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                            {job.user.phone}
                        </a>
                    )}
                 </div>

                 <div className="pt-2 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Member Since</label>
                    <p className="text-sm text-gray-600 mt-1">{new Date(job.user.createdAt).toLocaleDateString()}</p>
                 </div>

                 <div className="pt-4">
                    <Link 
                        href={`/admin/users?search=${job.user.email}`}
                        className="flex items-center justify-center w-full py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors shadow-sm"
                    >
                        View User History
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
