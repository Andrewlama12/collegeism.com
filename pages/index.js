import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">AI Life Planner</h1>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
