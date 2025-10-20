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
  IconPlant,
  IconFileText
} from '@tabler/icons-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function FarmInformationPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    farmName: 'Green Valley Farm',
    farmSize: '50',
    location: '123 Farm Road, Rural Area',
    certifications: 'Organic Certified, GAP Certified',
    products: 'Tomatoes, Carrots, Lettuce, Cucumbers',
    description:
      'Family-owned organic farm specializing in fresh vegetables. We follow sustainable farming practices and are committed to producing high-quality, chemical-free produce.'
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
    // TODO: Implement API call to update farm information
    toast({
      title: 'Farm Information Updated',
      description: 'Your farm information has been successfully updated.'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      farmName: 'Green Valley Farm',
      farmSize: '50',
      location: '123 Farm Road, Rural Area',
      certifications: 'Organic Certified, GAP Certified',
      products: 'Tomatoes, Carrots, Lettuce, Cucumbers',
      description:
        'Family-owned organic farm specializing in fresh vegetables. We follow sustainable farming practices and are committed to producing high-quality, chemical-free produce.'
    });
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Farm Information
            </h2>
            <p className='text-muted-foreground'>
              Manage your farm details and certifications
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
                  General details about your farm
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='farmName'>Farm Name</Label>
                  {isEditing ? (
                    <Input
                      id='farmName'
                      name='farmName'
                      value={formData.farmName}
                      onChange={handleInputChange}
                      placeholder='Enter farm name'
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconPlant className='text-muted-foreground h-4 w-4' />
                      <span>{formData.farmName}</span>
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='farmSize'>Farm Size (acres)</Label>
                    {isEditing ? (
                      <Input
                        id='farmSize'
                        name='farmSize'
                        type='number'
                        value={formData.farmSize}
                        onChange={handleInputChange}
                        placeholder='Enter farm size'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.farmSize} acres
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    {isEditing ? (
                      <Input
                        id='location'
                        name='location'
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder='Enter farm location'
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconMapPin className='text-muted-foreground h-4 w-4' />
                        <span>{formData.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Farm Description</Label>
                  {isEditing ? (
                    <Textarea
                      id='description'
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder='Describe your farm'
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
                <CardTitle>Products & Certifications</CardTitle>
                <CardDescription>
                  What you grow and your certifications
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='products'>Products Grown</Label>
                  {isEditing ? (
                    <Input
                      id='products'
                      name='products'
                      value={formData.products}
                      onChange={handleInputChange}
                      placeholder='e.g., Tomatoes, Carrots, Lettuce'
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconPlant className='text-muted-foreground h-4 w-4' />
                      <span>{formData.products}</span>
                    </div>
                  )}
                  <p className='text-muted-foreground text-xs'>
                    Separate multiple products with commas
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='certifications'>Certifications</Label>
                  {isEditing ? (
                    <Input
                      id='certifications'
                      name='certifications'
                      value={formData.certifications}
                      onChange={handleInputChange}
                      placeholder='e.g., Organic Certified, GAP Certified'
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconFileText className='text-muted-foreground h-4 w-4' />
                      <span>{formData.certifications}</span>
                    </div>
                  )}
                  <p className='text-muted-foreground text-xs'>
                    Separate multiple certifications with commas
                  </p>
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
