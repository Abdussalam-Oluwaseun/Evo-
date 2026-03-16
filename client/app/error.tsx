'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Something Went Wrong</h1>
      <p className="text-slate-600 mb-8">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#135bec]/90"
      >
        Try Again
      </button>
    </div>
  );
}
