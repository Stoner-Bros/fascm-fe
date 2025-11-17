'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { login } from '@/components/api/auth';
import type { AuthLoginRequest } from '@/features/consignee/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<AuthLoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      router.replace('/consignee/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-[calc(100vh-0px)] items-center justify-center bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-cyan-500 p-6'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent opacity-20' />
      <Card className='w-full max-w-md border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl'>
        <div className='p-8'>
          <div className='mb-6 text-center'>
            <h1 className='text-2xl font-bold text-white'>FASCM Portal</h1>
            <p className='mt-1 text-sm text-white/80'>Đăng nhập để tiếp tục</p>
          </div>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div>
              <Label className='text-white' htmlFor='email'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className='mt-2 border-white/30 bg-white/20 text-white placeholder:text-white/60'
                required
              />
            </div>
            <div>
              <Label className='text-white' htmlFor='password'>
                Mật khẩu
              </Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className='mt-2 border-white/30 bg-white/20 text-white placeholder:text-white/60'
                required
              />
            </div>
            {error && (
              <div className='rounded border border-red-400/40 bg-red-500/20 px-3 py-2 text-sm text-red-200'>
                {error}
              </div>
            )}
            <Button
              type='submit'
              disabled={loading}
              className='w-full bg-white text-indigo-700 hover:bg-white/90'
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </div>
        <div className='px-8 pb-6 text-center text-xs text-white/70'>
          <span>Được bảo vệ bởi hệ thống FASCM</span>
        </div>
      </Card>
    </div>
  );
}
