'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  createPrice,
  updatePrice,
  type CreatePriceDto,
  type UpdatePriceDto,
  type Price
} from '@/services/price.service';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';

interface PriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  price?: Price;
  onSuccess?: () => void;
}

export function PriceDialog({
  open,
  onOpenChange,
  productId,
  price,
  onSuccess
}: PriceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: price?.price?.toString() || '',
    quantity: price?.quantity?.toString() || '',
    unit: price?.unit || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.price || !formData.quantity) {
      toast({
        title: 'Validation Error',
        description: 'Price and quantity are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      if (price) {
        const data: UpdatePriceDto = {
          product: { id: productId },
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity),
          unit: formData.unit || null
        };
        await updatePrice(price.id, data);
        toast({
          title: 'Success',
          description: 'Price tier updated successfully'
        });
      } else {
        const data: CreatePriceDto = {
          product: { id: productId },
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity),
          unit: formData.unit || null
        };
        await createPrice(data);
        toast({
          title: 'Success',
          description: 'Price tier created successfully'
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: 'Error',
        description:
          err?.message ?? `Failed to ${price ? 'update' : 'create'} price tier`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {price ? 'Edit Price Tier' : 'Add Price Tier'}
          </DialogTitle>
          <DialogDescription>
            {price
              ? 'Update the price tier details'
              : 'Add a new price tier for this product'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='quantity'>
              Quantity <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='quantity'
              type='number'
              step='0.01'
              min='0'
              placeholder='e.g., 100'
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='price'>
              Price (VND) <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='price'
              type='number'
              step='1'
              min='0'
              placeholder='e.g., 25000'
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='unit'>Unit</Label>
            <Input
              id='unit'
              placeholder='e.g., kg, lb, box'
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              <IconDeviceFloppy className='mr-2 h-4 w-4' />
              {loading
                ? price
                  ? 'Updating...'
                  : 'Creating...'
                : price
                  ? 'Update Price'
                  : 'Add Price'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
