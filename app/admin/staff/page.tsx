import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { HardHat } from "lucide-react";
import StaffList from "./StaffList";

export default async function AdminStaffPage() {
  await requireAdmin();

  const staff = await prisma.user.findMany({
    where: { role: "STAFF" },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assignedJobs: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center">
             <HardHat className="mr-3 text-orange-500" />
             Staff Management
           </h1>
           <p className="text-gray-500 mt-1">Manage technicians and field staff.</p>
        </div>
      </div>

      <StaffList initialStaff={staff} />
    </div>
  );
}
