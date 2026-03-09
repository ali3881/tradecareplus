"use client";

import { UserPlus, User, Mail, Phone, Lock, CreditCard, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const packageIdParam = searchParams.get("packageId");
  const [packageOptions, setPackageOptions] = useState<{ id: string; title: string; price: number; currency: string; duration: string }[]>([]);
  const formatDuration = (duration: string) => duration.replace(/^1\s+/i, "");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    plan: "",
  });

  useEffect(() => {
    if (planParam) {
      setFormData((prev) => ({ ...prev, plan: planParam }));
    }
  }, [planParam]);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const res = await fetch("/api/packages", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPackageOptions(data);
          if (!planParam && data.length > 0) {
            setFormData((prev) => ({ ...prev, plan: data[0].title }));
          }
        }
      } catch (e) {
        // Keep signup usable even if packages fail to load.
      }
    };
    loadPackages();
  }, [planParam]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Signup failed");
      }

      const signInRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!signInRes?.ok) {
        throw new Error("Account created but sign-in failed. Please log in and subscribe.");
      }

      const checkoutRes = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: formData.plan, packageId: packageIdParam }),
      });

      if (!checkoutRes.ok) {
        const msg = await checkoutRes.text();
        throw new Error(msg || "Failed to start Stripe checkout");
      }

      const checkoutData = await checkoutRes.json();
      if (!checkoutData?.url) {
        throw new Error("Stripe checkout URL not returned");
      }

      window.location.href = checkoutData.url;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="signup" className="bg-[#f7f7f7] py-14 md:py-20">
      <div className="max-w-[1290px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <div className="hidden lg:flex relative overflow-hidden rounded-md bg-black text-white p-10">
            <div
              className="absolute inset-0 bg-[url('https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/intro-section-pattern.png')] bg-repeat opacity-20"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center h-11 w-11 bg-yellow-400 text-black rounded-sm">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h2 className="font-alt mt-6 text-4xl leading-tight font-bold">Create Your Account</h2>
                <p className="mt-5 text-white/80 max-w-md leading-relaxed">
                  Join TradeCarePlus to manage your services, plans, and billing in one place with a smooth and reliable experience.
                </p>
              </div>
              <div className="flex items-center gap-3 text-yellow-400 font-semibold">
                <span>Simple Plans, Trusted Service</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-black/10 shadow-[0_14px_40px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10">
            <div className="mb-10 text-left">
              <div className="relative inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
                <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
                  <UserPlus className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
                </div>

                <h2 className="text-3xl sm:text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-black">
                  Sign Up
                </h2>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white w-max px-3">
                  <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-red-500">Create Account</span>
                </div>
              </div>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Fill your details and choose a plan to continue. Already have an account?{" "}
              <Link href="/login" className="font-semibold text-yellow-600 hover:text-red-600 transition-colors">
                Sign in
              </Link>
              .
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                />
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                />
              </div>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                />
              </div>

              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded border border-gray-300 bg-white py-3 pl-11 pr-10 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                >
                  <option value="">Select a Plan</option>
                  {packageOptions.map((pkg) => (
                    <option key={pkg.id} value={pkg.title}>
                      {pkg.title} - {pkg.currency === "USD" ? "$" : `${pkg.currency} `}
                      {pkg.price}/{formatDuration(pkg.duration)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  className="w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                />
              </div>

              {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex w-full items-center justify-center rounded bg-yellow-400 px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-yellow-500 ${
                  isSubmitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-yellow-600 hover:text-red-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
