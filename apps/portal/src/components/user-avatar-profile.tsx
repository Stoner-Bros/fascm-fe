'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/stores/auth.store';
import { useEffect, useState } from 'react';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: User;
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
        <AvatarImage
          src={user?.photo?.path || ''}
          alt={`${user?.firstName} ${user?.lastName}` || ''}
        />
        <AvatarFallback className='rounded-lg'>
          {`${user?.firstName?.slice(0, 1) || ''}${user?.lastName?.slice(0, 1) || ''}`.toUpperCase() ||
            'CN'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>
            {`${user?.firstName} ${user?.lastName}` || ''}
          </span>
          <span className='truncate text-xs'>{user?.email || ''}</span>
        </div>
      )}
    </div>
  );
}
