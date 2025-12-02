'use client';

import { useState, useMemo } from 'react';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { HarvestScheduleCard } from './harvest-schedule-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface HarvestScheduleListProps {
  harvestSchedules: HarvestSchedule[];
}

export function HarvestScheduleList({
  harvestSchedules
}: HarvestScheduleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSchedules = useMemo(() => {
    return harvestSchedules.filter((schedule) => {
      const matchesSearch =
        schedule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        '';

      const matchesStatus =
        statusFilter === 'all' ||
        normalizeStatus(schedule.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [harvestSchedules, searchTerm, statusFilter]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ duyệt đơn' },
    { value: 'rejected', label: 'Đã từ chối đơn' },
    { value: 'approved', label: 'Đã duyệt đơn' },
    { value: 'preparing', label: 'Chuẩn đi lấy' },
    { value: 'delivering', label: 'Đang đi lấy' },
    { value: 'delivered', label: 'Đã lấy' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'canceled', label: 'Đã hủy đơn' }
  ];

  const normalizeStatus = (status?: string | null): string => {
    if (!status || status.trim() === '') return 'pending';
    return status.toLowerCase().trim();
  };

  const getStatusBadgeVariant = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'preparing':
        return 'default';
      case 'delivering':
        return 'default';
      case 'delivered':
        return 'default';
      case 'completed':
        return 'default';
      case 'rejected':
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 items-center gap-4'>
          <Input
            placeholder='Tìm kiếm theo ID hoặc mô tả...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='max-w-sm'
          />
        </div>

        <div className='flex gap-2'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Lọc theo trạng thái' />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className='text-muted-foreground text-sm'>
        Hiển thị {filteredSchedules.length} trong {harvestSchedules.length} lịch
        thu hoạch
      </div>

      {/* Harvest Schedules Grid */}
      {filteredSchedules.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <div className='text-muted-foreground mb-2'>
            Không tìm thấy lịch thu hoạch nào
          </div>
          <div className='text-muted-foreground text-sm'>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </div>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredSchedules.map((schedule) => (
            <HarvestScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  );
}
