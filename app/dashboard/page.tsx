import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true, entitlement: true },
  });

  if (!user) {
    redirect("/login");
  }

  const jobs = await prisma.serviceRequest.findMany({
    where: user.role === "ADMIN" ? {} : user.role === "STAFF" ? { assignedToId: session.user.id } : { userId: session.user.id },
    include:
      user.role === "ADMIN"
        ? {
            attachments: true,
            user: { select: { name: true, email: true, phone: true } },
            assignedTo: { select: { name: true, email: true } },
          }
        : user.role === "STAFF"
          ? {
              attachments: true,
              user: { select: { name: true, email: true, phone: true } },
            }
          : {
              attachments: true,
            },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient user={user} initialJobs={jobs} />;
}
