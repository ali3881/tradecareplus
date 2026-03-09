"use client";

import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      if (res.status === 401 || res.error === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError("An error occurred. Please try again.");
      }
      setIsSubmitting(false);
    } else {
      const session = await getSession();
      const role = (session?.user as any)?.role;
      router.push(role === "ADMIN" ? "/admin" : role === "STAFF" ? "/admin/jobs" : "/dashboard");
      router.refresh();
    }
  };

  return (
    <main className="flex-grow bg-white">
      <div className="bg-gray-900 text-white py-16 pt-20">
        <div className="font-alt max-w-[1290px] mx-auto px-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold">Login</h1>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Login</span>
          </div>
        </div>
      </div>

      <section className="bg-[#f7f7f7] py-14 md:py-20">
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
                    <Wrench className="h-6 w-6" />
                  </div>
                  <h2 className="font-alt mt-6 text-4xl leading-tight font-bold">
                    Welcome Back
                  </h2>
                  <p className="mt-5 text-white/80 max-w-md leading-relaxed">
                    Sign in to manage your dashboard, subscriptions, and account settings with the same TradeCarePlus experience.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-yellow-400 font-semibold">
                  <span>Professional Home Services</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-black/10 shadow-[0_14px_40px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10">
              <div className="mb-10 text-left">
                <div className="relative inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
                  <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
                    <Lock className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-black">
                    Sign In
                  </h2>

                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white w-max px-3">
                    <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-red-500">
                      Access Account
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                Enter your details to continue. Need an account?{" "}
                <Link href="/signup" className="font-semibold text-yellow-600 hover:text-red-600 transition-colors">
                  Create one
                </Link>
                .
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-yellow-500"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex w-full items-center justify-center rounded bg-yellow-400 px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-yellow-500 ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-yellow-600 hover:text-red-600 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
