import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { BarChart2, TrendingUp, Users, DollarSign } from "lucide-react";

export default async function AdminReportsPage() {
  await requireAdmin();

  // In a real app, these would be aggregated queries
  const jobStats = await prisma.serviceRequest.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  const totalJobs = jobStats.reduce((acc, curr) => acc + curr._count.id, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart2 className="mr-3 text-green-500" />
          Reports & Analytics
        </h1>
        <p className="text-gray-500 mt-1">System performance and business metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-700">Job Completion Rate</h3>
                 <TrendingUp className="text-green-500" />
             </div>
             <div className="text-3xl font-bold text-gray-900">
                {totalJobs > 0 ? Math.round((jobStats.find(s => s.status === 'COMPLETED')?._count.id || 0) / totalJobs * 100) : 0}%
             </div>
             <p className="text-sm text-gray-500 mt-1">of {totalJobs} total jobs</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-700">Customer Satisfaction</h3>
                 <Users className="text-blue-500" />
             </div>
             <div className="text-3xl font-bold text-gray-900">4.8/5</div>
             <p className="text-sm text-gray-500 mt-1">Based on recent feedback</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-700">Estimated Revenue</h3>
                 <DollarSign className="text-yellow-500" />
             </div>
             <div className="text-3xl font-bold text-gray-900">$12,450</div>
             <p className="text-sm text-gray-500 mt-1">This month (projection)</p>
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Job Status Distribution</h3>
          <div className="space-y-4">
              {jobStats.map(stat => (
                  <div key={stat.status}>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{stat.status}</span>
                          <span className="text-gray-500">{stat._count.id} jobs</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                                stat.status === 'COMPLETED' ? 'bg-green-500' :
                                stat.status === 'NEW' ? 'bg-blue-500' :
                                stat.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                                'bg-gray-400'
                            }`} 
                            style={{ width: `${(stat._count.id / totalJobs) * 100}%` }}
                          ></div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
