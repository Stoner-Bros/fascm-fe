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
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Product, fetchProducts } from '@/services/product.service';
import {
  createHarvestSchedule,
  createHarvestTicket,
  updateHarvestTicket,
  createHarvestDetail,
  fetchMySupplier
} from '@/features/supplier';

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
  const [supplierId, setSupplierId] = useState<string | null>(null);

  // Step 1: Harvest Schedule
  const [scheduleData, setScheduleData] = useState({
    description: '',
    harvestDate: ''
  });

  // Step 2: Harvest Details - Khởi tạo với 1 detail mặc định
  const [harvestDetails, setHarvestDetails] = useState<HarvestDetailForm[]>([
    {
      productId: '',
      quantity: 0,
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
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load products', err);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive'
        });
      });

    // Get supplier ID from supplier service
    fetchMySupplier()
      .then((supplier) => {
        if (!mounted) return;
        if (supplier && supplier.id) {
          setSupplierId(supplier.id);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to get supplier info', err);
        toast({
          title: 'Error',
          description: 'Failed to load supplier information. Please try again.',
          variant: 'destructive'
        });
      });

    return () => {
      mounted = false;
    };
  }, []); // chỉ chạy 1 lần khi mount

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addHarvestDetail = () => {
    setHarvestDetails((prev) => [
      ...prev,
      {
        productId: '',
        quantity: 0,
        unitPrice: 0,
        unit: 'kg'
      }
    ]);
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
      prev.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast({
        title: 'Error',
        description: 'Supplier ID not found. Please login again.',
        variant: 'destructive'
      });
      return;
    }

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
    }

    setLoading(true);

    try {
      // Step 1: Create Harvest Schedule
      const schedule = await createHarvestSchedule({
        description: scheduleData.description || null,
        harvestDate: new Date(scheduleData.harvestDate).toISOString(),
        supplierId: {
          id: supplierId
        }
      });

      // Step 2: ALWAYS create a new Harvest Ticket for this schedule
      const ticket = await createHarvestTicket({
        date: new Date(scheduleData.harvestDate).toISOString(),
        harvestScheduleId: {
          id: schedule.id
        }
      });

      if (!ticket?.id) {
        throw new Error('Failed to create harvest ticket');
      }

      // Step 3: Create ALL Harvest Details using this ONE ticket
      // Tính amount cho mỗi detail: quantity * unitPrice
      // Tạo tất cả details cho cùng 1 ticket
      const createdDetails = await Promise.all(
        harvestDetails.map(async (detail, index) => {
          if (!detail.productId) {
            throw new Error(
              `Missing productId in harvest detail #${index + 1}`
            );
          }

          const quantity = Number(detail.quantity) || 0;
          const unitPrice = Number(detail.unitPrice) || 0;
          const amount = quantity * unitPrice; // Tính amount = quantity * unitPrice

          const payload = {
            product: {
              id: String(detail.productId)
            },
            harvestTicket: {
              id: String(ticket.id) // Tất cả details dùng cùng 1 ticket
            },
            quantity: quantity,
            unitPrice: unitPrice,
            unit: String(detail.unit || 'kg'),
            amount: amount // Gửi amount đã tính
          };

          return createHarvestDetail(payload);
        })
      );

      // Kiểm tra tất cả details đã được tạo thành công
      if (createdDetails.length !== harvestDetails.length) {
        throw new Error(
          `Failed to create all harvest details. Expected ${harvestDetails.length}, created ${createdDetails.length}`
        );
      }

      // Step 4: Tính toán và cập nhật Harvest Ticket
      // Tính tổng quantity từ TẤT CẢ các details (unit = kg)
      const totalQuantity = harvestDetails.reduce(
        (sum, detail) => sum + (Number(detail.quantity) || 0),
        0
      );

      // Tính tổng amount từ TẤT CẢ các details (totalPayment và totalAmount)
      // totalPayment = totalAmount = tổng amount của tất cả details
      const totalAmount = harvestDetails.reduce((sum, detail) => {
        const qty = Number(detail.quantity) || 0;
        const price = Number(detail.unitPrice) || 0;
        return sum + qty * price; // Cộng tất cả amount
      }, 0);

      // Cập nhật Harvest Ticket với các giá trị đã tính từ TẤT CẢ details
      await updateHarvestTicket(ticket.id, {
        quantity: totalQuantity, // Tổng quantity từ tất cả details
        unit: 'kg', // Unit cố định là kg
        totalPayment: totalAmount, // Tổng amount từ tất cả details
        totalAmount: totalAmount // Tổng amount từ tất cả details
      });

      toast({
        title: 'Success',
        description: 'Harvest batch created successfully!'
      });
      router.push('/supplier/harvest-batches');
    } catch (error: any) {
      console.error('Failed to create harvest batch', error);
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
                  <Input
                    id='harvestDate'
                    name='harvestDate'
                    type='datetime-local'
                    value={scheduleData.harvestDate}
                    onChange={handleScheduleChange}
                    required
                  />
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
                            <Select
                              value={detail.unit}
                              onValueChange={(value) =>
                                updateHarvestDetail(index, 'unit', value)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='kg'>
                                  Kilograms (kg)
                                </SelectItem>
                                <SelectItem value='g'>Grams (g)</SelectItem>
                                <SelectItem value='lbs'>
                                  Pounds (lbs)
                                </SelectItem>
                                <SelectItem value='tons'>Tons</SelectItem>
                                <SelectItem value='pieces'>Pieces</SelectItem>
                                <SelectItem value='boxes'>Boxes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='space-y-2'>
                            <Label>
                              Quantity{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              value={detail.quantity || ''}
                              onChange={(e) =>
                                updateHarvestDetail(
                                  index,
                                  'quantity',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder='0'
                              required
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label>
                              Unit Price{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                              type='number'
                              step='0.01'
                              min='0'
                              value={detail.unitPrice || ''}
                              onChange={(e) =>
                                updateHarvestDetail(
                                  index,
                                  'unitPrice',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder='0.00'
                              required
                            />
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
