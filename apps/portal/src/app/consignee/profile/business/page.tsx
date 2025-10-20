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
  IconEdit,
  IconMapPin,
  IconBuilding,
  IconFileText
} from '@tabler/icons-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function BusinessInformationPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: 'Fresh Market Supermarket',
    businessType: 'Retail Store',
    taxId: 'TAX-123456789',
    location: '456 Market Street, City Center',
    capacity: '5000',
    operatingHours: '8:00 AM - 10:00 PM',
    description:
      'A leading supermarket chain providing fresh produce and quality products to our community. We prioritize sourcing from local farmers and maintaining the highest quality standards.'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update business information
    toast({
      title: 'Business Information Updated',
      description: 'Your business information has been successfully updated.'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      businessName: 'Fresh Market Supermarket',
      businessType: 'Retail Store',
      taxId: 'TAX-123456789',
      location: '456 Market Street, City Center',
      capacity: '5000',
      operatingHours: '8:00 AM - 10:00 PM',
      description:
        'A leading supermarket chain providing fresh produce and quality products to our community. We prioritize sourcing from local farmers and maintaining the highest quality standards.'
    });
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Business Information
            </h2>
            <p className='text-muted-foreground'>
              Manage your business details and credentials
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className='mr-2 h-4 w-4' />
              Edit Information
            </Button>
          )}
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  General details about your business
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='businessName'>Business Name</Label>
                  {isEditing ? (
                    <Input
                      id='businessName'
                      name='businessName'
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder='Enter business name'
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconBuilding className='text-muted-foreground h-4 w-4' />
                      <span>{formData.businessName}</span>
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='businessType'>Business Type</Label>
                    {isEditing ? (
                      <Input
                        id='businessType'
                        name='businessType'
                        value={formData.businessType}
                        onChange={handleInputChange}
                        placeholder='Enter business type'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.businessType}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='taxId'>Tax ID</Label>
                    {isEditing ? (
                      <Input
                        id='taxId'
                        name='taxId'
                        value={formData.taxId}
                        onChange={handleInputChange}
                        placeholder='Enter tax ID'
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconFileText className='text-muted-foreground h-4 w-4' />
                        <span>{formData.taxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='location'>Business Location</Label>
                  {isEditing ? (
                    <Input
                      id='location'
                      name='location'
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder='Enter business location'
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconMapPin className='text-muted-foreground h-4 w-4' />
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Business Description</Label>
                  {isEditing ? (
                    <Textarea
                      id='description'
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder='Describe your business'
                      rows={4}
                    />
                  ) : (
                    <div className='rounded-md border p-3'>
                      {formData.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Details</CardTitle>
                <CardDescription>
                  Your business operations information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='capacity'>Storage Capacity (sq ft)</Label>
                    {isEditing ? (
                      <Input
                        id='capacity'
                        name='capacity'
                        type='number'
                        value={formData.capacity}
                        onChange={handleInputChange}
                        placeholder='Enter storage capacity'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.capacity} sq ft
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='operatingHours'>Operating Hours</Label>
                    {isEditing ? (
                      <Input
                        id='operatingHours'
                        name='operatingHours'
                        value={formData.operatingHours}
                        onChange={handleInputChange}
                        placeholder='e.g., 8:00 AM - 10:00 PM'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.operatingHours}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className='flex justify-end space-x-2'>
                <Button type='button' variant='outline' onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type='submit'>Save Changes</Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
