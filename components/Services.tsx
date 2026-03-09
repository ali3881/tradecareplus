import {
  Home,
  Hammer,
  Wrench,
  Drill,
  HardHat,
} from "lucide-react";

const services = [
  {
    title: "Plumbing Services",
    image:
      "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/blog-img8-1024x630-1.jpg",
    icon: Home,
    className: "md:col-span-2 md:row-span-1",
    height: "h-[280px] md:h-[340px]",
  },
  {
    title: "Electrical Services",
    image:
      "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/Image-Caption10-1.jpg",
    icon: Hammer,
    className: "md:col-span-1 md:row-span-1",
    height: "h-[280px] md:h-[340px]",
  },
  {
    title: "Roofing Services",
    image:
      "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/Image-Caption6-4.jpg",
    icon: HardHat,
    className: "md:col-span-1",
    height: "h-[260px] md:h-[300px]",
  },
  {
    title: "Carpentry Services",
    image:
      "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/Image-Caption10-3.jpg",
    icon: Drill,
    className: "md:col-span-1",
    height: "h-[260px] md:h-[300px]",
  },
  {
    title: "Renovation Services",
    image:
      "https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/Image-Caption6-2.jpg",
    icon: Wrench,
    className: "md:col-span-1",
    height: "h-[260px] md:h-[300px]",
  },
];

export default function Services() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1290px] mx-auto px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-[700px] text-center">
          <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
            <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
              <Wrench className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
            </div>

            <h2 className="text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-black">
              Our Services
            </h2>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white w-max px-3">
              <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-red-600">
                What We Have Done
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-[#7a7a7a]">
            We cover building, plumbing, aircon/HVAC, electrical, property maintenance, and renovations with 24/7 availability.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className={`group relative overflow-hidden ${service.className} ${service.height}`}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                <div className="absolute bottom-7 left-5 z-10 md:left-7">
                  <div className="mb-5 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-yellow-400 shadow-md">
                    <Icon className="h-7 w-7 text-black" strokeWidth={2.2} />
                  </div>

                  <h3 className="text-md font-alt font-extrabold leading-none text-white md:text-[28px]">
                    {service.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
