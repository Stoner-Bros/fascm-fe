'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTemperature } from '@tabler/icons-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

type Props = {
  id: string;
  type?: string | null;
  status?: string | null;
  lastDataTime?: string | null;
  data?: any;
  locationLabel?: string;
};

function normalizeStatus(
  s?: string | null
): 'online' | 'offline' | 'warning' | 'error' {
  const v = String(s ?? '').toLowerCase();
  if (v === 'active' || v === 'online') return 'online';
  if (v === 'inactive' || v === 'offline') return 'offline';
  if (v === 'warning') return 'warning';
  if (v === 'error') return 'error';
  return 'offline';
}

function getDeviceIcon(type?: string | null) {
  const t = String(type ?? '').toLowerCase();
  switch (t) {
    case 'temperature - humidity':
    case 'temperature':
    case 'humidity':
    default:
      return IconTemperature;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'online':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    case 'offline':
    default:
      return 'text-gray-500';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'online':
      return <Badge className='bg-green-100 text-green-800'>Hoạt động</Badge>;
    case 'warning':
      return <Badge className='bg-yellow-100 text-yellow-800'>Cảnh báo</Badge>;
    case 'error':
      return <Badge className='bg-red-100 text-red-800'>Lỗi</Badge>;
    case 'offline':
    default:
      return <Badge className='bg-gray-100 text-gray-800'>Offline</Badge>;
  }
}

function formatLastUpdate(t?: string | null): string {
  const iso = String(t ?? '').trim();
  if (!iso) return 'N/A';
  try {
    return `${formatDistanceToNow(parseISO(iso), { addSuffix: true })}`;
  } catch {
    return iso;
  }
}

function parseDeviceData(data: any): {
  temperature?: number;
  humidity?: number;
} {
  try {
    if (typeof data === 'string' && data.trim().length > 0) {
      const obj = JSON.parse(data);
      return {
        temperature: obj.temperature ?? obj.temp ?? obj.t,
        humidity: obj.humidity ?? obj.humid ?? obj.h
      };
    }
    if (Array.isArray(data)) {
      const last = data[data.length - 1];
      return {
        temperature: last?.temperature ?? last?.temp ?? last?.t,
        humidity: last?.humidity ?? last?.humid ?? last?.h
      };
    }
    if (typeof data === 'object' && data) {
      return {
        temperature: data.temperature ?? data.temp ?? data.t,
        humidity: data.humidity ?? data.humid ?? data.h
      };
    }
  } catch {}
  return {};
}

export default function IotDeviceCard(props: Props) {
  const status = normalizeStatus(props.status);
  const IconComponent = getDeviceIcon(props.type);
  const metrics = parseDeviceData(props.data);
  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        status === 'warning'
          ? 'border-yellow-300'
          : status === 'error'
            ? 'border-red-300'
            : status === 'online'
              ? 'border-green-300'
              : 'border-gray-200'
      }`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`rounded-lg p-2 ${
                status === 'online'
                  ? 'bg-green-100'
                  : status === 'warning'
                    ? 'bg-yellow-100'
                    : status === 'error'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${getStatusColor(status)}`} />
            </div>
            <div>
              <CardTitle className='text-lg'>{props.id}</CardTitle>
              <div className='text-muted-foreground text-xs'>
                {props.type ?? 'Sensor'}
              </div>
            </div>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-lg border p-3 text-center'>
            <div className='text-muted-foreground text-xs'>Nhiệt độ</div>
            <div className='text-2xl font-bold'>
              {metrics.temperature != null ? `${metrics.temperature}°C` : '--'}
            </div>
          </div>
          <div className='rounded-lg border p-3 text-center'>
            <div className='text-muted-foreground text-xs'>Độ ẩm</div>
            <div className='text-2xl font-bold'>
              {metrics.humidity != null ? `${metrics.humidity}%` : '--'}
            </div>
          </div>
        </div>
        <div className='text-muted-foreground flex items-center justify-between text-xs'>
          <div>Cập nhật: {formatLastUpdate(props.lastDataTime ?? '')}</div>
          <div>{props.locationLabel ?? ''}</div>
        </div>
      </CardContent>
    </Card>
  );
}
