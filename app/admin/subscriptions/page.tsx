import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import SubscriptionList from "./SubscriptionList";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: {
        select: { id: true },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center">
             <CreditCard className="mr-3 text-purple-500" />
             Subscription Management
           </h1>
           <p className="text-gray-500 mt-1">Monitor and manage user subscriptions.</p>
        </div>
      </div>

      <SubscriptionList initialSubscriptions={subscriptions} />
    </div>
  );
}
