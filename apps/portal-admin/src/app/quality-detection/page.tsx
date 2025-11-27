'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';

const DEFAULT_API_URL = 'https://quality-detection-system.trycloudflare.com';

export default function QualityDetectionPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_URL);
  const [tempApiUrl, setTempApiUrl] = useState(DEFAULT_API_URL);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'connecting'
  >('connecting');
  const [isApiLoading, setIsApiLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Handle URL configuration
  const handleSaveUrl = () => {
    setApiBaseUrl(tempApiUrl);
    setIsDialogOpen(false);
  };

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      setTempApiUrl(apiBaseUrl); // Reset temp URL to current value when opening
    }
  };

  // API functions
  const callStartEndpoint = async () => {
    setIsApiLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/start`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setErrorMessage('');
        // Auto start streaming after successful start call
        if (!isStreaming) {
          setIsStreaming(true);
          setIsLoading(true);
          setHasError(false);
          setConnectionStatus('connecting');
          if (imgRef.current) {
            imgRef.current.src = `${apiBaseUrl}/video_feed?t=${Date.now()}`;
          }
        }
      } else {
        setErrorMessage('Lỗi khi gọi API start');
      }
    } catch (error) {
      setErrorMessage('Không thể kết nối đến API start');
    } finally {
      setIsApiLoading(false);
    }
  };

  const callStopEndpoint = async () => {
    setIsApiLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/stop`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setErrorMessage('');
        // Auto stop streaming after successful stop call
        setIsStreaming(false);
        setConnectionStatus('disconnected');
        if (imgRef.current) {
          imgRef.current.src = '';
        }
      } else {
        setErrorMessage('Lỗi khi gọi API stop');
      }
    } catch (error) {
      setErrorMessage('Không thể kết nối đến API stop');
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setConnectionStatus('connected');
    setErrorMessage('');
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    setConnectionStatus('disconnected');
    setErrorMessage(
      'Không thể kết nối đến video stream. Vui lòng kiểm tra URL hoặc thử lại.'
    );
  };

  const toggleStream = () => {
    if (isStreaming) {
      // Stop stream
      setIsStreaming(false);
      setConnectionStatus('disconnected');
      if (imgRef.current) {
        imgRef.current.src = '';
      }
    } else {
      // Start stream
      setIsStreaming(true);
      setIsLoading(true);
      setHasError(false);
      setConnectionStatus('connecting');
      if (imgRef.current) {
        imgRef.current.src = `${apiBaseUrl}/video_feed?t=${Date.now()}`;
      }
    }
  };

  const refreshStream = () => {
    setIsLoading(true);
    setHasError(false);
    setConnectionStatus('connecting');
    if (imgRef.current) {
      imgRef.current.src = `${apiBaseUrl}/video_feed?t=${Date.now()}`;
    }
  };

  const retryConnection = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      if (hasError && isStreaming) {
        refreshStream();
      }
    }, 5000);
  };

  useEffect(() => {
    if (hasError && isStreaming) {
      retryConnection();
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [hasError, isStreaming]);

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant='default' className='bg-green-500 hover:bg-green-600'>
            <Wifi className='mr-1 h-3 w-3' />
            Đã kết nối
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant='destructive'>
            <WifiOff className='mr-1 h-3 w-3' />
            Ngắt kết nối
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant='secondary'>
            <div className='mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
            Đang kết nối...
          </Badge>
        );
    }
  };

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Phát hiện chất lượng
        </h1>
        <div className='flex items-center space-x-3'>
          {/* API Configuration Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                <Settings className='mr-2 h-4 w-4' />
                Cấu hình API
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Cấu hình URL API</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div>
                  <Label htmlFor='api-url-dialog'>URL API cơ sở</Label>
                  <Input
                    id='api-url-dialog'
                    type='url'
                    value={tempApiUrl}
                    onChange={(e) => setTempApiUrl(e.target.value)}
                    placeholder='https://your-api-domain.com'
                    className='mt-1'
                  />
                  <p className='mt-1 text-sm text-gray-500'>
                    Nhập URL cơ sở cho API (ví dụ: https://example.ngrok.io)
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='rounded bg-gray-50 p-2 text-sm'>
                    <strong>Stream:</strong> {tempApiUrl}/video_feed
                  </div>
                  <div className='rounded bg-green-50 p-2 text-sm'>
                    <strong>Start:</strong> GET {tempApiUrl}/start
                  </div>
                  <div className='rounded bg-red-50 p-2 text-sm'>
                    <strong>Stop:</strong> GET {tempApiUrl}/stop
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleSaveUrl}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {getStatusBadge()}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Video Stream Trực tiếp</span>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={refreshStream}
                disabled={!isStreaming || isApiLoading}
              >
                <RotateCcw className='mr-1 h-4 w-4' />
                Làm mới
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={callStartEndpoint}
                disabled={isApiLoading}
                className='bg-green-600 hover:bg-green-700'
              >
                {isApiLoading ? (
                  <div className='mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                  <Play className='mr-1 h-4 w-4' />
                )}
                Bắt đầu
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={callStopEndpoint}
                disabled={isApiLoading}
              >
                {isApiLoading ? (
                  <div className='mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                  <Pause className='mr-1 h-4 w-4' />
                )}
                Dừng
              </Button>
              <Button
                variant={isStreaming ? 'destructive' : 'default'}
                size='sm'
                onClick={toggleStream}
                disabled={isApiLoading}
                className='ml-2'
              >
                {isStreaming ? (
                  <>
                    <Pause className='mr-1 h-4 w-4' />
                    Tắt Stream
                  </>
                ) : (
                  <>
                    <Play className='mr-1 h-4 w-4' />
                    Bật Stream
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='relative w-full'>
            {/* Video Stream Container */}
            <div
              className='relative overflow-hidden rounded-lg bg-black'
              style={{ aspectRatio: '16/9' }}
            >
              {isStreaming && (
                <img
                  ref={imgRef}
                  src={`${apiBaseUrl}/video_feed?t=${Date.now()}`}
                  alt='Video Stream'
                  className='h-full w-full object-contain'
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: hasError ? 'none' : 'block' }}
                />
              )}

              {/* Loading Overlay */}
              {isLoading && isStreaming && (
                <div className='bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gray-900'>
                  <div className='text-center text-white'>
                    <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent' />
                    <p>Đang tải video stream...</p>
                  </div>
                </div>
              )}

              {/* Error/Stopped State */}
              {(hasError || !isStreaming) && (
                <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
                  <div className='p-6 text-center text-white'>
                    {hasError ? (
                      <>
                        <AlertCircle className='mx-auto mb-4 h-16 w-16 text-red-400' />
                        <h3 className='mb-2 text-lg font-semibold'>
                          Lỗi kết nối
                        </h3>
                        <p className='mb-4 text-gray-300'>
                          Không thể tải video stream
                        </p>
                        <Button variant='outline' onClick={refreshStream}>
                          <RotateCcw className='mr-2 h-4 w-4' />
                          Thử lại
                        </Button>
                      </>
                    ) : (
                      <>
                        <Play className='mx-auto mb-4 h-16 w-16 text-gray-400' />
                        <h3 className='mb-2 text-lg font-semibold'>
                          Video đã dừng
                        </h3>
                        <p className='mb-4 text-gray-300'>
                          Nhấn Phát để bắt đầu stream
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className='mt-4 rounded-lg bg-gray-50 p-4'>
              <div className='space-y-2 text-sm text-gray-600'>
                <div className='flex items-center justify-between'>
                  <span>
                    Stream URL:{' '}
                    <code className='rounded bg-gray-200 px-1 text-xs'>
                      {apiBaseUrl}/video_feed
                    </code>
                  </span>
                  <span>Định dạng: MJPEG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {hasError && errorMessage && (
            <Alert className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {errorMessage}
                {isStreaming && (
                  <span className='mt-1 block text-sm'>
                    Hệ thống sẽ tự động thử lại sau 5 giây...
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Additional Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='rounded-lg bg-blue-50 p-4 text-center'>
              <h3 className='font-semibold text-blue-900'>Trạng thái</h3>
              <p className='mt-1 text-sm text-blue-700'>
                {connectionStatus === 'connected'
                  ? 'Hoạt động'
                  : connectionStatus === 'connecting'
                    ? 'Đang kết nối'
                    : 'Ngắt kết nối'}
              </p>
            </div>
            <div className='rounded-lg bg-green-50 p-4 text-center'>
              <h3 className='font-semibold text-green-900'>Chất lượng</h3>
              <p className='mt-1 text-sm text-green-700'>HD (720p)</p>
            </div>
            <div className='rounded-lg bg-purple-50 p-4 text-center'>
              <h3 className='font-semibold text-purple-900'>Độ trễ</h3>
              <p className='mt-1 text-sm text-purple-700'>Thời gian thực</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
