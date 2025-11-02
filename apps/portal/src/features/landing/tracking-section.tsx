'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import {
  Search,
  QrCode,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  FileText,
  Download,
  Database,
  Hash,
  User,
  Truck,
  Package,
  Factory,
  Store,
  Minimize2,
  X
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TrackingSection() {
  const t = useTranslations('Landing.tracking');
  const [batchCode, setBatchCode] = useState('');
  const [blockchainHash, setBlockchainHash] = useState('');
  const [showQRResult, setShowQRResult] = useState(false);
  const [showBlockchainVerify, setShowBlockchainVerify] = useState(false);
  const [isLotResultMinimized, setIsLotResultMinimized] = useState(false);
  const [isBlockchainResultMinimized, setIsBlockchainResultMinimized] =
    useState(false);

  // Mock data for lot tracking result
  const lotTrackingResult = {
    lotCode: 'LOT-2024-001',
    productName: 'Gạo ST25 Organic',
    productionDate: '15/01/2024',
    expiryDate: '15/01/2025',
    completionPercentage: 85,
    qrCode: 'QR-LOT-2024-001-VERIFY',
    timeline: [
      {
        stage: 'Gieo trồng',
        status: 'completed',
        date: '15/01/2024',
        location: 'Đồng Tháp',
        icon: Factory
      },
      {
        stage: 'Thu hoạch',
        status: 'completed',
        date: '20/03/2024',
        location: 'Đồng Tháp',
        icon: Package
      },
      {
        stage: 'Chế biến',
        status: 'completed',
        date: '25/03/2024',
        location: 'TP.HCM',
        icon: Factory
      },
      {
        stage: 'Vận chuyển',
        status: 'in_progress',
        date: '30/03/2024',
        location: 'Hà Nội',
        icon: Truck
      },
      {
        stage: 'Phân phối',
        status: 'pending',
        date: 'Dự kiến 05/04/2024',
        location: 'Hà Nội',
        icon: Store
      }
    ],
    certificates: [
      {
        name: 'Chứng nhận Organic',
        type: 'PDF',
        size: '2.5MB'
      },
      {
        name: 'Giấy phép ATTP',
        type: 'PDF',
        size: '1.8MB'
      },
      {
        name: 'Chứng nhận VietGAP',
        type: 'PDF',
        size: '3.2MB'
      }
    ]
  };

  // Mock data for blockchain verification result
  const blockchainVerifyResult = {
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    blockNumber: '18,542,891',
    confirmations: 1247,
    timestamp: '30/03/2024 14:32:15',
    smartContract: 'FoodTraceability.sol',
    signer: 'Nông trại ABC'
  };

  const handleLotSearch = () => {
    if (batchCode.trim()) {
      setShowQRResult(true);
      setIsLotResultMinimized(false);
    }
  };

  const handleBlockchainVerify = () => {
    if (blockchainHash.trim()) {
      setShowBlockchainVerify(true);
      setIsBlockchainResultMinimized(false);
    }
  };

  const handleQRScan = () => {
    setBatchCode('LOT-2024-001');
    setShowQRResult(true);
    setIsLotResultMinimized(false);
  };

  // Handlers for Lot Result Card
  const handleLotResultMinimize = () => {
    setIsLotResultMinimized(!isLotResultMinimized);
  };

  const handleLotResultClose = () => {
    setShowQRResult(false);
    setIsLotResultMinimized(false);
    setBatchCode('');
  };

  // Handlers for Blockchain Result Card
  const handleBlockchainResultMinimize = () => {
    setIsBlockchainResultMinimized(!isBlockchainResultMinimized);
  };

  const handleBlockchainResultClose = () => {
    setShowBlockchainVerify(false);
    setIsBlockchainResultMinimized(false);
    setBlockchainHash('');
  };

  return (
    <section
      id='tracking'
      className='bg-gradient-to-br from-blue-50 via-white to-green-50 py-24 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
    >
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='mb-16 text-center'
        >
          <h2 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white'>
            {t('title')}
          </h2>
          <p className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'>
            {t('description')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className='mx-auto max-w-6xl'
        >
          <div className='w-full'>
            <div className='mb-8 flex justify-center'>
              <div className='bg-primary text-primary-foreground rounded-lg px-6 py-3 text-lg font-medium'>
                {t('tabLot')}
              </div>
            </div>

            {/* Lot Tracking Section */}
            <div className='space-y-6'>
              <div className='grid gap-6 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Search className='mr-2 h-5 w-5' />
                      {t('lotTracking.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('lotTracking.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex space-x-2'>
                      <Input
                        placeholder={t('lotTracking.placeholder')}
                        value={batchCode}
                        onChange={(e) => setBatchCode(e.target.value)}
                      />
                      <Button
                        type='button'
                        onClick={handleLotSearch}
                        className='cursor-pointer px-4 py-2'
                      >
                        <Search className='mr-2 h-4 w-4' />
                        {t('lotTracking.search')}
                      </Button>
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      {t('lotTracking.orScan')}
                    </div>
                    <Button
                      onClick={handleQRScan}
                      variant='outline'
                      className='w-full'
                    >
                      <QrCode className='mr-2 h-4 w-4' />
                      {t('lotTracking.scanButton')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Database className='mr-2 h-5 w-5' />
                      {t('blockchain.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('blockchain.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <Input
                      placeholder={t('blockchain.placeholder')}
                      className='font-mono text-sm'
                      value={blockchainHash}
                      onChange={(e) => setBlockchainHash(e.target.value)}
                    />
                    <Button
                      type='button'
                      className='w-full cursor-pointer'
                      variant='outline'
                      onClick={handleBlockchainVerify}
                    >
                      <Database className='mr-2 h-4 w-4' />
                      {t('blockchain.button')}
                    </Button>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      <h3>{t('blockchain.demo')}</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lot Tracking Results */}
              {showQRResult && lotTrackingResult && (
                <Card className='border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center text-green-800 dark:text-green-200'>
                        <CheckCircle className='mr-2 h-5 w-5' />
                        {t('lotTracking.resultTitle')}
                      </CardTitle>
                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleLotResultMinimize}
                          className='h-8 w-8 p-0 text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-800'
                        >
                          <Minimize2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleLotResultClose}
                          className='h-8 w-8 p-0 text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-green-800'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {!isLotResultMinimized && (
                    <CardContent className='space-y-6'>
                      {/* Basic Information */}
                      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            {t('lotResult.lotCode')}
                          </p>
                          <p className='font-semibold text-green-800 dark:text-green-300'>
                            {lotTrackingResult.lotCode}
                          </p>
                        </div>
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            {t('lotResult.product')}
                          </p>
                          <p className='font-semibold'>
                            {lotTrackingResult.productName}
                          </p>
                        </div>
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            {t('lotResult.productionDate')}
                          </p>
                          <p className='font-semibold'>
                            {lotTrackingResult.productionDate}
                          </p>
                        </div>
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            {t('lotResult.expiryDate')}
                          </p>
                          <p className='font-semibold'>
                            {lotTrackingResult.expiryDate}
                          </p>
                        </div>
                      </div>

                      {/* Supply Chain Timeline */}
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h3 className='text-lg font-semibold dark:text-gray-200'>
                            {t('lotResult.supplyChain')}
                          </h3>
                          <div className='flex items-center space-x-2'>
                            <Progress
                              value={lotTrackingResult.completionPercentage}
                              className='w-32'
                            />
                            <span className='text-sm font-medium dark:text-gray-300'>
                              {lotTrackingResult.completionPercentage}%
                            </span>
                          </div>
                        </div>

                        <div className='relative'>
                          <div className='absolute top-8 bottom-0 left-6 w-0.5 bg-gray-200 dark:bg-gray-700'></div>
                          <div className='space-y-6'>
                            {lotTrackingResult.timeline.map(
                              (step: any, index: number) => {
                                const IconComponent = step.icon;
                                return (
                                  <div
                                    key={index}
                                    className='relative flex items-start space-x-4'
                                  >
                                    <div
                                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                                        step.status === 'completed'
                                          ? 'border-green-500 bg-green-100 dark:bg-green-900'
                                          : step.status === 'in_progress'
                                            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                                            : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
                                      }`}
                                    >
                                      <IconComponent
                                        className={`h-5 w-5 ${
                                          step.status === 'completed'
                                            ? 'text-green-600 dark:text-green-300'
                                            : step.status === 'in_progress'
                                              ? 'text-blue-600 dark:text-blue-300'
                                              : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                      />
                                    </div>
                                    <div className='flex-1 space-y-1'>
                                      <div className='flex items-center space-x-2'>
                                        <h4 className='font-semibold dark:text-gray-200'>
                                          {step.stage}
                                        </h4>
                                        {step.status === 'completed' && (
                                          <Badge
                                            variant='secondary'
                                            className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                          >
                                            <CheckCircle className='mr-1 h-3 w-3' />
                                            {t('lotResult.status.completed')}
                                          </Badge>
                                        )}
                                        {step.status === 'in_progress' && (
                                          <Badge
                                            variant='secondary'
                                            className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                          >
                                            <Clock className='mr-1 h-3 w-3' />
                                            {t('lotResult.status.inProgress')}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className='flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400'>
                                        <div className='flex items-center'>
                                          <Calendar className='mr-1 h-4 w-4' />
                                          {step.date}
                                        </div>
                                        <div className='flex items-center'>
                                          <MapPin className='mr-1 h-4 w-4' />
                                          {step.location}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Certificates and QR Code */}
                      <Accordion type='single' collapsible className='w-full'>
                        <AccordionItem value='certificates'>
                          <AccordionTrigger className='text-left'>
                            <div className='flex items-center dark:text-gray-200'>
                              <FileText className='mr-2 h-5 w-5' />
                              {t('lotResult.certificates')}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className='space-y-4'>
                            <div className='grid gap-4 md:grid-cols-2'>
                              <div className='space-y-3'>
                                <h4 className='font-semibold dark:text-gray-200'>
                                  {t('lotResult.certificatesTitle')}
                                </h4>
                                {lotTrackingResult.certificates.map(
                                  (cert: any, index: number) => (
                                    <div
                                      key={index}
                                      className='flex items-center justify-between rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-800'
                                    >
                                      <div className='flex items-center space-x-3'>
                                        <FileText className='h-5 w-5 text-blue-600 dark:text-blue-300' />
                                        <div>
                                          <p className='font-medium dark:text-gray-200'>
                                            {cert.name}
                                          </p>
                                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                                            {cert.type} • {cert.size}
                                          </p>
                                        </div>
                                      </div>
                                      <Button size='sm' variant='outline'>
                                        <Download className='h-4 w-4' />
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className='space-y-3'>
                                <h4 className='font-semibold dark:text-gray-200'>
                                  {t('lotResult.qrTitle')}
                                </h4>
                                <div className='flex flex-col items-center space-y-2 rounded-lg border p-4 dark:border-gray-600 dark:bg-gray-800'>
                                  <div className='flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700'>
                                    <QrCode className='h-12 w-12 text-gray-600 dark:text-gray-300' />
                                  </div>
                                  <p className='text-center text-xs text-gray-600 dark:text-gray-400'>
                                    {t('lotResult.qrScan')}
                                  </p>
                                  <code className='rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700 dark:text-gray-200'>
                                    {lotTrackingResult.qrCode}
                                  </code>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Blockchain Verification Results */}
              {showBlockchainVerify && blockchainVerifyResult && (
                <Card className='border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center text-purple-800 dark:text-purple-300'>
                        <Database className='mr-2 h-5 w-5' />
                        {t('blockchain.resultTitle')}
                      </CardTitle>
                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleBlockchainResultMinimize}
                          className='h-8 w-8 p-0 text-purple-700 hover:bg-purple-200 dark:text-purple-300 dark:hover:bg-purple-800'
                        >
                          <Minimize2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleBlockchainResultClose}
                          className='h-8 w-8 p-0 text-purple-700 hover:bg-purple-200 dark:text-purple-300 dark:hover:bg-purple-800'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {!isBlockchainResultMinimized && (
                    <CardContent className='space-y-4'>
                      <div className='grid gap-4 md:grid-cols-2'>
                        <Card className='border-0 bg-white dark:bg-gray-900'>
                          <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center text-base text-gray-900 dark:text-gray-100'>
                              <CheckCircle className='mr-2 h-5 w-5 text-green-600' />
                              {t('blockchainResult.transactionStatus')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.status')}
                              </span>
                              <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                                <CheckCircle className='mr-1 h-3 w-3' />
                                {t('blockchainResult.transactionConfirmed')}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.block')}
                              </span>
                              <span className='font-mono text-sm text-gray-900 dark:text-gray-100'>
                                #{blockchainVerifyResult.blockNumber}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.status')}
                              </span>
                              <span className='font-semibold text-green-600 dark:text-green-400'>
                                {blockchainVerifyResult.confirmations}{' '}
                                {t('blockchainResult.confirmations')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className='border-0 bg-white dark:bg-gray-900'>
                          <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center text-base text-gray-900 dark:text-gray-100'>
                              <Hash className='mr-2 h-5 w-5 text-purple-600' />
                              {t('blockchainResult.hashInfo')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className='space-y-3'>
                            <div className='space-y-1'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.hash')}
                              </span>
                              <code className='block rounded bg-gray-100 p-2 font-mono text-xs break-all dark:bg-gray-800 dark:text-gray-200'>
                                {blockchainVerifyResult.hash}
                              </code>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.recordDate')}
                              </span>
                              <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                {blockchainVerifyResult.timestamp}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className='border-0 bg-white dark:bg-gray-900'>
                        <CardHeader className='pb-3'>
                          <CardTitle className='flex items-center text-base text-gray-900 dark:text-gray-100'>
                            <User className='mr-2 h-5 w-5 text-blue-600' />
                            {t('blockchainResult.recorder')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div className='grid gap-4 md:grid-cols-2'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.smartContract')}
                              </span>
                              <span className='font-medium text-gray-900 dark:text-gray-100'>
                                {blockchainVerifyResult.smartContract}
                              </span>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                {t('blockchainResult.signer')}
                              </span>
                              <span className='font-medium text-gray-900 dark:text-gray-100'>
                                {blockchainVerifyResult.signer}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
