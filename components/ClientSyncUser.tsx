'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientSyncUser() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
 console.log('sync-user responses', router, user, isSignedIn);
  useEffect(() => {
    if (!isSignedIn || !user) return;

    fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('sync-user response', data);
        if (data?.redirect) {
          router.push(data.redirect); // ⬅️ client-side redirect
        }
      });
  }, [isSignedIn, user, router]);

  return null;
}
