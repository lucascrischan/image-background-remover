"use client";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">An error occurred during sign in. Please try again.</p>
        <a
          href="/auth/signin"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </a>
        <p className="mt-4">
          <a href="/" className="text-blue-600 hover:underline">← Back to home</a>
        </p>
      </div>
    </div>
  );
}
