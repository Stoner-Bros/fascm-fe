'use client';

import { RoleEnum } from '@/constants/enums';
import useAuth from '@/hooks/use-auth';
import { fetchMine } from '@/services/auth.service';
import React, { useEffect } from 'react';

type Props = {
  children?: React.ReactNode;
};

export default function ProfileRole({ children }: Props) {
  const { userRole, setFullInfo } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userRole && userRole !== RoleEnum.ADMIN) {
        try {
          const fullInfo = await fetchMine(userRole as RoleEnum);
          setFullInfo(fullInfo);
        } catch (error) {
          // Handle error silently or with proper error handling
        }
      }
    };

    fetchUserInfo();
  }, [userRole, setFullInfo]);

  return <>{children}</>;
}
