import { ReactNode } from 'react';

interface WarehouseLayoutProps {
  children: ReactNode;
}

export default function WarehouseLayout({ children }: WarehouseLayoutProps) {
  return <div className='flex h-full w-full flex-col'>{children}</div>;
}
