'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { InventoryItem } from '.';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';

interface CellActionProps {
  data: InventoryItem;
}

export function CellAction({ data }: CellActionProps) {
  const { toast } = useToast();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: 'Copied',
      description: `Copied item ID: ${id}`
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onCopy(data.id)}>
          <Copy className='mr-2 h-4 w-4' /> Copy ID
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // Handle edit action
            toast({
              title: 'Edit Item',
              description: `Editing item: ${data.name}`
            });
          }}
        >
          <Edit className='mr-2 h-4 w-4' /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // Handle delete action
            toast({
              title: 'Delete Item',
              description: `Deleting item: ${data.name}`,
              variant: 'destructive'
            });
          }}
        >
          <Trash className='mr-2 h-4 w-4' /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
