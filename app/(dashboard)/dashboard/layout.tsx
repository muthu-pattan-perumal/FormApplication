// app/(dashboard)/layout.tsx or page.tsx
import { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen " style={{width: '100%'}}>
      <main className="p-6">{children}</main>
    </div>
  );
}
