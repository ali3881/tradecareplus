import Link from "next/link";
import About from "@/components/About";
import Stats from "@/components/Stats";
import { prisma } from "@/lib/prisma";
import { getServiceIcon } from "@/lib/services";

const clientTypes = [
  "Homeowners",
  "Property managers",
  "Real estate agencies",
  "Strata managers",
  "Commercial property owners",
  "Builders and developers",
];

const values = [
  "Quality workmanship",
  "Honest communication",
  "Reliable service",
  "Long-term solutions",
];

const reasons = [
  "Reliable and professional service",
  "Experienced trade professionals",
  "Multiple services under one provider",
  "Residential and commercial solutions",
  "Customer-focused approach",
];

export default async function AboutPage() {
  const serviceItems = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      iconKey: true,
    },
  });

  return (
    <main className="flex-grow">
      <div className="bg-gray-900 text-white py-16 pt-20">
        <div className="font-alt max-w-[1290px] mx-auto px-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold ">About Us</h1>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">About</span>
          </div>
        </div>
      </div>
      

      
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[2px] text-yellow-600">About Trade Care Plus</p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Reliable Property Maintenance & Trade Services You Can Trust
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              At Trade Care Plus, we provide reliable, professional, and high-quality trade services for residential,
              commercial, and strata properties. Our goal is simple: to make property maintenance and repairs easy by
              delivering dependable services across multiple trades in one place.
            </p>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              We understand that maintaining a property can be stressful, especially when dealing with unexpected repairs
              or urgent issues. That’s why our team focuses on providing fast response times, quality workmanship, and
              excellent customer service on every job.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p className="mt-4 text-gray-600 leading-7">
                Our mission is to provide trusted trade and maintenance services that help property owners keep their
                homes and businesses safe, functional, and well maintained.
              </p>
              <ul className="mt-6 space-y-3">
                {values.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-gray-600 leading-7">
                Every project we take on is handled with care and professionalism.
              </p>
            </section>

            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">What We Do</h3>
              <p className="mt-4 text-gray-600 leading-7">
                Trade Care Plus offers a wide range of property maintenance and trade services, making it easier for our
                clients to manage repairs, upgrades, and maintenance through one trusted provider.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {serviceItems.map((item) => {
                  const Icon = getServiceIcon(item.iconKey);

                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-black shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>{item.title}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">Who We Work With</h3>
              <p className="mt-4 text-gray-600 leading-7">
                Our services are designed to support a wide range of clients, whether it’s a small repair or a larger
                renovation project.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {clientTypes.map((item) => (
                  <li key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">Our Commitment to Quality</h3>
              <p className="mt-4 text-gray-600 leading-7">
                At Trade Care Plus, we focus on delivering work that meets high professional standards. Our team works
                with trusted materials, modern tools, and proven methods to ensure every job is completed properly.
              </p>
              <p className="mt-4 text-gray-600 leading-7">
                We take pride in providing services that are safe, efficient, and built to last.
              </p>
            </section>
          </div>

          <section className="mt-8 rounded-3xl bg-gray-900 px-8 py-10 text-white">
            <h3 className="text-2xl font-bold">Why Choose Trade Care Plus</h3>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {reasons.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-white/80 leading-7">
              Our goal is to build long-term relationships with our clients by delivering quality work and dependable
              service.
            </p>
          </section>

          <section className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 px-8 py-10">
            <h3 className="text-2xl font-bold text-gray-900">Get in Touch</h3>
            <p className="mt-4 max-w-3xl text-gray-700 leading-7">
              If you need professional trade or property maintenance services, Trade Care Plus is here to help.
            </p>
            <div className="mt-6 space-y-2 text-gray-800">
              <p>
                <span className="font-semibold">Phone:</span> 0410 886 899
              </p>
              <p>
                <span className="font-semibold">Website:</span>{" "}
                <a
                  href="https://tradecareplus.com.au"
                  className="text-red-600 hover:text-red-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://tradecareplus.com.au
                </a>
              </p>
            </div>
          </section>
        </div>
      </section>
      
      <About />
      <Stats />
    </main>
  );
}
