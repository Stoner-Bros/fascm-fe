'use client';

import { useState, useRef, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';

const AddressPickerMap = dynamic(
  () => import('@/components/map/osrm-map').then((m) => m.AddressPickerMap),
  { ssr: false }
);

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5&countrycodes=vn&accept-language=vi`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 240) {
      onSetHarvestAddress(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 500);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const address = suggestion.display_name;
    const truncatedAddress =
      address.length > 240 ? address.substring(0, 240) : address;

    onSetHarvestAddress(truncatedAddress);
    onSetHarvestPos({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    setShowSuggestions(false);
  };

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

        <div className='space-y-2' ref={wrapperRef}>
          <div className='flex items-center justify-between'>
            <Label htmlFor='harvest-address'>
              {t('new.schedule.harvestAddress')}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <span className='text-muted-foreground text-xs'>
              {harvestAddress.length}/240
            </span>
          </div>
          <div className='relative'>
            <Textarea
              id='harvest-address'
              value={harvestAddress}
              onChange={handleAddressChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder={t('new.schedule.harvestAddress')}
              rows={3}
              className='resize-none'
              maxLength={240}
            />
            {isLoadingSuggestions && (
              <div className='absolute top-2 right-2'>
                <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className='bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full rounded-md border shadow-md'>
                <ScrollArea className='h-[200px]'>
                  <div className='p-1'>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className='hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm'
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <IconMapPin className='mt-0.5 h-4 w-4 shrink-0 opacity-50' />
                        <span>{suggestion.display_name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
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
