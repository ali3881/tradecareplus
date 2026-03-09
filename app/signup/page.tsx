import Signup from "@/components/Signup";
import Link from "next/link";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <main className="flex-grow">
      <div className="bg-gray-900 text-white py-16 pt-20">
        <div className="font-alt max-w-[1290px] mx-auto px-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold">Sign Up</h1>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Sign Up</span>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <Signup />
      </Suspense>
    </main>
  );
}
