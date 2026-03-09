import Link from "next/link";
import { Truck, Bath, Shield, Briefcase, ArrowRight, CheckCircle2, Clock3, BadgeCheck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Excavators",
    description: "Excavator sales and hire for short-term and long-term construction projects.",
  },
  {
    icon: Bath,
    title: "Temporary Toilets",
    description: "Clean and serviced temporary toilet units for job sites and events.",
  },
  {
    icon: Shield,
    title: "Temporary Fencing",
    description: "Secure temporary fencing hire and supply for site protection and safety.",
  },
];

const benefits = [
  "Fast delivery and pickup scheduling",
  "Flexible short and long-term hire periods",
  "Site-compliant and safety-checked equipment",
  "Transparent pricing with no hidden charges",
];

const processSteps = [
  {
    title: "Share Your Requirement",
    description: "Tell us your site size, timeline, and required units or machinery.",
  },
  {
    title: "Get a Tailored Quote",
    description: "We recommend the best-fit package with clear pricing and inclusions.",
  },
  {
    title: "Delivery and Support",
    description: "Our team delivers on time and provides ongoing support during hire.",
  },
];

export default function SalesHirePage() {
  return (
    <main className="flex-grow bg-white">
      <div className="bg-gray-900 text-white py-16 pt-20">
        <div className="font-alt max-w-[1290px] mx-auto px-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold">Sales and Hire</h1>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Sales and Hire</span>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-20 bg-[#f7f7f7]">
        <div className="max-w-[1290px] mx-auto px-6">
          <div className="mx-auto mb-14 max-w-[760px] text-center">
            <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
              <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-[#f7f7f7]">
                <Briefcase className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
              </div>
              <h2 className="text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-black">
                Equipment and Site Facilities
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#f7f7f7] w-max px-3">
                <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-red-600">
                  What We Offer
                </span>
              </div>
            </div>
            <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-[#7a7a7a]">
              Reliable sales and hire solutions for construction teams, event setups, and site operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="group rounded-md border border-black/10 bg-white p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)]"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-black transition-colors duration-300 group-hover:bg-red-500 group-hover:text-white">
                    <Icon size={26} />
                  </div>
                  <h3 className="font-alt text-2xl font-bold text-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-7">
            <div className="rounded-md border border-black/10 bg-white p-7 md:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <h3 className="font-alt text-3xl font-bold text-black">Why Choose Our Sales and Hire Team</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                We support construction crews, property managers, and event operators with reliable assets and responsive service.
              </p>
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded bg-black px-4 py-4 text-white">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Clock3 size={16} />
                    <span className="text-xs uppercase tracking-wide font-semibold">Quick Turnaround</span>
                  </div>
                  <p className="mt-2 text-sm text-white/80">Priority dispatch for urgent requirements.</p>
                </div>
                <div className="rounded bg-yellow-400 px-4 py-4 text-black">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={16} />
                    <span className="text-xs uppercase tracking-wide font-semibold">Trusted Quality</span>
                  </div>
                  <p className="mt-2 text-sm text-black/80">Maintained units ready for immediate deployment.</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-black/10 bg-white p-7 md:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <h3 className="font-alt text-3xl font-bold text-black">How It Works</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                A simple process designed to keep your project moving without delays.
              </p>
              <div className="mt-7 space-y-5">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-yellow-400 text-black flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-alt text-xl font-bold text-black">{step.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-md bg-black text-white px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h3 className="font-alt text-2xl font-bold">Need a custom quote for large projects?</h3>
              <p className="mt-2 text-sm text-white/75">Tell us your site requirements and we will prepare the right plan for your timeline.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded bg-yellow-400 px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-yellow-500"
            >
              Contact Us
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
