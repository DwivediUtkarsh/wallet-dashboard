'use client';

import { useEffect, useState } from 'react';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children with a neutral theme during SSR
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {children}
      </div>
    );
  }

  return <>{children}</>;
} 