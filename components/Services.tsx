"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { getServiceIcon, serviceExcerpt } from "@/lib/services";

type ServiceItem = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  description: string;
  iconKey: string;
};

const layoutClasses = [
  "md:col-span-2 md:row-span-1 h-[280px] md:h-[340px]",
  "md:col-span-1 md:row-span-1 h-[280px] md:h-[340px]",
  "md:col-span-1 h-[260px] md:h-[300px]",
  "md:col-span-1 h-[260px] md:h-[300px]",
  "md:col-span-1 h-[260px] md:h-[300px]",
  "md:col-span-2 h-[280px] md:h-[320px]",
];

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadServices() {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data = await res.json();

        if (!ignore) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load services", error);
        if (!ignore) {
          setServices([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[1290px] px-6">
        <div className="mx-auto mb-14 max-w-[700px] text-center">
          <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
            <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
              <Wrench className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
            </div>

            <h2 className="font-alt text-4xl font-extrabold uppercase leading-none tracking-tight text-black">
              Our Services
            </h2>

            <div className="absolute -bottom-3 left-1/2 w-max -translate-x-1/2 bg-white px-3">
              <span className="font-alt text-xs font-bold uppercase tracking-[2px] text-red-600">
                What We Offer
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-[#7a7a7a]">
            Explore our core services across maintenance, repairs, installation, and property improvement.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
            No services have been published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.map((service, index) => {
              const Icon = getServiceIcon(service.iconKey);
              const layout = layoutClasses[index % layoutClasses.length];

              return (
                <Link
                  key={service.id}
                  href={`/service/${service.slug}`}
                  className={`group relative overflow-hidden ${layout}`}
                >
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute inset-0 z-10 flex items-end p-5 md:p-7">
                    <div className="max-w-full">
                      <div className="mb-5 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-yellow-400 shadow-md">
                        <Icon className="h-7 w-7 text-black" strokeWidth={2.2} />
                      </div>

                      <h3 className="font-alt text-md font-extrabold leading-none text-white md:text-[28px]">
                        {service.title}
                      </h3>
                      <p className="mt-3 max-w-xl break-words pr-1 text-sm leading-6 text-white/80 [overflow-wrap:anywhere]">
                        {serviceExcerpt(service.description, 110)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
