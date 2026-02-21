import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center py-20 bg-gray-50">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Not Found</h2>
      <p className="text-gray-600 mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
