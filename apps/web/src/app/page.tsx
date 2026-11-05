'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export default function RootPage() {
  const router = useRouter();
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    initAuth().then(() => {
      const token = localStorage.getItem('devblueprint_token');
      if (token) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    });
  }, [initAuth, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-400 text-xs">
      Loading DevBlueprint Platform...
    </div>
  );
}

