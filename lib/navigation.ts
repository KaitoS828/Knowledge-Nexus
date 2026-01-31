'use client';

/**
 * Navigation utilities for Next.js migration
 * Provides compatibility layer for components using react-router-dom hooks
 */

import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * useNavigate hook replacement for react-router-dom
 * Returns a navigate function that works with Next.js App Router
 */
export function useNavigate() {
  const router = useRouter();
  
  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
  
  return navigate;
}

/**
 * useLocation hook replacement for react-router-dom
 * Returns an object with pathname, search, and hash
 */
export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
  };
}

/**
 * Re-export useParams from next/navigation
 * This is compatible with react-router-dom's useParams
 */
export { useParams } from 'next/navigation';

/**
 * Link component that mimics react-router-dom's Link
 * Use Next.js Link instead where possible
 */
export { default as Link } from 'next/link';
