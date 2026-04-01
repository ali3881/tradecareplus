import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AccountSettingsClient from "./AccountSettingsClient";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, bookingCount, enquiryCount, transactionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    }),
    prisma.hireBooking.count({
      where: { userId: session.user.id },
    }),
    prisma.saleInquiry.count({
      where: { userId: session.user.id },
    }),
    prisma.transaction.count({
      where: { userId: session.user.id },
    }),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <AccountSettingsClient
        initialUser={{
          name: user.name || "",
          email: user.email,
          phone: user.phone || "",
        }}
      />

     
    </div>
  );
}
