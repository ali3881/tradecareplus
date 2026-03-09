"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, List, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type PackageItem = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  isMostPopular: boolean;
};

type PricingProps = {
  mode?: "home" | "packages";
  showHeader?: boolean;
};

export default function Pricing({ mode = "home", showHeader = true }: PricingProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetch("/api/packages", { cache: "no-store" });
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSubscribe = async (pkg: PackageItem) => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push(`/signup?plan=${encodeURIComponent(pkg.title)}&packageId=${encodeURIComponent(pkg.id)}`);
      return;
    }

    setLoadingPlan(pkg.id);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, plan: pkg.title }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (error: any) {
      alert(error.message || "Failed to start checkout");
      setLoadingPlan(null);
    }
  };

  return (
    <section className="bg-black py-16 md:py-20">
      <div className="max-w-[1290px] mx-auto px-6">
        {showHeader ? (
          <div className="mx-auto mb-14 max-w-[760px] text-center">
            <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
              <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-black">
                <List className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
              </div>
              <h2 className="text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-white">
                Our Pricing
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black w-max px-3">
                <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-white">
                  WHAT DO WE COST
                </span>
              </div>
            </div>
            <p className="mx-auto mt-10 text-sm leading-6 text-white">
              Simple and transparent pricing with flexible plans to fit your needs. No hidden fees,<br />
              just reliable service at a fair cost.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="text-center text-gray-300">Loading packages...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="group relative overflow-hidden rounded-[4px] bg-white h-full">
                <div className="relative font-alt flex h-full min-h-[620px] flex-col px-6 pt-10 text-center">
                  <div className="relative z-10 flex flex-col">
                    <div className="leading-none text-black">
                      <span className="relative -top-6 text-[26px] font-bold">
                        {plan.currency.toUpperCase() === "USD" ? "$" : `${plan.currency.toUpperCase()} `}
                      </span>
                      <span className="text-[84px] font-extrabold">{plan.price}</span>
                    </div>
                    {mode === "home" ? (
                      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-black/70">/ {plan.duration}</p>
                    ) : null}

                    <h3 className="mx-auto mt-3 text-3xl font-bold leading-[1.25] text-black">{plan.title}</h3>

                    <ul className="mx-auto mt-5 w-full max-w-[280px] text-left text-[13px] leading-6 text-black/70">
                      {plan.features.map((feature, idx) => (
                        <li key={`${plan.id}-${idx}`} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlan === plan.id}
                      className="mx-auto mt-6 rounded bg-yellow-400 px-6 py-2 shadow-lg text-sm font-medium text-black transition-colors duration-300 hover:bg-yellow-500 disabled:opacity-70"
                    >
                      {loadingPlan === plan.id ? "Redirecting..." : "Subscribe"}
                    </button>
                  </div>

                  <div className="relative mt-auto -mx-6">
                    <div className="animate-wave-strip relative flex h-[190px] items-center justify-center rounded-br-[5px] rounded-bl-[5px] bg-[#f4be1f] bg-[url('https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/wave.png')] bg-repeat-x bg-top transition-colors duration-300 group-hover:bg-red-500">
                      <span className="relative z-10 text-[20px] font-semibold text-black transition-colors duration-300 group-hover:text-white">
                        *Conditions Apply
                      </span>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-[12px] z-20 border-2 border-dashed border-black" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-wave-strip {
          background-position: top center;
          background-repeat: repeat-x;
          background-size: contain;
          animation: waveStripMove 1s linear infinite;
          will-change: background-position;
        }

        @keyframes waveStripMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 358.66px 0;
          }
        }
      `}</style>
    </section>
  );
}
