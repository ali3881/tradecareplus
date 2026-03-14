"use client";

import { ArrowRight, Wrench } from "lucide-react";
import { FaClipboardCheck, FaHandshake, FaLaptopHouse, FaTags } from "react-icons/fa";

const steps = [
  {
    number: "1",
    title: "Book Online",
    description:
      "Choose the service you need and send your request online in just a few quick steps.",
    icon: FaLaptopHouse,
  },
  {
    number: "2",
    title: "Confirmation",
    description:
      "Our team reviews your request, confirms the details, and schedules the right trade support.",
    icon: FaHandshake,
  },
  {
    number: "3",
    title: "Work Status",
    description:
      "We keep you updated throughout the job so you always know what is happening on site.",
    icon: Wrench,
  },
  {
    number: "4",
    title: "Completion",
    description:
      "Once the work is completed, we make sure everything is finished properly and to standard.",
    icon: FaClipboardCheck,
  },
];

function StepCircle({
  Icon,
  variant = "filled",
}: {
  Icon: React.ComponentType<any>;
  variant?: "filled" | "outline";
}) {
  const isFilled = variant === "filled";

  return (
    <div
      className={`relative flex size-32 items-center justify-center rounded-full border-[6px] border-yellow-400 ${
        isFilled ? "bg-[conic-gradient(from_180deg_at_50%_50%,white_0deg,white_90deg,#ffc527_90deg,#f4b400_360deg)]" : "bg-white"
      }`}
    >
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-transparent text-black">
        <Icon className="size-10" />
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-[1290px] px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
            <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
              <FaTags className="h-5 w-5 text-yellow-400" />
            </div>

            <h2 className="font-alt text-4xl font-extrabold uppercase leading-none tracking-tight text-black">
              How It Works
            </h2>

            <div className="absolute -bottom-3 left-1/2 w-max -translate-x-1/2 bg-white px-3">
              <span className="font-alt text-xs font-bold uppercase tracking-[2px] text-red-600">
                Simple Booking Process
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-[#7a7a7a]">
            Getting help from Trade Care Plus is straightforward. From booking to completion, we keep the process clear,
            responsive, and easy to follow.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const variant = index === 3 ? "outline" : "filled";

            return (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {!isLast ? (
                  <div className="absolute left-[calc(50%+92px)] top-[72px] hidden xl:flex items-center text-gray-500">
                    <ArrowRight className="size-6" strokeWidth={1.8} />
                  </div>
                ) : null}

                <StepCircle Icon={Icon} variant={variant} />

                <h3 className="font-alt mt-10 text-xl font-bold leading-tight text-black">
                  {step.number}. {step.title}
                </h3>

                <p className="mt-6 max-w-[280px] text-sm leading-6 text-[#7a7a7a]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
