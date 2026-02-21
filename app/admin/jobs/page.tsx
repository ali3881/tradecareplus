import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Search, Filter, Eye } from "lucide-react";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: { status?: string; urgency?: string; page?: string };
}) {
  await requireAdmin();

  const status = searchParams.status || "";
  const urgency = searchParams.urgency || "";
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status) where.status = status;
  if (urgency) where.urgency = urgency;

  const jobs = await prisma.serviceRequest.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      _count: {
        select: { attachments: true },
      },
    },
  });

  const total = await prisma.serviceRequest.count({ where });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
        
        <form className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              name="status"
              defaultValue={status}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white text-sm cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="AWAITING_PARTS">Awaiting Parts</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Filter size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
             <select
              name="urgency"
              defaultValue={urgency}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white text-sm cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="">All Urgency</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
             <Filter size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-bold shadow-sm">
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{job.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{job.user.name || "N/A"}</span>
                        <span className="text-xs text-gray-500">{job.user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{job.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        job.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                        job.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                      {job.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {job.assignedTo ? (
                        <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mr-2">
                                {job.assignedTo.name?.charAt(0) || "T"}
                            </div>
                            <span className="truncate max-w-[100px]">{job.assignedTo.name}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        job.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        job.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/jobs/${job.id}`} className="text-gray-400 hover:text-yellow-600 transition-colors">
                        <Eye size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Showing {jobs.length} of {total} jobs</span>
          <div className="flex space-x-2">
            {page > 1 && (
                <Link href={`/admin/jobs?page=${page - 1}&status=${status}&urgency=${urgency}`} className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Previous</Link>
            )}
            {page < totalPages && (
                <Link href={`/admin/jobs?page=${page + 1}&status=${status}&urgency=${urgency}`} className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Next</Link>
            )}
          </div>
      </div>
    </div>
  );
}
