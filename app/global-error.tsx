"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong!</h2>
          <div className="bg-white p-6 rounded shadow-md max-w-lg w-full">
            <p className="mb-4 text-gray-700 font-mono text-sm break-words">
              {error.message || "Unknown error occurred"}
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 mb-4">
                {error.stack}
              </pre>
            )}
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
