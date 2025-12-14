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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Product');
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
        title: t('toast.validationError'),
        description: t('priceDialog.validation.required'),
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
          title: t('toast.success'),
          description: t('priceDialog.toast.updateSuccess')
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
          title: t('toast.success'),
          description: t('priceDialog.toast.createSuccess')
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description:
          err?.message ??
          (price
            ? t('priceDialog.toast.updateError')
            : t('priceDialog.toast.createError')),
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
            {price ? t('priceDialog.title.edit') : t('priceDialog.title.add')}
          </DialogTitle>
          <DialogDescription>
            {price
              ? t('priceDialog.description.edit')
              : t('priceDialog.description.add')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='quantity'>
              {t('priceDialog.form.quantity')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='quantity'
              type='number'
              step='0.01'
              min='0'
              placeholder={t('priceDialog.form.quantityPlaceholder')}
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='price'>
              {t('priceDialog.form.price')}{' '}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='price'
              type='number'
              step='1'
              min='0'
              placeholder={t('priceDialog.form.pricePlaceholder')}
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='unit'>{t('priceDialog.form.unit')}</Label>
            <Input
              id='unit'
              placeholder={t('priceDialog.form.unitPlaceholder')}
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
              {t('common.cancel')}
            </Button>
            <Button type='submit' disabled={loading}>
              <IconDeviceFloppy className='mr-2 h-4 w-4' />
              {loading
                ? price
                  ? t('priceDialog.form.updating')
                  : t('priceDialog.form.creating')
                : price
                  ? t('priceDialog.form.update')
                  : t('priceDialog.form.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
