"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Book } from "lucide-react";
import Link from "next/link";
import { projectExcerpt } from "@/lib/projects";

type ProjectItem = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
  service: {
    id: string;
    title: string;
  };
};

export default function Projects({
  limit,
  showCta = true,
}: {
  limit?: number;
  showCta?: boolean;
}) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadProjects() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();

        if (!ignore) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        if (!ignore) {
          setProjects([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      ignore = true;
    };
  }, []);

  const visibleProjects = typeof limit === "number" ? projects.slice(0, limit) : projects;

  return (
    <section id="projects" className="py-20">
      <div className="mx-auto max-w-[1290px] px-6">
        <div className="mb-16 text-center">
          <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
            <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
              <Book className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
            </div>

            <h2 className="font-alt text-4xl font-extrabold uppercase leading-none tracking-tight">
              Our Projects
            </h2>

            <div className="absolute -bottom-3 left-1/2 w-max -translate-x-1/2 bg-white px-3">
              <span className="font-alt text-xs font-bold uppercase tracking-[2px]">
                What We Have Done
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-[#7a7a7a]">
            Browse recent work completed by our team across different service categories, with each project shown as a full case-study style post.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading projects...</div>
        ) : visibleProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
            No projects have been published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map((project) => (
              <Link
                href={`/project/${project.slug}`}
                target="_blank"
                rel="noreferrer"
                key={project.id}
                className="group block overflow-hidden shadow-lg"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span className="mb-2 inline-block text-sm font-semibold text-yellow-400">
                      {project.service.title}
                    </span>
                    <h3 className="text-2xl font-bold">{project.title}</h3>
                  </div>
                </div>
                <div className="bg-white p-6">
                  <p className="min-h-[72px] text-sm leading-6 text-gray-600">
                    {projectExcerpt(project.description)}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-gray-900">
                    View Project <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {showCta ? (
          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-block rounded border-2 border-gray-900 bg-transparent px-8 py-3 font-bold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
            >
              VIEW ALL PROJECTS
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
