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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/services/auth.service';
import { updateSupplier } from '@/services/supplier.service';
import { uploadFile } from '@/services/file.service';
import type { Supplier } from '@/types/supplier';
import { FileType } from '@/types/file';
import {
  IconBuilding,
  IconCheck,
  IconEdit,
  IconFileText,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlant,
  IconShield,
  IconUser,
  IconX
} from '@tabler/icons-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SupplierProfilePage() {
  const { user, fullInfo } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [qrCodeFiles, setQrCodeFiles] = useState<File[]>([]);
  const [userPhotoFiles, setUserPhotoFiles] = useState<File[]>([]);

  const supplierInfo = fullInfo as Supplier;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    oldPassword: '',
    password: '',
    gardenName: supplierInfo?.gardenName || '',
    representativeName: supplierInfo?.representativeName || '',
    contact: supplierInfo?.contact || '',
    address: supplierInfo?.address || '',
    taxCode: supplierInfo?.taxCode || '',
    certificate: supplierInfo?.certificate || '',
    qrCode: supplierInfo?.qrCode || '',
    warehouseName: supplierInfo?.warehouse?.name || '',
    warehouseAddress: supplierInfo?.warehouse?.address || ''
  });

  useEffect(() => {
    if (user && supplierInfo) {
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        oldPassword: '',
        password: '',
        gardenName: supplierInfo?.gardenName || '',
        representativeName: supplierInfo?.representativeName || '',
        contact: supplierInfo?.contact || '',
        address: supplierInfo?.address || '',
        taxCode: supplierInfo?.taxCode || '',
        certificate: supplierInfo?.certificate || '',
        qrCode: supplierInfo?.qrCode || '',
        warehouseName: supplierInfo?.warehouse?.name || '',
        warehouseAddress: supplierInfo?.warehouse?.address || ''
      });
    }
  }, [user, supplierInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (
    files: File[],
    type: 'certificate' | 'qrCode' | 'userPhoto'
  ): Promise<FileType | null> => {
    if (files.length === 0) return null;

    try {
      const uploadedFile = await uploadFile(files[0]);
      return uploadedFile || null;
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      toast({
        variant: 'destructive',
        title: t('toast.fileUploadFailed'),
        description: t('toast.fileUploadFailedDescription', { type })
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierInfo?.id) {
      toast({
        variant: 'destructive',
        title: t('toast.error'),
        description: t('toast.supplierNotFound')
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files if any
      const [certificateUrl, qrCodeUrl, userPhotoUrl] = await Promise.all([
        handleFileUpload(certificateFiles, 'certificate'),
        handleFileUpload(qrCodeFiles, 'qrCode'),
        handleFileUpload(userPhotoFiles, 'userPhoto')
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

      // Update supplier information
      await updateSupplier(supplierInfo.id, {
        gardenName: formData.gardenName,
        representativeName: formData.representativeName,
        contact: formData.contact,
        address: formData.address,
        taxCode: formData.taxCode,
        certificate: certificateUrl?.path || formData.certificate,
        qrCode: qrCodeUrl?.path || formData.qrCode,
        warehouse: { id: supplierInfo.warehouse.id },
        user: { id: String(user?.id) }
      });

      // Clear file states
      setCertificateFiles([]);
      setQrCodeFiles([]);
      setUserPhotoFiles([]);

      toast({
        title: t('toast.profileUpdated'),
        description: t('toast.profileUpdatedDescription')
      });

      setIsEditing(false);

      // Refresh page to show updated data
      // window.location.reload();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: 'destructive',
        title: t('toast.updateFailed'),
        description: t('toast.updateFailedDescription')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCertificateFiles([]);
    setQrCodeFiles([]);
    setUserPhotoFiles([]);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      oldPassword: '',
      password: '',
      gardenName: supplierInfo?.gardenName || '',
      representativeName: supplierInfo?.representativeName || '',
      contact: supplierInfo?.contact || '',
      address: supplierInfo?.address || '',
      taxCode: supplierInfo?.taxCode || '',
      certificate: supplierInfo?.certificate || '',
      qrCode: supplierInfo?.qrCode || '',
      warehouseName: supplierInfo?.warehouse?.name || '',
      warehouseAddress: supplierInfo?.warehouse?.address || ''
    });
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground'>{t('subtitle')}</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className='mr-2 h-4 w-4' />
              {t('buttons.editProfile')}
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
                {t('buttons.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    {t('buttons.saving')}
                  </>
                ) : (
                  <>
                    <IconCheck className='mr-2 h-4 w-4' />
                    {t('buttons.saveChanges')}
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
                <CardTitle>{t('personalInformation.title')}</CardTitle>
                <CardDescription>
                  {t('personalInformation.description')}
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
                          priority
                          src={user.photo.path}
                          alt={t('personalInformation.profilePicture')}
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

                  {/* QR Code Section */}
                  <div className='flex basis-1/2 items-center justify-start space-x-4'>
                    <div className='text-center'>
                      {formData.qrCode ? (
                        <div className='rounded-lg border-2 border-dashed border-gray-300 p-4'>
                          <Image
                            src={formData.qrCode}
                            priority
                            alt={t('personalInformation.organizationQrCode')}
                            height={200}
                            width={200}
                            className='aspect-square rounded-md object-cover object-center'
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className='flex h-[200px] w-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50'>
                          <div className='text-center'>
                            <IconFileText className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                            <p className='text-xs text-gray-500'>
                              {t('personalInformation.noQrCode')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className='space-y-2'>
                        <FileUploader
                          value={qrCodeFiles}
                          onValueChange={setQrCodeFiles}
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
                    <Label htmlFor='firstName'>
                      {t('personalInformation.firstName')}
                    </Label>
                    {isEditing ? (
                      <Input
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={t(
                          'personalInformation.firstNamePlaceholder'
                        )}
                        className='h-[42px] !text-base'
                        required
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconUser className='text-muted-foreground h-4 w-4' />
                        <span>
                          {formData.firstName ||
                            t('personalInformation.notSet')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>
                      {t('personalInformation.lastName')}
                    </Label>
                    {isEditing ? (
                      <Input
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={t(
                          'personalInformation.lastNamePlaceholder'
                        )}
                        className='h-[42px] !text-base'
                        required
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconUser className='text-muted-foreground h-4 w-4' />
                        <span>
                          {formData.lastName || t('personalInformation.notSet')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>
                    {t('personalInformation.email')}
                  </Label>
                  <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                    <IconMail className='text-muted-foreground h-4 w-4' />
                    <span>{formData.email}</span>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {t('personalInformation.emailCannotChange')}
                  </p>
                </div>

                {isEditing && (
                  <div className='space-y-2'>
                    <Label htmlFor='oldPassword'>
                      {t('personalInformation.oldPassword')}
                    </Label>
                    <Input
                      id='oldPassword'
                      name='oldPassword'
                      type='password'
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      placeholder={t(
                        'personalInformation.oldPasswordPlaceholder'
                      )}
                      className='h-[42px] !text-base'
                    />
                    <p className='text-muted-foreground text-xs'>
                      {t('personalInformation.passwordOptional')}
                    </p>
                  </div>
                )}

                {isEditing && (
                  <div className='space-y-2'>
                    <Label htmlFor='password'>
                      {t('personalInformation.newPassword')}
                    </Label>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t(
                        'personalInformation.newPasswordPlaceholder'
                      )}
                      className='h-[42px] !text-base'
                    />
                    <p className='text-muted-foreground text-xs'>
                      {t('personalInformation.passwordOptional')}
                    </p>
                  </div>
                )}

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='role'>
                      {t('personalInformation.role')}
                    </Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconShield className='text-muted-foreground h-4 w-4' />
                      <span className='capitalize'>
                        {user?.role?.name || t('personalInformation.notSet')}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='status'>
                      {t('personalInformation.accountStatus')}
                    </Label>
                    <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                      <IconCheck className='text-muted-foreground h-4 w-4' />
                      <span className='capitalize'>
                        {user?.status?.name || t('personalInformation.notSet')}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='provider'>
                      {t('personalInformation.accountProvider')}
                    </Label>
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

            <Card>
              <CardHeader>
                <CardTitle>{t('organizationInformation.title')}</CardTitle>
                <CardDescription>
                  {t('organizationInformation.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='gardenName'>
                      {t('organizationInformation.organizationName')}
                    </Label>
                    {isEditing ? (
                      <Input
                        id='gardenName'
                        name='gardenName'
                        value={formData.gardenName}
                        onChange={handleInputChange}
                        placeholder={t(
                          'organizationInformation.organizationNamePlaceholder'
                        )}
                        className='h-[42px] !text-base'
                        required
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconPlant className='text-muted-foreground h-4 w-4' />
                        <span>
                          {formData.gardenName ||
                            t(
                              'organizationInformation.organizationNamePlaceholder'
                            )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='representativeName'>
                      {t('organizationInformation.representativeName')}
                    </Label>
                    {isEditing ? (
                      <Input
                        id='representativeName'
                        name='representativeName'
                        value={formData.representativeName}
                        onChange={handleInputChange}
                        placeholder={t(
                          'organizationInformation.representativeNamePlaceholder'
                        )}
                        className='h-[42px] !text-base'
                        required
                      />
                    ) : (
                      <div className='flex items-center space-x-2 rounded-md border p-2'>
                        <IconUser className='text-muted-foreground h-4 w-4' />
                        <span>
                          {formData.representativeName ||
                            t(
                              'organizationInformation.representativeNamePlaceholder'
                            )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='contact'>
                    {t('organizationInformation.contact')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id='contact'
                      name='contact'
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder={t(
                        'organizationInformation.contactPlaceholder'
                      )}
                      className='h-[42px] !text-base'
                      required
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconPhone className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.contact ||
                          t('organizationInformation.contactPlaceholder')}
                      </span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address'>
                    {t('organizationInformation.address')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id='address'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t(
                        'organizationInformation.addressPlaceholder'
                      )}
                      className='h-[42px] !text-base'
                      required
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconMapPin className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.address ||
                          t('organizationInformation.addressPlaceholder')}
                      </span>
                    </div>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='taxCode'>
                    {t('organizationInformation.taxCode')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id='taxCode'
                      name='taxCode'
                      value={formData.taxCode}
                      onChange={handleInputChange}
                      placeholder={t(
                        'organizationInformation.taxCodePlaceholder'
                      )}
                      className='h-[42px] !text-base'
                      required
                    />
                  ) : (
                    <div className='flex items-center space-x-2 rounded-md border p-2'>
                      <IconId className='text-muted-foreground h-4 w-4' />
                      <span>
                        {formData.taxCode ||
                          t('organizationInformation.taxCodePlaceholder')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certificates & Documents */}
            <Card>
              <CardHeader>
                <CardTitle>{t('businessCertificate.title')}</CardTitle>
                <CardDescription>
                  {t('businessCertificate.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label>{t('businessCertificate.label')}</Label>
                  {!isEditing && formData.certificate && (
                    <div className='flex items-center space-x-2 rounded-md border p-3'>
                      <IconFileText className='text-muted-foreground h-5 w-5' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>
                          {t('businessCertificate.currentCertificate')}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {formData.certificate}
                        </p>
                      </div>
                      {formData.certificate.startsWith('http') && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            window.open(formData.certificate, '_blank')
                          }
                        >
                          {t('businessCertificate.view')}
                        </Button>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className='space-y-3'>
                      <Input
                        id='certificate'
                        name='certificate'
                        value={formData.certificate}
                        onChange={handleInputChange}
                        placeholder={t(
                          'businessCertificate.certificatePlaceholder'
                        )}
                      />
                      <div>
                        <Label className='text-muted-foreground text-sm'>
                          {t('businessCertificate.uploadNewCertificate')}
                        </Label>
                        <FileUploader
                          value={certificateFiles}
                          onValueChange={setCertificateFiles}
                          accept={{
                            'image/*': ['.png', '.jpg', '.jpeg'],
                            'application/pdf': ['.pdf'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                              ['.docx']
                          }}
                          maxSize={10 * 1024 * 1024} // 10MB
                          maxFiles={1}
                          className='w-full'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('warehouseInformation.title')}</CardTitle>
                <CardDescription>
                  {t('warehouseInformation.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='warehouseName'>
                    {t('warehouseInformation.warehouseName')}
                  </Label>
                  <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                    <IconBuilding className='text-muted-foreground h-4 w-4' />
                    <span>
                      {formData.warehouseName ||
                        t('warehouseInformation.noWarehouseAssigned')}
                    </span>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='warehouseAddress'>
                    {t('warehouseInformation.warehouseAddress')}
                  </Label>
                  <div className='bg-muted flex items-center space-x-2 rounded-md border p-2'>
                    <IconMapPin className='text-muted-foreground h-4 w-4' />
                    <span>
                      {formData.warehouseAddress ||
                        t('warehouseInformation.noWarehouseAddress')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
