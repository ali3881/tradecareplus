import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, Shield, CreditCard } from "lucide-react";
import UserActions from "./UserActions";

export default async function AdminUserDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscription: true,
      serviceRequests: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
            <Link href="/admin/users" className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                {user.name || "Unknown User"}
                <span className={`ml-3 px-3 py-1 text-sm font-bold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'STAFF' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                }`}>
                    {user.role}
                </span>
            </h1>
            <p className="text-gray-500">{user.email}</p>
        </div>
        
        <UserActions id={user.id} email={user.email} currentRole={user.role} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="mr-2 text-gray-500" /> Profile Information
              </h2>
              <div className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">User ID</label>
                      <p className="text-sm font-mono text-gray-700">{user.id}</p>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">Joined</label>
                      <p className="text-sm text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="mr-2 text-gray-500" /> Subscription
              </h2>
              {user.subscription ? (
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Plan</label>
                          <p className="text-lg font-bold text-gray-900">{user.subscription.plan}</p>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-bold rounded-full ${
                            user.subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                              {user.subscription.status}
                          </span>
                      </div>
                  </div>
              ) : (
                  <p className="text-gray-500 italic">No active subscription</p>
              )}
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Jobs</h2>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {user.serviceRequests.map(job => (
                          <tr key={job.id}>
                              <td className="px-4 py-2 text-sm text-gray-600">{new Date(job.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{job.type}</td>
                              <td className="px-4 py-2">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                      {job.status}
                                  </span>
                              </td>
                              <td className="px-4 py-2">
                                  <Link href={`/admin/jobs/${job.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                              </td>
                          </tr>
                      ))}
                      {user.serviceRequests.length === 0 && (
                          <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No jobs found</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
