'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import type { RegisterType } from '@/types/register';
import {
  registerConsignee,
  registerSupplier
} from '@/services/register.service';

export default function SignUpViewPage() {
  const t = useTranslations('Auth.signUp');
  const router = useRouter();

  // Toggle between supplier and consignee
  const [registerType, setRegisterType] = useState<RegisterType>('supplier');

  // Common user fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Shared fields
  const [representativeName, setRepresentativeName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');

  // Supplier-specific fields
  const [gardenName, setGardenName] = useState('');

  // Consignee-specific fields
  const [organizationName, setOrganizationName] = useState('');

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('passwordMismatch') || 'Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(
        t('passwordTooShort') || 'Password must be at least 6 characters.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const userDto = {
        email,
        password,
        firstName,
        lastName
      };

      if (registerType === 'supplier') {
        // Validate required supplier fields
        if (!gardenName.trim()) {
          setError(t('gardenNameRequired') || 'Garden name is required.');
          setIsLoading(false);
          return;
        }
        if (!representativeName.trim()) {
          setError(
            t('representativeNameRequired') ||
              'Representative name is required.'
          );
          setIsLoading(false);
          return;
        }

        await registerSupplier({
          user: userDto,
          gardenName,
          representativeName,
          contact: contact || null,
          address: address || null,
          taxCode: taxCode || null
        });
      } else {
        await registerConsignee({
          user: userDto,
          organizationName: organizationName || null,
          representativeName: representativeName || null,
          contact: contact || null,
          address: address || null,
          taxCode: taxCode || null
        });
      }

      setSuccess(
        t('registrationSuccess') ||
          'Registration successful! Please check your email to confirm your account.'
      );

      // Redirect to sign-in after a short delay
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
    } catch (err: any) {
      console.log(err);
      setError(
        t('registrationFailed') || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Left Side */}
      <div className='relative h-full w-full overflow-hidden'>
        <img
          src='/images/background.jpg'
          alt='Fresh agricultural products'
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />

        <div className='absolute top-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-3xl' />

        <div className='absolute inset-0 flex flex-col items-start justify-center px-12 py-16 text-white'>
          <h1 className='mb-6 max-w-4xl bg-gradient-to-r from-green-300 via-lime-200 to-green-400 bg-clip-text text-6xl leading-tight font-extrabold text-transparent drop-shadow-[0_4px_20px_rgba(0,255,150,0.4)]'>
            Kết nối nông sản tươi Mang chất lượng đến từng gia đình
          </h1>

          <p className='mb-8 max-w-2xl text-xl leading-relaxed text-gray-200'>
            Hệ thống quản lý thu hoạch, vận chuyển và phân phối nông sản theo
            thời gian thực.
          </p>

          <div className='space-y-4'>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>Nguồn gốc minh bạch</span>
            </div>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>Thu hoạch trong ngày</span>
            </div>
            <div className='flex items-center gap-3 text-lg'>
              <span className='font-bold text-green-400'>✔</span>
              <span>Giao hàng chuẩn lạnh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className='flex min-h-screen items-center justify-center overflow-y-auto p-4 lg:p-6'>
        <div className='absolute top-3 right-3 z-10'>
          <ModeToggle />
        </div>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-4'>
          <div className='w-full space-y-3'>
            <div className='flex flex-col space-y-1 text-center'>
              <h1 className='text-xl font-semibold tracking-tight'>
                {t('title') || 'Đăng ký tài khoản'}
              </h1>
              <p className='text-muted-foreground text-xs'>
                {t('description') || 'Điền thông tin để tạo tài khoản mới'}
              </p>
            </div>

            {/* Register Type Switch */}
            <div className='bg-muted/30 flex items-center justify-center gap-3 rounded-lg border p-2.5'>
              <span
                className={`text-xs font-medium transition-colors ${
                  registerType === 'supplier'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {t('supplier') || 'Nhà cung cấp'}
              </span>
              <Switch
                checked={registerType === 'consignee'}
                onCheckedChange={(checked) =>
                  setRegisterType(checked ? 'consignee' : 'supplier')
                }
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  registerType === 'consignee'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {t('consignee') || 'Đối tác phân phối'}
              </span>
            </div>

            <div className='grid gap-3'>
              {error && (
                <div className='rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'>
                  {error}
                </div>
              )}
              {success && (
                <div className='rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'>
                  {success}
                </div>
              )}
              <form className='grid gap-2.5' onSubmit={handleSubmit}>
                {/* User Account Fields - 2 columns */}
                <div className='grid grid-cols-2 gap-2'>
                  <div className='grid gap-1'>
                    <Label htmlFor='firstName' className='text-xs'>
                      {t('firstName') || 'Họ'}
                    </Label>
                    <Input
                      id='firstName'
                      placeholder={t('firstNamePlaceholder') || 'Nguyễn'}
                      type='text'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                      className='h-8 text-sm'
                    />
                  </div>
                  <div className='grid gap-1'>
                    <Label htmlFor='lastName' className='text-xs'>
                      {t('lastName') || 'Tên'}
                    </Label>
                    <Input
                      id='lastName'
                      placeholder={t('lastNamePlaceholder') || 'Văn A'}
                      type='text'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                      className='h-8 text-sm'
                    />
                  </div>
                </div>

                <div className='grid gap-1'>
                  <Label htmlFor='email' className='text-xs'>
                    {t('email') || 'Email'}
                  </Label>
                  <Input
                    id='email'
                    placeholder={t('emailPlaceholder') || 'email@example.com'}
                    type='email'
                    autoCapitalize='none'
                    autoComplete='email'
                    autoCorrect='off'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className='h-8 text-sm'
                  />
                </div>

                {/* Password fields - 2 columns */}
                <div className='grid grid-cols-2 gap-2'>
                  <div className='grid gap-1'>
                    <Label htmlFor='password' className='text-xs'>
                      {t('password') || 'Mật khẩu'}
                    </Label>
                    <Input
                      id='password'
                      placeholder={t('passwordPlaceholder') || 'Mật khẩu'}
                      type='password'
                      autoComplete='new-password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className='h-8 text-sm'
                    />
                  </div>
                  <div className='grid gap-1'>
                    <Label htmlFor='confirmPassword' className='text-xs'>
                      {t('confirmPassword') || 'Xác nhận'}
                    </Label>
                    <Input
                      id='confirmPassword'
                      placeholder={
                        t('confirmPasswordPlaceholder') || 'Nhập lại'
                      }
                      type='password'
                      autoComplete='new-password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className='h-8 text-sm'
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className='border-t pt-2.5'>
                  <h3 className='mb-2 text-xs font-medium'>
                    {registerType === 'supplier'
                      ? t('supplierInfo') || 'Thông tin nhà cung cấp'
                      : t('consigneeInfo') || 'Thông tin đối tác phân phối'}
                  </h3>

                  <div className='grid gap-2'>
                    {/* Type-specific field + Representative in 2 columns */}
                    <div className='grid grid-cols-2 gap-2'>
                      {registerType === 'supplier' ? (
                        <div className='grid gap-1'>
                          <Label htmlFor='gardenName' className='text-xs'>
                            {t('gardenName') || 'Tên vườn'}{' '}
                            <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id='gardenName'
                            placeholder={
                              t('gardenNamePlaceholder') || 'Vườn cam Cao Phong'
                            }
                            type='text'
                            value={gardenName}
                            onChange={(e) => setGardenName(e.target.value)}
                            required
                            disabled={isLoading}
                            className='h-8 text-sm'
                          />
                        </div>
                      ) : (
                        <div className='grid gap-1'>
                          <Label htmlFor='organizationName' className='text-xs'>
                            {t('organizationName') || 'Tên tổ chức'}
                          </Label>
                          <Input
                            id='organizationName'
                            placeholder={
                              t('organizationNamePlaceholder') || 'Siêu thị ABC'
                            }
                            type='text'
                            value={organizationName}
                            onChange={(e) =>
                              setOrganizationName(e.target.value)
                            }
                            disabled={isLoading}
                            className='h-8 text-sm'
                          />
                        </div>
                      )}
                      <div className='grid gap-1'>
                        <Label htmlFor='representativeName' className='text-xs'>
                          {t('representativeName') || 'Người đại diện'}
                          {registerType === 'supplier' && (
                            <span className='text-red-500'> *</span>
                          )}
                        </Label>
                        <Input
                          id='representativeName'
                          placeholder={
                            t('representativeNamePlaceholder') || 'Nguyễn Văn A'
                          }
                          type='text'
                          value={representativeName}
                          onChange={(e) =>
                            setRepresentativeName(e.target.value)
                          }
                          required={registerType === 'supplier'}
                          disabled={isLoading}
                          className='h-8 text-sm'
                        />
                      </div>
                    </div>

                    {/* Contact + Tax Code in 2 columns */}
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='grid gap-1'>
                        <Label htmlFor='contact' className='text-xs'>
                          {t('contact') || 'Số điện thoại'}
                        </Label>
                        <Input
                          id='contact'
                          placeholder={
                            t('contactPlaceholder') || '0123 456 789'
                          }
                          type='tel'
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          disabled={isLoading}
                          className='h-8 text-sm'
                        />
                      </div>
                      <div className='grid gap-1'>
                        <Label htmlFor='taxCode' className='text-xs'>
                          {t('taxCode') || 'Mã số thuế'}
                        </Label>
                        <Input
                          id='taxCode'
                          placeholder={t('taxCodePlaceholder') || '0123456789'}
                          type='text'
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          disabled={isLoading}
                          className='h-8 text-sm'
                        />
                      </div>
                    </div>

                    {/* Address - full width */}
                    <div className='grid gap-1'>
                      <Label htmlFor='address' className='text-xs'>
                        {t('address') || 'Địa chỉ'}
                      </Label>
                      <Input
                        id='address'
                        placeholder={
                          t('addressPlaceholder') || '123 Đường ABC, Quận XYZ'
                        }
                        type='text'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={isLoading}
                        className='h-8 text-sm'
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type='submit'
                  className='mt-1 h-9 w-full'
                  disabled={isLoading}
                >
                  {isLoading
                    ? t('registering') || 'Đang đăng ký...'
                    : t('registerButton') || 'Đăng ký'}
                </Button>
              </form>
            </div>
          </div>

          <p className='text-muted-foreground text-center text-xs'>
            {t('haveAccount') || 'Đã có tài khoản?'}{' '}
            <Link
              href='/auth/sign-in'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('signInLink') || 'Đăng nhập'}
            </Link>
          </p>

          <p className='text-muted-foreground px-4 text-center text-xs'>
            {t('agreement') || 'Bằng việc đăng ký, bạn đồng ý với'}{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('termsOfService') || 'Điều khoản'}
            </Link>{' '}
            {t('and') || 'và'}{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              {t('privacyPolicy') || 'Chính sách bảo mật'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
