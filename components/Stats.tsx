import {
  Users,
  Compass,
  Globe,
  HardHat,
  Wrench,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "4126+",
    label: "HAPPY CLIENTS",
  },
  {
    icon: Compass,
    value: "250+",
    label: "PROJECTS COMPLETED",
  },
  {
    icon: Globe,
    value: "4+",
    label: "AVERAGE RATINGS",
  },
  {
    icon: HardHat,
    value: "38+",
    label: "QUALIFIED STAFS",
  },
];

export default function Stats() {
  return (
    <section className="bg-black py-28 text-white">
      <div className="max-w-[1290px] mx-auto px-6">
        {/* Heading */}
      
        <div className="mx-auto mb-14 max-w-[700px] text-center">
          <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
            <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-black">
              <Wrench className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
            </div>

            <h2 className="text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-white">
              OUR SUCCESS RATE
            </h2>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black w-max px-3">
              <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-white">
                What We Have Done
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-white">
            We deliver quality work with a strong focus on customer satisfaction and a commitment to excellence.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
        key={item.label}
        className="group flex flex-col items-center text-center"
      >
        <Icon className="size-20" strokeWidth={1} />

        <div className="my-8 flex items-center justify-center gap-3 transition-all duration-500 group-hover:gap-4">
          <span className="h-[2px] w-[50px] bg-yellow-400 transition-all duration-500 group-hover:w-[40px] group-hover:bg-red-500" />
          <span className="size-2.5 rounded-full bg-red-500 transition-colors duration-500 group-hover:bg-yellow-400" />
          <span className="h-[2px] w-[50px] bg-yellow-400 transition-all duration-500 group-hover:w-[40px] group-hover:bg-red-500" />
        </div>

        <h3 className="text-3xl font-semibold leading-none text-white">
          {item.value}
        </h3>

        <p className="mt-5 text-sm font-alt font-extrabold uppercase tracking-[1.5px] text-white">
          {item.label}
        </p>
      </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
