'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Try to get username from localStorage
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('user_role');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedRole === 'ADMIN') {
      router.replace('/dashboard/admin');
    } else if (storedRole === 'SUPERVISOR') {
      router.replace('/dashboard/supervisor');
    } else {
      router.replace('/dashboard/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Redirecting {username ? `${username}` : 'user'} to login...
        </p>
      </div>
    </div>
  );
}
