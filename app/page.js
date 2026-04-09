'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    
    if (userInfo) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
} 
