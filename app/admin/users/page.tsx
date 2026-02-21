import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Search, Eye, Filter } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string; role?: string };
}) {
  await requireAdmin();

  const search = searchParams.search || "";
  const role = searchParams.role || "";
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } }, 
      { email: { contains: search } },
    ];
  }
  if (role) {
    where.role = role;
  }

  const users = await prisma.user.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      _count: {
        select: { serviceRequests: true }
      }
    },
  });

  const total = await prisma.user.count({ where });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <form className="flex flex-wrap items-center gap-2">
          <div className="relative">
             <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search users..."
              className="px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm w-64"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
             <select
              name="role"
              defaultValue={role}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white text-sm cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jobs</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : 
                        user.role === "STAFF" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.subscription ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        {user.subscription.plan}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">
                    {user._count.serviceRequests}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${user.id}`} className="text-gray-400 hover:text-yellow-600 transition-colors">
                        <Eye size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Showing {users.length} of {total} users</span>
          <div className="flex space-x-2">
            {page > 1 && (
                <Link href={`/admin/users?page=${page - 1}&search=${search}&role=${role}`} className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Previous</Link>
            )}
            {page < totalPages && (
                <Link href={`/admin/users?page=${page + 1}&search=${search}&role=${role}`} className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Next</Link>
            )}
          </div>
      </div>
    </div>
  );
}
