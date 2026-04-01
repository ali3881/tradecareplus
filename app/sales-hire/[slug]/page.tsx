import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import CatalogItemDetailClient from "@/components/CatalogItemDetailClient";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SalesHireItemPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { booking?: string };
}) {
  const [item, session] = await Promise.all([
    prisma.catalogItem.findUnique({
      where: { slug: params.slug },
    }),
    getServerSession(authOptions),
  ]);

  const currentUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          phone: true,
        },
      })
    : null;

  if (!item || !item.isActive) {
    notFound();
  }

  return (
    <main className="flex-grow bg-[#fffdf6]">
      <div className="bg-gray-900 py-16 pt-20 text-white">
        <div className="mx-auto flex max-w-[1290px] items-center justify-between px-6 font-alt">
          <div>
            <p className="text-xs font-bold uppercase tracking-[3px] text-yellow-400">{item.category}</p>
            <h1 className="mt-3 text-4xl font-semibold">{item.name}</h1>
          </div>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 transition-colors hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <Link href="/sales-hire" className="text-gray-400 transition-colors hover:text-white">
              Sales and Hire
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-400">{item.name}</span>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1290px] px-6">
          <CatalogItemDetailClient
            item={item}
            status={searchParams.booking || null}
            initialUser={
              currentUser?.email
                ? {
                    name: currentUser.name || "",
                    email: currentUser.email,
                    phone: currentUser.phone || "",
                  }
                : null
            }
          />
        </div>
      </section>
    </main>
  );
}
