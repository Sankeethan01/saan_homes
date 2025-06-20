"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg">Redirecting to login...</p>
            </div>
        </div>
    );
}
