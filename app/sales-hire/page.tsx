import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  PhoneCall,
  ShoppingBag,
  Boxes,
  BadgeDollarSign,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCatalogPrice, stripCatalogHtml } from "@/lib/catalog";
import type { CatalogItem } from "@/lib/prisma-types";

function getCatalogCardCopy(item: CatalogItem) {
  const summary = item.shortDescription || stripCatalogHtml(item.description).slice(0, 145);

  if (item.itemType === "HIRE") {
    return {
      summary,
      eyebrow: item.category || "Hire Item",
      statLabel: "Availability",
      statValue: `${item.quantityAvailable} ready`,
      metaLabel: "Booking",
      metaValue: item.pricingModel === "PER_METER_PER_WEEK" ? "Meter + week pricing" : "Online date booking",
      cta: "Book Now",
      fallbackLabel: "Hire Item",
    };
  }

  return {
    summary,
    eyebrow: item.category || "Sale Item",
    statLabel: "Contact",
    statValue: "Enquiry only",
    metaLabel: "Process",
    metaValue: "Call or email for details",
    cta: "View Details",
    fallbackLabel: "Sale Item",
  };
}

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
              <article
                key={item.id}
                className="group overflow-hidden rounded-[30px] border border-yellow-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.16)]"
              >
                {(() => {
                  const card = getCatalogCardCopy(item);

                  return (
                    <>
                      <div className="relative overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-60 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-60 items-center justify-center bg-[linear-gradient(135deg,#ffe287_0%,#fff7d2_52%,#fffdf6_100%)] text-sm font-semibold uppercase tracking-[3px] text-stone-700">
                            {card.fallbackLabel}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.58)_100%)]" />
                        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                         
                          <span className="rounded-full border border-white/30 bg-black/45 px-3 py-1 text-[11px] font-bold uppercase tracking-[1.4px] text-white backdrop-blur-sm">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                          <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#ffe287]">{card.metaLabel}</p>
                          <h3 className="mt-2 font-alt text-[28px] font-black leading-tight">{item.name}</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-[22px] border border-yellow-100 bg-[#fff9e4] p-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.8px] text-stone-500">
                              <Boxes className="h-4 w-4 text-yellow-600" />
                              {card.statLabel}
                            </div>
                            <p className="mt-2 text-sm font-bold text-black">{card.statValue}</p>
                          </div>
                          <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.8px] text-stone-500">
                              <BadgeDollarSign className="h-4 w-4 text-stone-700" />
                              Pricing
                            </div>
                            <p className="mt-2 text-sm font-bold text-black">{formatCatalogPrice(item)}</p>
                          </div>
                        </div>

                        <p className="mt-5 min-h-[72px] text-sm leading-6 text-stone-600">{card.summary}</p>

                        <div className="mt-6 flex items-end justify-between gap-4 border-t border-yellow-100 pt-5">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[1.8px] text-stone-500">Best For</div>
                            <div className="mt-2 text-sm font-semibold text-black">{card.metaValue}</div>
                          </div>
                          <Link
                            href={`/sales-hire/${item.slug}`}
                            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-[#ffc526] hover:text-black"
                          >
                            {card.cta}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </>
                  );
                })()}
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
              <article
                key={item.id}
                className="group overflow-hidden rounded-[30px] border border-stone-200 bg-[#fffdf7] shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                {(() => {
                  const card = getCatalogCardCopy(item);

                  return (
                    <>
                      <div className="relative overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-60 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-60 items-center justify-center bg-[linear-gradient(135deg,#fff4c4_0%,#fff9e5_55%,#ffffff_100%)] text-sm font-semibold uppercase tracking-[3px] text-stone-700">
                            {card.fallbackLabel}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0.7)_100%)]" />
                        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                         
                          <span className="rounded-full border border-white/35 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[1.4px] text-white backdrop-blur-sm">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                          <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#ffe287]">{card.metaLabel}</p>
                          <h3 className="mt-2 font-alt text-[28px] font-black leading-tight">{item.name}</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-[22px] border border-yellow-100 bg-[#fff8dd] p-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.8px] text-stone-500">
                              <PhoneCall className="h-4 w-4 text-yellow-600" />
                              {card.statLabel}
                            </div>
                            <p className="mt-2 text-sm font-bold text-black">{card.statValue}</p>
                          </div>
                          <div className="rounded-[22px] border border-stone-200 bg-stone-50 p-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.8px] text-stone-500">
                              <ShoppingBag className="h-4 w-4 text-stone-700" />
                              Access
                            </div>
                            <p className="mt-2 text-sm font-bold text-black">Detail + enquiry</p>
                          </div>
                        </div>

                        <p className="mt-5 min-h-[72px] text-sm leading-6 text-stone-600">{card.summary}</p>

                        <div className="mt-6 flex flex-wrap gap-3 border-t border-yellow-100 pt-5">
                          <a
                            href="tel:0410886899"
                            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-white transition hover:bg-[#ffc526] hover:text-black"
                          >
                            <PhoneCall className="h-4 w-4" />
                            Call
                          </a>
                          <a
                            href="mailto:info@tradecareplus.com.au"
                            className="inline-flex items-center gap-2 rounded-full border border-black px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-black hover:text-white"
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </a>
                          <Link
                            href={`/sales-hire/${item.slug}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[#ffc526] px-5 py-3 text-sm font-bold uppercase tracking-[1px] text-black transition hover:bg-[#ffc526]"
                          >
                            Details
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </>
                  );
                })()}
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
