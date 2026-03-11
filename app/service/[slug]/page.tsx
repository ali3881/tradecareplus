import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServiceIcon, sanitizeServiceHtml } from "@/lib/services";

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
  });

  if (!service) {
    notFound();
  }

  const Icon = getServiceIcon(service.iconKey);

  return (
    <main className="flex-grow bg-white">
      <div className="bg-gray-900 py-16 pt-20 text-white">
        <div className="font-alt mx-auto flex max-w-[1290px] items-center justify-between px-6">
          <div>
            
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
                <Icon className="h-6 w-6" />
              </span>
              <h1 className="max-w-4xl text-4xl font-semibold">{service.title}</h1>
            </div>
          </div>
          <div className="hidden items-center text-md md:flex">
            <Link href="/" className="text-gray-400 transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-600" />
            <Link href="/services" className="text-gray-400 transition-colors hover:text-white">
              Services
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-600" />
            <span className="max-w-[260px] truncate text-yellow-500">{service.title}</span>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <img
              src={service.imageUrl}
              alt={service.title}
              className="h-[280px] w-full rounded-[28px] object-cover shadow-xl md:h-[520px]"
            />

            <article className="mt-10 rounded-[28px] bg-[#f8f5ed] p-8 md:p-10">
              <p className="mb-6 text-sm font-semibold uppercase tracking-[2px] text-yellow-700">
                Service Overview
              </p>
              <div
                className="rich-content text-[17px] leading-8 text-gray-700 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-yellow-500 [&_blockquote]:pl-4 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: sanitizeServiceHtml(service.description) }}
              />
            </article>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-yellow-200 bg-yellow-50 px-8 py-10">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="font-alt text-2xl font-bold uppercase text-gray-900">{service.title}</h2>
              </div>
              <p className="mt-3 text-gray-600">
                Professional support tailored to residential and commercial property needs.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="h-4 w-4 text-yellow-700" />
                <span>{new Date(service.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="rounded-[28px] bg-gray-900 px-8 py-10 text-white">
              <h3 className="font-alt text-2xl font-bold uppercase">Need this service?</h3>
              <p className="mt-3 text-white/70">
                Contact our team for a quote or browse project case studies to see recent work.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-yellow-300"
                >
                  Contact Us
                </Link>
                <Link
                  href="/projects"
                  className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                >
                  View Projects
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
