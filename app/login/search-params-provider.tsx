'use client';

import { useSearchParams } from 'next/navigation';

export function SearchParamsProvider({ children }: { children: (callbackUrl: string) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  return <>{children(callbackUrl)}</>;
}
