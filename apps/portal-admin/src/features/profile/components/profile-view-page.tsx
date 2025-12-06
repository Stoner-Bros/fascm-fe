'use client';

import { FileUploader } from '@/components/file-uploader';
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
import { useToast } from '@/components/ui/use-toast';
import { RoleEnum } from '@/constants/enums';
import { useAuth } from '@/hooks/use-auth';
import { updateDeliveryStaff } from '@/services/delivery-staff.service';
import { uploadFile } from '@/services/file.service';
import { updateManager } from '@/services/manager.service';
import { updateStaff } from '@/services/staff.service';
import type { DeliveryStaff } from '@/types/delivery-staff';
import { FileType } from '@/types/file';
import type { Manager } from '@/types/manager';
import type { Staff } from '@/types/staff';
import {
  IconBuilding,
  IconCheck,
  IconEdit,
  IconFileText,
  IconId,
  IconMail,
  IconMapPin,
  IconShield,
  IconUser,
  IconX
} from '@tabler/icons-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ProfileViewPage() {
  const { user, fullInfo, userRole, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPhotoFiles, setUserPhotoFiles] = useState<File[]>([]);
  const [licensePhotoFiles, setLicensePhotoFiles] = useState<File[]>([]);

  // Type cast based on role
  const roleBasedInfo = (() => {
    switch (userRole) {
      case RoleEnum.MANAGER:
        return fullInfo as Manager;
      case RoleEnum.STAFF:
        return fullInfo as Staff;
      case RoleEnum.DELIVERY_STAFF:
        return fullInfo as DeliveryStaff;
      default:
        return null;
    }
  })();

  // Dynamic form data type based on role
  type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    [key: string]: any; // Allow dynamic properties
  };

  const [formData, setFormData] = useState<FormData>(() => {
    const baseData: FormData = {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      oldPassword: '',
      password: ''
    };

    if (!roleBasedInfo) return baseData;

    switch (userRole) {
      case RoleEnum.MANAGER:
        const manager = roleBasedInfo as Manager;
        return {
          ...baseData,
          warehouseName: manager?.warehouse?.name || '',
          warehouseAddress: manager?.warehouse?.address || ''
        };
      case RoleEnum.STAFF:
        const staff = roleBasedInfo as Staff;
        return {
          ...baseData,
          position: staff?.position || '',
          warehouseName: staff?.warehouse?.name || '',
          warehouseAddress: staff?.warehouse?.address || ''
        };
      case RoleEnum.DELIVERY_STAFF:
        const deliveryStaff = roleBasedInfo as DeliveryStaff;
        return {
          ...baseData,
          licenseNumber: deliveryStaff?.licenseNumber || '',
          licenseExpiredAt: deliveryStaff?.licenseExpiredAt || '',
          licensePhoto: deliveryStaff?.licensePhoto || '',
          truckLicensePlate: deliveryStaff?.truck?.licensePlate || '',
          truckCapacity: deliveryStaff?.truck?.capacity?.toString() || '',
          warehouseName: deliveryStaff?.warehouse?.name || '',
          warehouseAddress: deliveryStaff?.warehouse?.address || ''
        };
      default:
        return baseData;
    }
  });

  useEffect(() => {
    if (user) {
      const baseData: FormData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        oldPassword: '',
        password: ''
      };

      let updatedFormData: FormData = baseData;

      switch (userRole) {
        case RoleEnum.MANAGER:
          const manager = roleBasedInfo as Manager;
          updatedFormData = {
            ...baseData,
            warehouseName: manager?.warehouse?.name || '',
            warehouseAddress: manager?.warehouse?.address || ''
          };
          break;
        case RoleEnum.STAFF:
          const staff = roleBasedInfo as Staff;
          updatedFormData = {
            ...baseData,
            position: staff?.position || '',
            warehouseName: staff?.warehouse?.name || '',
            warehouseAddress: staff?.warehouse?.address || ''
          };
          break;
        case RoleEnum.DELIVERY_STAFF:
          const deliveryStaff = roleBasedInfo as DeliveryStaff;
          updatedFormData = {
            ...baseData,
            licenseNumber: deliveryStaff?.licenseNumber || '',
            licenseExpiredAt: deliveryStaff?.licenseExpiredAt || '',
            licensePhoto: deliveryStaff?.licensePhoto || '',
            truckLicensePlate: deliveryStaff?.truck?.licensePlate || '',
            truckCapacity: deliveryStaff?.truck?.capacity?.toString() || '',
            warehouseName: deliveryStaff?.warehouse?.name || '',
            warehouseAddress: deliveryStaff?.warehouse?.address || ''
          };
          break;
      }

      setFormData(updatedFormData);
    }
  }, [user, roleBasedInfo, userRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (
    files: File[],
    type: 'certificate' | 'qrCode' | 'userPhoto' | 'licensePhoto'
  ): Promise<FileType | null> => {
    if (files.length === 0) return null;

    try {
      const uploadedFile = await uploadFile(files[0]);
      return uploadedFile || null;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'File Upload Failed',
        description: `Failed to upload ${type} file. Please try again.`
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleBasedInfo?.id && userRole !== RoleEnum.ADMIN) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Profile information not found.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files if any
      const [userPhotoUrl, licensePhotoUrl] = await Promise.all([
        handleFileUpload(userPhotoFiles, 'userPhoto'),
        handleFileUpload(licensePhotoFiles, 'licensePhoto')
      ]);

      // Prepare update payload - only include password if both are provided
      const updatePayload: {
        firstName: string;
        lastName: string;
        oldPassword?: string;
        password?: string;
        photo?: { id: string; path: string };
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      // Only include password fields if both are provided and not empty
      if (
        formData.oldPassword &&
        formData.oldPassword.trim() !== '' &&
        formData.password &&
        formData.password.trim() !== ''
      ) {
        updatePayload.oldPassword = formData.oldPassword;
        updatePayload.password = formData.password;
      }

      // Include photo if uploaded
      if (userPhotoUrl) {
        updatePayload.photo = {
          id: userPhotoUrl.id,
          path: userPhotoUrl.path
        };
      }

      // Update user profile
      await updateProfile(updatePayload);

      // Update role-specific information
      switch (userRole) {
        case RoleEnum.MANAGER:
          const manager = roleBasedInfo as Manager;
          await updateManager(manager.id, {
            warehouse: manager.warehouse ? { id: manager.warehouse.id } : null,
            user: { id: String(user?.id) }
          });
          break;

        case RoleEnum.STAFF:
          const staff = roleBasedInfo as Staff;
          await updateStaff(staff.id, {
            position: formData.position,
            warehouse: staff.warehouse ? { id: staff.warehouse.id } : null,
            user: { id: String(user?.id) }
          });
          break;

        case RoleEnum.DELIVERY_STAFF:
          const deliveryStaff = roleBasedInfo as DeliveryStaff;
          await updateDeliveryStaff(deliveryStaff.id, {
            licenseNumber: formData.licenseNumber,
            licenseExpiredAt: formData.licenseExpiredAt,
            licensePhoto: licensePhotoUrl?.path || formData.licensePhoto,
            truck: deliveryStaff.truck ? { id: deliveryStaff.truck.id } : null,
            warehouse: deliveryStaff.warehouse
              ? { id: deliveryStaff.warehouse.id }
              : null,
            user: { id: String(user?.id) }
          });
          break;
      }

      // Clear file states
      setUserPhotoFiles([]);
      setLicensePhotoFiles([]);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.'
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUserPhotoFiles([]);
    setLicensePhotoFiles([]);

    // Reset form data based on current role
    if (user && roleBasedInfo) {
      const baseData: FormData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        oldPassword: '',
        password: ''
      };

      let resetFormData: FormData = baseData;

      switch (userRole) {
        case RoleEnum.MANAGER:
          const manager = roleBasedInfo as Manager;
          resetFormData = {
            ...baseData,
            warehouseName: manager?.warehouse?.name || '',
            warehouseAddress: manager?.warehouse?.address || ''
          };
          break;
        case RoleEnum.STAFF:
          const staff = roleBasedInfo as Staff;
          resetFormData = {
            ...baseData,
            position: staff?.position || '',
            warehouseName: staff?.warehouse?.name || '',
            warehouseAddress: staff?.warehouse?.address || ''
          };
          break;
        case RoleEnum.DELIVERY_STAFF:
          const deliveryStaff = roleBasedInfo as DeliveryStaff;
          resetFormData = {
            ...baseData,
            licenseNumber: deliveryStaff?.licenseNumber || '',
            licenseExpiredAt: deliveryStaff?.licenseExpiredAt || '',
            licensePhoto: deliveryStaff?.licensePhoto || '',
            truckLicensePlate: deliveryStaff?.truck?.licensePlate || '',
            truckCapacity: deliveryStaff?.truck?.capacity?.toString() || '',
            warehouseName: deliveryStaff?.warehouse?.name || '',
            warehouseAddress: deliveryStaff?.warehouse?.address || ''
          };
          break;
      }

      setFormData(resetFormData);
    }
  };

  // Helper function to render role-specific fields
  const renderRoleSpecificFields = () => {
    switch (userRole) {
      case RoleEnum.STAFF:
        return (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <IconUser className='h-5 w-5' />
                <span>Staff Information</span>
              </CardTitle>
              <CardDescription>Your position and work details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='position'
                  className='flex items-center space-x-1'
                >
                  <IconShield className='h-4 w-4' />
                  <span>Position</span>
                </Label>
                {isEditing ? (
                  <Input
                    id='position'
                    name='position'
                    value={formData.position || ''}
                    onChange={handleInputChange}
                    placeholder='Enter your position'
                    className='h-[42px] !text-base'
                  />
                ) : (
                  <div className='flex items-center space-x-2 rounded-md border p-2'>
                    <IconShield className='text-muted-foreground h-4 w-4' />
                    <span>{formData.position || 'Not set'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case RoleEnum.DELIVERY_STAFF:
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <IconFileText className='h-5 w-5' />
                  <span>License Information</span>
                </CardTitle>
                <CardDescription>Your driving license details</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='licenseNumber'
                      className='flex items-center space-x-1'
                    >
                      <IconId className='h-4 w-4' />
                      <span>License Number</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id='licenseNumber'
                        name='licenseNumber'
                        value={formData.licenseNumber || ''}
                        onChange={handleInputChange}
                        placeholder='Enter license number'
                        className='h-[42px] !text-base'
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconId className='text-muted-foreground h-4 w-4' />
                        <span>{formData.licenseNumber || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='licenseExpiredAt'
                      className='flex items-center space-x-1'
                    >
                      <IconFileText className='h-4 w-4' />
                      <span>License Expiry Date</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id='licenseExpiredAt'
                        name='licenseExpiredAt'
                        type='date'
                        value={formData.licenseExpiredAt || ''}
                        onChange={handleInputChange}
                        className='h-[42px] !text-base'
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconFileText className='text-muted-foreground h-4 w-4' />
                        <span>{formData.licenseExpiredAt || 'Not set'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* License Photo Upload */}
                <div className='space-y-2'>
                  <Label className='flex items-center space-x-1'>
                    <IconFileText className='h-4 w-4' />
                    <span>License Photo</span>
                  </Label>
                  {formData.licensePhoto && (
                    <div className='mb-4'>
                      <Image
                        src={formData.licensePhoto}
                        alt='License'
                        width={200}
                        height={120}
                        className='rounded-lg border'
                      />
                    </div>
                  )}
                  {isEditing && (
                    <FileUploader
                      value={licensePhotoFiles}
                      onValueChange={setLicensePhotoFiles}
                      accept={{
                        'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                      }}
                      maxSize={5 * 1024 * 1024}
                      maxFiles={1}
                      className='w-full'
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Truck Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <IconBuilding className='h-5 w-5' />
                  <span>Truck Information</span>
                </CardTitle>
                <CardDescription>Assigned truck details</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label className='flex items-center space-x-1'>
                      <IconId className='h-4 w-4' />
                      <span>Truck License Plate</span>
                    </Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconId className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.truckLicensePlate || 'Not assigned'}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label className='flex items-center space-x-1'>
                      <IconShield className='h-4 w-4' />
                      <span>Truck Capacity</span>
                    </Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconShield className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.truckCapacity
                          ? `${formData.truckCapacity} kg`
                          : 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        );

      // case RoleEnum.MANAGER:
      //   return (
      //     <Card>
      //       <CardHeader>
      //         <CardTitle className='flex items-center space-x-2'>
      //           <IconShield className='h-5 w-5' />
      //           <span>Management Information</span>
      //         </CardTitle>
      //         <CardDescription>Your management role details</CardDescription>
      //       </CardHeader>
      //       <CardContent className='space-y-4'>
      //         <div className='py-4 text-center'>
      //           <IconShield className='mx-auto mb-2 h-12 w-12 text-blue-500' />
      //           <p className='text-muted-foreground text-sm'>
      //             Management role information is maintained by system
      //             administrators.
      //           </p>
      //         </div>
      //       </CardContent>
      //     </Card>
      //   );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Profile</h2>
            <p className='text-muted-foreground'>
              Manage your account information and profile details
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className='mr-2 h-4 w-4' />
              Edit Profile
            </Button>
          )}
          {isEditing && (
            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <IconX className='mr-2 h-4 w-4' />
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className='mr-2 h-4 w-4' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <form onSubmit={handleSubmit}>
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your basic account information and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Profile Picture & QR Code Section */}
                <div className='flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-4'>
                  {/* Avatar Section */}
                  <div className='flex basis-1/2 items-center justify-start space-x-4'>
                    <div className='relative'>
                      {user?.photo?.path ? (
                        <Image
                          priority={true}
                          src={user.photo.path}
                          alt='Profile Picture'
                          width={200}
                          height={200}
                          className='aspect-square rounded-full border-4 border-gray-200 object-cover object-center'
                        />
                      ) : (
                        <div className='flex h-[200px] w-[200px] items-center justify-center rounded-full border-4 border-gray-200 bg-gray-100'>
                          <IconUser className='h-12 w-12 text-gray-400' />
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className='space-y-2'>
                        <FileUploader
                          value={userPhotoFiles}
                          onValueChange={setUserPhotoFiles}
                          accept={{
                            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                          }}
                          maxSize={5 * 1024 * 1024} // 5MB
                          maxFiles={1}
                          className='h-[200px]'
                        />
                      </div>
                    )}
                  </div>
                </div>
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
                        className='h-[42px] !text-base'
                        required
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
                        className='h-[42px] !text-base'
                        required
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
                {isEditing && (
                  <div className='space-y-2'>
                    <Label htmlFor='oldPassword'>Old Password</Label>
                    <Input
                      id='oldPassword'
                      name='oldPassword'
                      type='password'
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      placeholder='Enter old password (optional)'
                      className='h-[42px] !text-base'
                    />
                    <p className='text-muted-foreground text-xs'>
                      Leave blank if you don't want to change password
                    </p>
                  </div>
                )}

                {isEditing && (
                  <div className='space-y-2'>
                    <Label htmlFor='password'>New Password</Label>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder='Enter new password (optional)'
                      className='h-[42px] !text-base'
                    />
                    <p className='text-muted-foreground text-xs'>
                      Leave blank if you don't want to change password
                    </p>
                  </div>
                )}

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='role'>Role</Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconShield className='text-muted-foreground h-4 w-4' />
                      <span className='capitalize'>
                        {user?.role?.name || 'Not set'}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='status'>Account Status</Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconCheck className='text-muted-foreground h-4 w-4' />
                      <span className='capitalize'>
                        {user?.status?.name || 'Not set'}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='provider'>Account Provider</Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconShield className='text-muted-foreground h-4 w-4' />
                      <span className='capitalize'>
                        {user?.provider || 'Email'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific fields */}
            {renderRoleSpecificFields()}

            {userRole && userRole !== RoleEnum.ADMIN && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <IconBuilding className='h-5 w-5' />
                    <span>Warehouse Information</span>
                  </CardTitle>
                  <CardDescription>
                    Associated warehouse details
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='warehouseName'>Warehouse Name</Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconBuilding className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.warehouseName || 'No warehouse assigned'}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='warehouseAddress'>Warehouse Address</Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconMapPin className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.warehouseAddress || 'No warehouse address'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isEditing && (
              <Card className='!border-none shadow-none'>
                <CardContent>
                  <div className='flex justify-end space-x-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      <IconX className='mr-2 h-4 w-4' />
                      Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          Saving...
                        </>
                      ) : (
                        <>
                          <IconCheck className='mr-2 h-4 w-4' />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
