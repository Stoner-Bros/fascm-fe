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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OrderItem {
  id: string;
  product: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: '1', product: '', quantity: '', unit: 'kg', pricePerUnit: '' }
  ]);
  const [formData, setFormData] = useState({
    supplier: '',
    deliveryDate: '',
    deliveryAddress: '',
    notes: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (id: string, field: string, value: string) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addOrderItem = () => {
    const newId = (orderItems.length + 1).toString();
    setOrderItems((prev) => [
      ...prev,
      { id: newId, product: '', quantity: '', unit: 'kg', pricePerUnit: '' }
    ]);
  };

  const removeOrderItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const calculateTotal = () => {
    return orderItems
      .reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.pricePerUnit) || 0;
        return sum + qty * price;
      }, 0)
      .toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create order
    toast({
      title: 'Order Created',
      description: 'Your order has been successfully created.'
    });
    router.push('/consignee/orders');
  };

  const handleCancel = () => {
    router.push('/consignee/orders');
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
                Create New Order
              </h2>
              <p className='text-muted-foreground'>
                Submit your order for agricultural products
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
                <CardDescription>Basic details of your order</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='supplier'>
                    Supplier <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) =>
                      handleSelectChange('supplier', value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select supplier' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Green Valley Farm'>
                        Green Valley Farm
                      </SelectItem>
                      <SelectItem value='Sunny Fields'>Sunny Fields</SelectItem>
                      <SelectItem value='Fresh Greens Co'>
                        Fresh Greens Co
                      </SelectItem>
                      <SelectItem value='Rainbow Farms'>
                        Rainbow Farms
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='deliveryDate'>
                    Expected Delivery Date{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='deliveryDate'
                    name='deliveryDate'
                    type='date'
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='deliveryAddress'>
                    Delivery Address <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='deliveryAddress'
                    name='deliveryAddress'
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    placeholder='Enter delivery address'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>Additional Notes</Label>
                  <Textarea
                    id='notes'
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder='Any special instructions or requirements...'
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>
                      Products and quantities you want to order
                    </CardDescription>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addOrderItem}
                  >
                    <IconPlus className='mr-2 h-4 w-4' />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {orderItems.map((item, index) => (
                  <Card key={item.id} className='border-2'>
                    <CardContent className='pt-6'>
                      <div className='flex items-start gap-4'>
                        <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-4'>
                          <div className='space-y-2'>
                            <Label>Product *</Label>
                            <Select
                              value={item.product}
                              onValueChange={(value) =>
                                handleItemChange(item.id, 'product', value)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Organic Tomatoes'>
                                  Organic Tomatoes
                                </SelectItem>
                                <SelectItem value='Fresh Carrots'>
                                  Fresh Carrots
                                </SelectItem>
                                <SelectItem value='Green Lettuce'>
                                  Green Lettuce
                                </SelectItem>
                                <SelectItem value='Cucumbers'>
                                  Cucumbers
                                </SelectItem>
                                <SelectItem value='Bell Peppers'>
                                  Bell Peppers
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <Label>Quantity *</Label>
                            <Input
                              type='number'
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  'quantity',
                                  e.target.value
                                )
                              }
                              placeholder='0'
                              required
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label>Unit *</Label>
                            <Select
                              value={item.unit}
                              onValueChange={(value) =>
                                handleItemChange(item.id, 'unit', value)
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='kg'>kg</SelectItem>
                                <SelectItem value='lbs'>lbs</SelectItem>
                                <SelectItem value='tons'>tons</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-2'>
                            <Label>Price/Unit ($) *</Label>
                            <Input
                              type='number'
                              step='0.01'
                              value={item.pricePerUnit}
                              onChange={(e) =>
                                handleItemChange(
                                  item.id,
                                  'pricePerUnit',
                                  e.target.value
                                )
                              }
                              placeholder='0.00'
                              required
                            />
                          </div>
                        </div>

                        {orderItems.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removeOrderItem(item.id)}
                            className='mt-8'
                          >
                            <IconTrash className='text-destructive h-4 w-4' />
                          </Button>
                        )}
                      </div>

                      {item.quantity && item.pricePerUnit && (
                        <div className='mt-4 text-right'>
                          <p className='text-muted-foreground text-sm'>
                            Subtotal: $
                            {(
                              parseFloat(item.quantity) *
                              parseFloat(item.pricePerUnit)
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Separator />

                <div className='flex justify-end'>
                  <div className='text-right'>
                    <p className='text-muted-foreground text-sm'>
                      Total Amount
                    </p>
                    <p className='text-primary text-2xl font-bold'>
                      ${calculateTotal()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button type='submit'>
                <IconDeviceFloppy className='mr-2 h-4 w-4' />
                Create Order
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
