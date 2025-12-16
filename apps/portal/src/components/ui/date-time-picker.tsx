'use client';

import * as React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type DateTimePickerProps = {
  value?: string | Date;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  className
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? (typeof value === 'string' ? new Date(value) : value) : undefined
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // preserve time part if already set
      if (date) {
        const merged = new Date(selectedDate);
        merged.setHours(date.getHours());
        merged.setMinutes(date.getMinutes());

        // If selected date is today, ensure time is not in the past
        if (merged.getTime() < now.getTime()) {
          merged.setHours(now.getHours());
          merged.setMinutes(now.getMinutes() + 5); // Add 5 minutes buffer
        }

        setDate(merged);
        onChange?.(toLocalIsoMinutes(merged));
      } else {
        // If selecting today, set time to current time + 5 minutes
        const newDate = new Date(selectedDate);
        if (newDate.getTime() < now.getTime()) {
          newDate.setHours(now.getHours());
          newDate.setMinutes(now.getMinutes() + 5);
        }
        setDate(newDate);
        onChange?.(toLocalIsoMinutes(newDate));
      }
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    if (date) {
      const newDate = new Date(date);
      if (type === 'hour') {
        newDate.setHours(parseInt(value));
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(value));
      }

      // If selected date is today, prevent selecting past time
      if (newDate.getTime() < now.getTime()) {
        return; // Don't update if time is in the past
      }

      setDate(newDate);
      onChange?.(toLocalIsoMinutes(newDate));
    }
  };

  React.useEffect(() => {
    // sync internal state if parent value changes
    if (!value) return;
    const next = typeof value === 'string' ? new Date(value) : value;
    if (!date || next.getTime() !== date.getTime()) {
      setDate(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function toLocalIsoMinutes(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    // Keep the same format as input type datetime-local would produce (no seconds, local time)
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? (
            format(date, 'dd/MM/yyyy HH:mm')
          ) : (
            <span>{placeholder ?? 'dd/MM/yyyy HH:mm'}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='sm:flex'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => date < todayStart}
          />
          <div className='flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0'>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex p-2 sm:flex-col'>
                {hours.reverse().map((hour) => {
                  const isDisabled =
                    date &&
                    date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear() &&
                    hour < now.getHours();

                  return (
                    <Button
                      key={hour}
                      size='icon'
                      variant={
                        date && date.getHours() === hour ? 'default' : 'ghost'
                      }
                      className={cn(
                        'aspect-square shrink-0 sm:w-full',
                        isDisabled && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() =>
                        !isDisabled && handleTimeChange('hour', hour.toString())
                      }
                      disabled={isDisabled}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex p-2 sm:flex-col'>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                  const isDisabled =
                    date &&
                    date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear() &&
                    date.getHours() === now.getHours() &&
                    minute < now.getMinutes();

                  return (
                    <Button
                      key={minute}
                      size='icon'
                      variant={
                        date && date.getMinutes() === minute
                          ? 'default'
                          : 'ghost'
                      }
                      className={cn(
                        'aspect-square shrink-0 sm:w-full',
                        isDisabled && 'cursor-not-allowed opacity-50'
                      )}
                      onClick={() =>
                        !isDisabled &&
                        handleTimeChange('minute', minute.toString())
                      }
                      disabled={isDisabled}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
