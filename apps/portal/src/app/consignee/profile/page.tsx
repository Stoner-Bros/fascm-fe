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
import { IconEdit, IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function ConsigneeProfilePage() {
  const { user } = {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
      phoneNumbers: [{ phoneNumber: '+1 (555) 123-4567' }]
    }
  };
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: user?.phoneNumbers[0]?.phoneNumber || '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update profile
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses[0]?.emailAddress || '',
      phone: user?.phoneNumbers[0]?.phoneNumber || '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Profile</h2>
            <p className='text-muted-foreground'>
              Manage your account information
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className='mr-2 h-4 w-4' />
              Edit Profile
            </Button>
          )}
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your basic account information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    {isEditing ? (
                      <Input
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder='Enter first name'
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconUser className='text-muted-foreground h-4 w-4' />
                        <span>{formData.firstName || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    {isEditing ? (
                      <Input
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder='Enter last name'
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconUser className='text-muted-foreground h-4 w-4' />
                        <span>{formData.lastName || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                    <IconMail className='text-muted-foreground h-4 w-4' />
                    <span>{formData.email}</span>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id='phone'
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder='Enter phone number'
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconPhone className='text-muted-foreground h-4 w-4' />
                      <span>{formData.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>
                  Your delivery and billing address
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='address'>Street Address</Label>
                  {isEditing ? (
                    <Input
                      id='address'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder='Enter street address'
                    />
                  ) : (
                    <div className='rounded-md border p-2'>
                      {formData.address || 'Not set'}
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='city'>City</Label>
                    {isEditing ? (
                      <Input
                        id='city'
                        name='city'
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder='Enter city'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.city || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='state'>State/Province</Label>
                    {isEditing ? (
                      <Input
                        id='state'
                        name='state'
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder='Enter state'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.state || 'Not set'}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='zipCode'>ZIP Code</Label>
                    {isEditing ? (
                      <Input
                        id='zipCode'
                        name='zipCode'
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder='Enter ZIP'
                      />
                    ) : (
                      <div className='rounded-md border p-2'>
                        {formData.zipCode || 'Not set'}
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
