'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    imageUrl?: string;
    fullName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user
}: UserAvatarProfileProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by ensuring consistent rendering
  if (!isClient) {
    return (
      <div className='flex items-center gap-2'>
        <div className={`${className} animate-pulse rounded-lg bg-gray-200`} />
        {showInfo && (
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <div className='mb-1 h-4 animate-pulse rounded bg-gray-200' />
            <div className='h-3 animate-pulse rounded bg-gray-200' />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
        <AvatarFallback className='rounded-lg'>
          {user?.fullName?.slice(0, 2)?.toUpperCase() || 'CN'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{user?.fullName || ''}</span>
          <span className='truncate text-xs'>
            {user?.emailAddresses?.[0]?.emailAddress || ''}
          </span>
        </div>
      )}
    </div>
  );
}
