import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, DollarSign, DollarSignIcon, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AccountActivityTabs from "../AccountActivityTabs";

export default async function AccountActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [bookings, enquiries] = await Promise.all([
    prisma.hireBooking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        item: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    }),
    prisma.saleInquiry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        item: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white shadow-lg sm:p-8">
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="md:max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bookings & Enquiries</h1>
            <p className="mt-2 text-sm text-gray-200 sm:text-base">
              Manage your hire bookings and sales enquiries from one place.
            </p>
          </div>
          <div className="md:flex md:justify-end">
            <Link href="/account/transactions" className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-white/10 hover:text-white">
              <Receipt className="mr-1 h-4 w-4" /> Transactions
            </Link>
          </div>
        </div>
      </div>

      <AccountActivityTabs
        bookings={bookings.map((booking) => ({
          id: booking.id,
          status: booking.status,
          createdAt: booking.createdAt.toISOString(),
          startDate: booking.startDate.toISOString(),
          endDate: booking.endDate.toISOString(),
          item: booking.item,
        }))}
        enquiries={enquiries.map((enquiry) => ({
          id: enquiry.id,
          status: enquiry.status,
          createdAt: enquiry.createdAt.toISOString(),
          item: enquiry.item,
        }))}
      />
    </div>
  );
}
