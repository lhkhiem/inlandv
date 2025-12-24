'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl font-bold text-foreground mt-4 mb-2">
            Trang không tìm thấy
          </h2>
          <p className="text-muted-foreground">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="h-4 w-4" />
            Về Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-input bg-background hover:bg-accent transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}





