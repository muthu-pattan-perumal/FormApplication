'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }); // Clear the cookie
    router.push('/sign-in'); // Redirect to login page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You do not have permission to access this page.
      </p>

      <div className="flex gap-4 items-center">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}
