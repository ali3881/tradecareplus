import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/"); 
  }

  return session;
}

export async function requireAdminOrStaff() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session || (role !== "ADMIN" && role !== "STAFF")) {
    redirect("/");
  }

  return session;
}

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}
