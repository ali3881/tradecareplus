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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <AccountSettingsClient
      initialUser={{
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
      }}
    />
  );
}
