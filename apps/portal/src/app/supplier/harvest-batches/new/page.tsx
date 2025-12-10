'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPlus,
  IconMinus
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Product, fetchProducts } from '@/services/product.service';
import { createHarvestSchedule } from '@/services/harvest-schedule.service';
import { fetchSupplier } from '@/services/supplier.service';
import type { Supplier } from '@/types/supplier';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const AddressPickerMap = dynamic(
  () => import('@/components/map/osrm-map').then((m) => m.AddressPickerMap),
  { ssr: false }
);

type HarvestDetailForm = {
  productId: string;
  quantity: number;
  unitPrice: number;
  unit: string;
};

export default function NewHarvestBatchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [harvestPosition, setHarvestPosition] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);

  // Step 1: Harvest Schedule
  const [scheduleData, setScheduleData] = useState({
    description: '',
    harvestDate: '',
    address: ''
  });

  // Step 2: Harvest Details - Khởi tạo với 1 detail mặc định
  const [harvestDetails, setHarvestDetails] = useState<HarvestDetailForm[]>([
    {
      productId: '',
      quantity: 20, // Bắt đầu từ 20 (bội số của 20)
      unitPrice: 0,
      unit: 'kg'
    }
  ]);

  useEffect(() => {
    let mounted = true;

    // Load products
    fetchProducts({ page: 1, limit: 100 })
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive'
        });
      });

    // Prefill address from supplier
    fetchSupplier()
      .then((supplier: Supplier) => {
        if (!mounted) return;
        if (supplier?.address) {
          setScheduleData((prev) => ({
            ...prev,
            address: supplier.address
          }));
        }
      })
      .catch(() => {
        if (!mounted) return;
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getDefaultQuantity = () => 20;
  const getQuantityStep = () => 20;
  const getMinQuantity = () => 20;

  const addHarvestDetail = () => {
    setHarvestDetails((prev) => [
      ...prev,
      {
        productId: '',
        quantity: getDefaultQuantity(),
        unitPrice: 0,
        unit: 'kg'
      }
    ]);
  };

  const adjustQuantity = (index: number, delta: number) => {
    setHarvestDetails((prev) =>
      prev.map((detail, i) => {
        if (i === index) {
          const step = getQuantityStep();
          const minQuantity = getMinQuantity();
          const newQuantity = detail.quantity + delta;
          // Đảm bảo quantity >= 20 và là bội số của 20
          const adjustedQuantity = Math.max(minQuantity, newQuantity);
          const roundedQuantity = Math.round(adjustedQuantity / step) * step;
          return { ...detail, quantity: roundedQuantity };
        }
        return detail;
      })
    );
  };

  const removeHarvestDetail = (index: number) => {
    setHarvestDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const updateHarvestDetail = (
    index: number,
    field: keyof HarvestDetailForm,
    value: string | number
  ) => {
    setHarvestDetails((prev) =>
      prev.map((detail, i) => {
        if (i === index) {
          return { ...detail, [field]: value };
        }
        return detail;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (harvestDetails.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one harvest detail',
        variant: 'destructive'
      });
      return;
    }

    // Validate all harvest details
    for (const detail of harvestDetails) {
      if (!detail.productId || !detail.quantity || !detail.unitPrice) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields in harvest details',
          variant: 'destructive'
        });
        return;
      }

      const minQuantity = getMinQuantity();
      const step = getQuantityStep();

      if (detail.quantity < minQuantity || detail.quantity % step !== 0) {
        toast({
          title: 'Validation Error',
          description:
            'Quantity must be at least 20 and a multiple of 20. Please use +/- buttons to adjust.',
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);

    try {
      await createHarvestSchedule({
        description: scheduleData.description || null,
        harvestDate: new Date(scheduleData.harvestDate).toISOString(),
        address: scheduleData.address || null,
        harvestTicket: {
          ticketNumber: null,
          ticketUrl: null
        },
        harvestDetails: harvestDetails.map((detail) => ({
          product: {
            id: detail.productId
          },
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          unit: detail.unit
        }))
      });

      toast({
        title: 'Success',
        description: 'Harvest batch created successfully!'
      });
      router.push('/supplier/harvest-batches');
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.message || 'Failed to create harvest batch. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/supplier/harvest-batches');
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Create New Harvest Batch
              </h2>
              <p className='text-muted-foreground'>
                Submit details of your new harvest
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6'>
            {/* Harvest Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Harvest Schedule</CardTitle>
                <CardDescription>
                  When the harvest is scheduled to take place
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='harvestDate'>
                    Harvest Date & Time{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <DateTimePicker
                    value={scheduleData.harvestDate}
                    onChange={(value) =>
                      setScheduleData((prev) => ({
                        ...prev,
                        harvestDate: value
                      }))
                    }
                    placeholder='Select harvest date and time'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='address'>
                    Harvest Address <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='address'
                    name='address'
                    value={scheduleData.address}
                    onChange={handleScheduleChange}
                    placeholder='Enter harvest address'
                  />
                </div>
                <div className='space-y-3'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowMap((v) => !v)}
                  >
                    {showMap ? 'Close map' : 'Pick location on map'}
                  </Button>
                  {showMap && (
                    <div className='rounded-lg border p-2'>
                      <AddressPickerMap
                        value={{
                          position: harvestPosition,
                          address: scheduleData.address
                        }}
                        onChange={(v) => {
                          setHarvestPosition(v.position);
                          setScheduleData((prev) => ({
                            ...prev,
                            address: v.address || prev.address
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <textarea
                    id='description'
                    name='description'
                    value={scheduleData.description}
                    onChange={handleScheduleChange}
                    placeholder='Optional description...'
                    className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Harvest Details */}
            <Card>
              <CardHeader>
                <CardTitle>Harvest Details</CardTitle>
                <CardDescription>
                  Products and quantities for this harvest
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {harvestDetails.map((detail, index) => (
                  <Card key={index} className='border-dashed'>
                    <CardContent className='pt-6'>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-medium'>Product #{index + 1}</h4>
                          {harvestDetails.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => removeHarvestDetail(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='space-y-2'>
                            <Label>
                              Product{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                              value={detail.productId}
                              onValueChange={(value) =>
                                updateHarvestDetail(index, 'productId', value)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select product' />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name || 'Unnamed Product'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <Label>
                              Unit <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                              value='kg'
                              readOnly
                              disabled
                              className='bg-muted cursor-not-allowed'
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='space-y-2'>
                            <Label>
                              Quantity{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <div className='flex items-center gap-2'>
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  adjustQuantity(index, -getQuantityStep())
                                }
                                disabled={detail.quantity <= getMinQuantity()}
                                className='h-10 w-10'
                              >
                                <IconMinus className='h-4 w-4' />
                              </Button>
                              <Input
                                type='text'
                                value={detail.quantity || getDefaultQuantity()}
                                readOnly
                                className='text-center'
                                required
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  adjustQuantity(index, getQuantityStep())
                                }
                                className='h-10 w-10'
                              >
                                <IconPlus className='h-4 w-4' />
                              </Button>
                            </div>
                            <p className='text-muted-foreground text-xs'>
                              Minimum 20, must be a multiple of 20. Use +/-
                              buttons to adjust.
                            </p>
                          </div>

                          <div className='space-y-2'>
                            <Label>
                              Unit Price{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <div className='relative'>
                              <Input
                                type='text'
                                inputMode='numeric'
                                value={detail.unitPrice || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Chỉ cho phép số
                                  if (value === '' || /^\d+$/.test(value)) {
                                    updateHarvestDetail(
                                      index,
                                      'unitPrice',
                                      value === '' ? 0 : parseInt(value) || 0
                                    );
                                  }
                                }}
                                onWheel={(e) => {
                                  // Prevent scroll wheel from changing value
                                  e.currentTarget.blur();
                                }}
                                placeholder='0'
                                required
                                className='pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                              />
                              <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                                VND
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type='button'
                  variant='outline'
                  onClick={addHarvestDetail}
                  className='w-full'
                >
                  + Add Product
                </Button>
              </CardContent>
            </Card>

            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                <IconDeviceFloppy className='mr-2 h-4 w-4' />
                {loading ? 'Creating...' : 'Create Batch'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
