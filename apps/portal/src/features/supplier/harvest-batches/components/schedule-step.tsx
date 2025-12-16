'use client';

import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { IconCalendar } from '@tabler/icons-react';

const AddressPickerMap = dynamic(
  () => import('@/components/map/osrm-map').then((m) => m.AddressPickerMap),
  { ssr: false }
);

type ScheduleStepProps = {
  harvestDate: string;
  harvestAddress: string;
  description: string;
  harvestPos: { lat: number; lng: number } | undefined;
  showMap: boolean;
  onSetHarvestDate: (date: string) => void;
  onSetHarvestAddress: (address: string) => void;
  onSetDescription: (description: string) => void;
  onSetHarvestPos: (pos: { lat: number; lng: number } | undefined) => void;
  onToggleMap: () => void;
  t: (key: string) => string;
};

export function ScheduleStep({
  harvestDate,
  harvestAddress,
  description,
  harvestPos,
  showMap,
  onSetHarvestDate,
  onSetHarvestAddress,
  onSetDescription,
  onSetHarvestPos,
  onToggleMap,
  t
}: ScheduleStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconCalendar className='h-5 w-5' />
          {t('new.schedule.title')}
        </CardTitle>
        <CardDescription>{t('new.schedule.description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='harvest-date'>
            {t('new.schedule.harvestDate')}{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <DateTimePicker
            value={harvestDate}
            onChange={onSetHarvestDate}
            placeholder={t('new.schedule.harvestDate')}
          />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='harvest-address'>
              {t('new.schedule.harvestAddress')}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <span className='text-muted-foreground text-xs'>
              {harvestAddress.length}/240
            </span>
          </div>
          <Textarea
            id='harvest-address'
            value={harvestAddress}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 240) {
                onSetHarvestAddress(value);
              }
            }}
            placeholder={t('new.schedule.harvestAddress')}
            rows={3}
            className='resize-none'
            maxLength={240}
          />
        </div>

        <div className='space-y-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onToggleMap}
          >
            {showMap
              ? t('new.buttons.closeMap')
              : t('new.schedule.selectOnMap')}
          </Button>
          {showMap && (
            <div className='rounded-lg border p-2'>
              <AddressPickerMap
                value={{
                  position: harvestPos,
                  address: harvestAddress
                }}
                onChange={(v) => {
                  const address = v.address || '';
                  // Truncate to 240 characters if from map
                  const truncatedAddress =
                    address.length > 240 ? address.substring(0, 240) : address;
                  onSetHarvestAddress(truncatedAddress);
                  onSetHarvestPos(v.position);
                }}
              />
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='description'>{t('new.schedule.notes')}</Label>
            <span className='text-muted-foreground text-xs'>
              {description.length}/240
            </span>
          </div>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 240) {
                onSetDescription(value);
              }
            }}
            placeholder={t('new.schedule.notesPlaceholder')}
            rows={3}
            className='resize-none'
            maxLength={240}
          />
        </div>
      </CardContent>
    </Card>
  );
}
