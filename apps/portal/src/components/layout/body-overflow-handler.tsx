'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function BodyOverflowHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldApplyOverflowHidden =
      pathname.startsWith('/consignee') || pathname.startsWith('/supplier');

    if (shouldApplyOverflowHidden) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [pathname]);

  return null;
}
