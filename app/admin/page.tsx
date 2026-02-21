import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Users, Briefcase, AlertCircle, LayoutDashboard, CheckCircle, Clock, HardHat, CreditCard } from "lucide-react";

export default async function AdminDashboard() {
  await requireAdmin();

  const userCount = await prisma.user.count({ where: { role: "USER" } });
  const staffCount = await prisma.user.count({ where: { role: "STAFF" } });
  const jobCount = await prisma.serviceRequest.count();
  const openJobCount = await prisma.serviceRequest.count({ where: { status: "NEW" } });
  const inProgressCount = await prisma.serviceRequest.count({ where: { status: "IN_PROGRESS" } });
  const completedCount = await prisma.serviceRequest.count({ where: { status: "COMPLETED" } });
  const activeSubsCount = await prisma.subscription.count({ where: { status: "ACTIVE" } });

  // Get recent activity (last 5 jobs)
  const recentJobs = await prisma.serviceRequest.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to the TradeCarePlus Admin Portal.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Users size={24} />
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Users</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userCount}</p>
          <p className="text-sm text-gray-500 mt-1">Active Customers</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-green-50 rounded-full text-green-600">
                <Briefcase size={24} />
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Jobs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{jobCount}</p>
          <p className="text-sm text-gray-500 mt-1">Total Requests</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-red-50 rounded-full text-red-600">
                <AlertCircle size={24} />
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Action Needed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{openJobCount}</p>
          <p className="text-sm text-gray-500 mt-1">New / Unassigned</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <CreditCard size={24} />
             </div>
             <span className="text-xs font-bold text-gray-400 uppercase">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeSubsCount}</p>
          <p className="text-sm text-gray-500 mt-1">Active Subscriptions</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Technicians</p>
                <p className="text-2xl font-bold text-gray-900">{staffCount}</p>
            </div>
            <HardHat className="text-orange-500 opacity-50" size={32} />
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
            <Clock className="text-blue-500 opacity-50" size={32} />
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
            <CheckCircle className="text-green-500 opacity-50" size={32} />
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-800">Recent Requests</h3>
                  <Link href="/admin/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-800">View All</Link>
              </div>
              <div className="divide-y divide-gray-100">
                  {recentJobs.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">No recent activity.</div>
                  ) : (
                      recentJobs.map(job => (
                          <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-gray-900 text-sm">{job.type.replace(/_/g, ' ')}</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          job.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                          {job.urgency}
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-500">by {job.user.name || job.user.email}</p>
                              </div>
                              <div className="text-right">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      job.status === 'NEW' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                      {job.status}
                                  </span>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 content-start">
              <Link href="/admin/jobs" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 flex flex-col items-center justify-center text-center h-32">
                  <Briefcase size={28} className="text-blue-600 mb-2" />
                  <span className="font-bold text-blue-900">Manage Jobs</span>
              </Link>
              <Link href="/admin/users" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 flex flex-col items-center justify-center text-center h-32">
                  <Users size={28} className="text-purple-600 mb-2" />
                  <span className="font-bold text-purple-900">Manage Users</span>
              </Link>
              <Link href="/admin/staff" className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors border border-orange-100 flex flex-col items-center justify-center text-center h-32">
                  <HardHat size={28} className="text-orange-600 mb-2" />
                  <span className="font-bold text-orange-900">Manage Staff</span>
              </Link>
              <Link href="/admin/reports" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100 flex flex-col items-center justify-center text-center h-32">
                  <LayoutDashboard size={28} className="text-green-600 mb-2" />
                  <span className="font-bold text-green-900">Reports</span>
              </Link>
          </div>
      </div>
    </div>
  );
}
