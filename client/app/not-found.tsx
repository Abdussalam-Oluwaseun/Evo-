import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-slate-600 mb-8">The page you're looking for doesn't exist.</p>
      <Link href="/" className="px-6 py-2 bg-[#135bec] text-white rounded-lg hover:bg-[#135bec]/90">
        Go Home
      </Link>
    </div>
  );
}
