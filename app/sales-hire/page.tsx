import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, PhoneCall, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCatalogPrice, stripCatalogHtml } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/prisma-types";

export default async function SalesHirePage() {
  const items = await prisma.catalogItem.findMany({
    where: { isActive: true },
    orderBy: [{ itemType: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const hireItems = items.filter((item: CatalogItem) => item.itemType === "HIRE");
  const saleItems = items.filter((item: CatalogItem) => item.itemType === "SALE");

  return (
    <main className="flex-grow bg-[#fffdf6]">
      <div className="bg-gray-900 py-16 pt-20 text-white">
        <div className="mx-auto flex max-w-[1290px] items-center justify-between px-6 font-alt">
          <h1 className="text-4xl font-semibold">Sales and Hire</h1>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 transition-colors hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-400">Sales and Hire</span>
          </div>
        </div>
      </div>

      <section className="border-b border-yellow-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,197,38,0.25),_transparent_34%),linear-gradient(180deg,#fff7d8_0%,#fffdf6_100%)] py-16 md:py-20">
        <div className="mx-auto grid max-w-[1290px] gap-8 px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[3px] text-red-600">Two ways to order</p>
            <h2 className="mt-4 max-w-[760px] font-alt text-5xl font-black uppercase leading-none text-black">
              Hire online or enquire for sales equipment
            </h2>
            <p className="mt-6 max-w-[640px] text-base leading-7 text-stone-700">
              Hire items support online booking, live availability checks, date selection, automatic price totals, and secure payment.
              Sales items stay enquiry-only, with call and email actions for your team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#hire" className="rounded-full bg-black px-6 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-stone-800">
                Browse Hire Items
              </a>
              <a href="#sales" className="rounded-full border border-black px-6 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-black hover:text-white">
                Browse Sale Items
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-yellow-200 bg-white p-6 shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
              <CalendarDays className="h-9 w-9 text-yellow-500" />
              <h3 className="mt-5 font-alt text-2xl font-bold text-black">Hire</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">Pick dates, check availability, get a live total, and pay online.</p>
            </div>
            <div className="rounded-[28px] border border-yellow-200 bg-black p-6 text-white shadow-[0_18px_48px_rgba(0,0,0,0.12)]">
              <ShoppingBag className="h-9 w-9 text-yellow-400" />
              <h3 className="mt-5 font-alt text-2xl font-bold">Sales</h3>
              <p className="mt-3 text-sm leading-6 text-white/75">View stock, product details, and contact us for a tailored quote.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="hire" className="py-16 md:py-20">
        <div className="mx-auto max-w-[1290px] px-6">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[3px] text-red-600">Hire</p>
              <h2 className="font-alt text-4xl font-black uppercase text-black">Book online</h2>
            </div>
            <p className="max-w-[540px] text-sm leading-6 text-stone-600">
              Customers can open any hire item, choose booking dates, see availability, get the total, and proceed to payment.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {hireItems.map((item: CatalogItem) => (
              <article key={item.id} className="overflow-hidden rounded-[28px] border border-yellow-100 bg-white shadow-[0_14px_34px_rgba(0,0,0,0.07)]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-yellow-100 text-sm font-semibold uppercase tracking-[3px] text-stone-600">
                    Hire Item
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[2px] text-red-600">{item.category}</p>
                      <h3 className="mt-2 font-alt text-2xl font-bold text-black">{item.name}</h3>
                    </div>
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-[1px] text-black">
                      {item.quantityAvailable} available
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-stone-600">{item.shortDescription || stripCatalogHtml(item.description).slice(0, 120)}</p>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-stone-500">From</div>
                      <div className="text-lg font-bold text-black">{formatCatalogPrice(item)}</div>
                    </div>
                    <Link
                      href={`/sales-hire/${item.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-yellow-400 hover:text-black"
                    >
                      Book Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {hireItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-yellow-200 bg-white p-8 text-stone-500">No hire items added yet.</div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="sales" className="border-t border-yellow-100 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1290px] px-6">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[3px] text-red-600">Sales</p>
              <h2 className="font-alt text-4xl font-black uppercase text-black">Enquiry only</h2>
            </div>
            <p className="max-w-[540px] text-sm leading-6 text-stone-600">
              Sales items show information only. Customers can call, email, or open the item page to send an enquiry.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {saleItems.map((item: CatalogItem) => (
              <article key={item.id} className="overflow-hidden rounded-[28px] border border-stone-200 bg-[#fffdf7] shadow-[0_14px_34px_rgba(0,0,0,0.05)]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-stone-100 text-sm font-semibold uppercase tracking-[3px] text-stone-600">
                    Sale Item
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[2px] text-red-600">{item.category}</p>
                  <h3 className="mt-2 font-alt text-2xl font-bold text-black">{item.name}</h3>
                  <p className="mt-4 text-sm leading-6 text-stone-600">{item.shortDescription || stripCatalogHtml(item.description).slice(0, 120)}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="tel:0410886899" className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-yellow-400 hover:text-black">
                      <PhoneCall className="h-4 w-4" />
                      Call
                    </a>
                    <a href="mailto:info@tradecareplus.com.au" className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-black hover:text-white">
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                    <Link href={`/sales-hire/${item.slug}`} className="inline-flex items-center gap-2 rounded-full border border-yellow-400 px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-yellow-400">
                      Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            {saleItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-yellow-200 bg-white p-8 text-stone-500">No sale items added yet.</div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
