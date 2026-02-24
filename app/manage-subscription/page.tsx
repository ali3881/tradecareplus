import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManageSubscriptionClient from "./ManageSubscriptionClient";

export default async function ManageSubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <ManageSubscriptionClient />;
}
