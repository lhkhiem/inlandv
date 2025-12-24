'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PropertiesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to real-estate page
    router.replace('/dashboard/real-estate');
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <p className="text-muted-foreground">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}



