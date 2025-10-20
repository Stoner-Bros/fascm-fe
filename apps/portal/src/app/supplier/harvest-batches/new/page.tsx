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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function NewHarvestBatchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    unit: 'kg',
    harvestDate: '',
    expectedPickupDate: '',
    location: '',
    pricePerUnit: '',
    quality: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create harvest batch
    toast({
      title: 'Harvest Batch Created',
      description: 'Your harvest batch has been successfully created.'
    });
    router.push('/supplier/harvest-batches');
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
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Details about the harvested product
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='product'>
                      Product Name <span className='text-destructive'>*</span>
                    </Label>
                    <Select
                      value={formData.product}
                      onValueChange={(value) =>
                        handleSelectChange('product', value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select product' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Tomatoes'>Tomatoes</SelectItem>
                        <SelectItem value='Carrots'>Carrots</SelectItem>
                        <SelectItem value='Lettuce'>Lettuce</SelectItem>
                        <SelectItem value='Cucumbers'>Cucumbers</SelectItem>
                        <SelectItem value='Bell Peppers'>
                          Bell Peppers
                        </SelectItem>
                        <SelectItem value='Onions'>Onions</SelectItem>
                        <SelectItem value='Potatoes'>Potatoes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='quality'>
                      Quality Grade <span className='text-destructive'>*</span>
                    </Label>
                    <Select
                      value={formData.quality}
                      onValueChange={(value) =>
                        handleSelectChange('quality', value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select quality' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Premium'>Premium</SelectItem>
                        <SelectItem value='Grade A'>Grade A</SelectItem>
                        <SelectItem value='Grade B'>Grade B</SelectItem>
                        <SelectItem value='Standard'>Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>
                      Quantity <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='quantity'
                      name='quantity'
                      type='number'
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder='Enter quantity'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='unit'>
                      Unit <span className='text-destructive'>*</span>
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        handleSelectChange('unit', value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='kg'>Kilograms (kg)</SelectItem>
                        <SelectItem value='lbs'>Pounds (lbs)</SelectItem>
                        <SelectItem value='tons'>Tons</SelectItem>
                        <SelectItem value='pieces'>Pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pricePerUnit'>
                      Price per Unit ($){' '}
                      <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='pricePerUnit'
                      name='pricePerUnit'
                      type='number'
                      step='0.01'
                      value={formData.pricePerUnit}
                      onChange={handleInputChange}
                      placeholder='0.00'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>Additional Notes</Label>
                  <Textarea
                    id='notes'
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder='Any special handling instructions or additional information...'
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harvest Details</CardTitle>
                <CardDescription>
                  When and where the harvest took place
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='harvestDate'>
                      Harvest Date <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='harvestDate'
                      name='harvestDate'
                      type='date'
                      value={formData.harvestDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='expectedPickupDate'>
                      Expected Pickup Date{' '}
                      <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='expectedPickupDate'
                      name='expectedPickupDate'
                      type='date'
                      value={formData.expectedPickupDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='location'>
                    Storage Location <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleSelectChange('location', value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select storage location' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Warehouse A'>Warehouse A</SelectItem>
                      <SelectItem value='Warehouse B'>Warehouse B</SelectItem>
                      <SelectItem value='Warehouse C'>Warehouse C</SelectItem>
                      <SelectItem value='Cold Storage 1'>
                        Cold Storage 1
                      </SelectItem>
                      <SelectItem value='Cold Storage 2'>
                        Cold Storage 2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className='flex justify-end space-x-2'>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button type='submit'>
                <IconDeviceFloppy className='mr-2 h-4 w-4' />
                Create Batch
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
