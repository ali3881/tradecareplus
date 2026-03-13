import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, FolderOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { normalizeProjectImages, parseProjectImages, sanitizeProjectHtml } from "@/lib/projects";
import ProjectGallery from "./ProjectGallery";

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      service: {
        select: { title: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const serviceLabel = project.service.title;
  const images = normalizeProjectImages(parseProjectImages(project.imagesJson), project.imageUrl);

  return (
    <main className="flex-grow bg-white">
      <div className="bg-gray-900 py-16 pt-20 text-white">
        <div className="font-alt mx-auto flex max-w-[1290px] items-center justify-between px-6">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[2px] text-yellow-500">
              {serviceLabel}
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold">{project.title}</h1>
          </div>
          <div className="hidden items-center text-md md:flex">
            <Link href="/" className="text-gray-400 transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-600" />
            <Link href="/projects" className="text-gray-400 transition-colors hover:text-white">
              Projects
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-600" />
            <span className="max-w-[260px] truncate text-yellow-500">{project.title}</span>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[980px] px-6 py-16">
        <ProjectGallery title={project.title} images={images} />

        <div className="mt-10 flex flex-wrap items-center gap-6 border-b border-gray-200 pb-8 text-sm text-gray-500">
          <div className="inline-flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-yellow-600" />
            <span>{serviceLabel}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-yellow-600" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <article className="mt-10 max-w-none text-gray-700">
          <div className="rounded-[28px] bg-[#f8f5ed] p-8 md:p-10">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[2px] text-yellow-700">
              Project Overview
            </p>
            <div
              className="rich-content project-content text-[17px] leading-8 text-gray-700 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-yellow-500 [&_blockquote]:pl-4 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: sanitizeProjectHtml(project.description) }}
            />
          </div>
        </article>

        <div className="mt-12 rounded-[28px] border border-yellow-200 bg-yellow-50 px-8 py-10">
          <h2 className="font-alt text-2xl font-bold uppercase text-gray-900">Need something similar?</h2>
          <p className="mt-3 max-w-2xl text-gray-600">
            Explore our service categories or contact the team to discuss a similar project for your property.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              View Services
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
