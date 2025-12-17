'use client';

import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false
});
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), {
  ssr: false
});
const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
);
import type { Icon, Map as LeafletMap } from 'leaflet';
import { io } from 'socket.io-client';
import { fetchDeliveryById } from '@/services/delivery.service';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { FileUploader } from '@/components/file-uploader';
import { Modal } from '@/components/modal';
import { cn } from '@/lib/utils';
import {
  CreateDeliveryDto,
  Delivery,
  DeliveryStatusEnum
} from '@/types/delivery';
import { DeliveryStaff } from '@/types/delivery-staff';
import { OrderPhase, OrderPhaseStatus } from '@/types/order';
import { OrderSchedule } from '@/types/order';
import { Truck } from '@/types/truck';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Package,
  Plus,
  Truck as TruckIcon
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { CreateDeliveryDialog } from './create-delivery-dialog';
import {
  DeliveryStatusBadge,
  DeliveryStatusStepper
} from './delivery-status-stepper';

interface PhaseDetailPaneProps {
  schedule: OrderSchedule | null;
  phases: OrderPhase[];
  phasesLoading: boolean;
  trucks: Truck[];
  trucksLoading: boolean;
  deliveryStaffs: DeliveryStaff[];
  deliveryStaffsLoading: boolean;
  getDeliveryByPhaseId: (phaseId: string) => Delivery | undefined;
  hasDeliveryForPhase: (phaseId: string) => boolean;
  onCreateDelivery: (data: CreateDeliveryDto) => Promise<Delivery | null>;
  onUpdateDeliveryStatus: (
    id: string,
    status: DeliveryStatusEnum
  ) => Promise<Delivery | null>;
  onUploadPhaseImageProof: (
    phaseId: string,
    files: File[]
  ) => Promise<{ paths: string[] } | null>;
  isCreating: boolean;
  loadingUpdateStatusId: string | null;
  uploadingProofPhaseId: string | null;
}

type LatLng = { lat: number; lng: number };

function distanceSq(a: [number, number], b: LatLng) {
  const dx = a[0] - b.lat;
  const dy = a[1] - b.lng;
  return dx * dx + dy * dy;
}

async function fetchRouteOSRM(origin: LatLng, destination: LatLng) {
  const base = (
    process.env.NEXT_PUBLIC_OSRM_URL || 'https://router.project-osrm.org'
  ).replace(/\/$/, '');
  const path = `/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=simplified&geometries=geojson`;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(base + path, { signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const raw = json?.routes?.[0] ?? {};
    const coords: [number, number][] = raw?.geometry?.coordinates ?? [];
    const positions = coords.map(([lng, lat]) => [lat, lng]) as [
      number,
      number
    ][];
    const distanceKm =
      typeof raw?.distance === 'number' ? raw.distance / 1000 : 0;
    const durationMin =
      typeof raw?.duration === 'number' ? Math.round(raw.duration / 60) : 0;
    return { positions, distanceKm, durationMin };
  } catch (e) {
    const positions: [number, number][] = [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    ];
    return { positions, distanceKm: 0, durationMin: 0 };
  } finally {
    clearTimeout(to);
  }
}

function RealtimeMap({
  deliveryId,
  initialStart,
  initialEnd,
  status
}: {
  deliveryId: string;
  initialStart?: LatLng;
  initialEnd?: LatLng;
  status?: DeliveryStatusEnum;
}) {
  const [start, setStart] = useState<LatLng | undefined>(undefined);
  const [end, setEnd] = useState<LatLng | undefined>(undefined);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [pos, setPos] = useState<LatLng | undefined>(undefined);
  const [returning, setReturning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const mapRef = useRef<LeafletMap | null>(null);
  const socket = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return io(base + '/deliveries', { transports: ['websocket'] });
  }, []);
  const [carIcon, setCarIcon] = useState<Icon | undefined>(undefined);
  const [startIcon, setStartIcon] = useState<Icon | undefined>(undefined);
  const [endIcon, setEndIcon] = useState<Icon | undefined>(undefined);

  useEffect(() => {
    if (route.length === 0) return;

    if (status === 'delivered' || status === 'completed') {
      const idx = route.length - 1;
      setCurrentIndex(idx);
      setPos({ lat: route[idx][0], lng: route[idx][1] });
      return;
    }

    if (status === 'returning') {
      setCurrentIndex((prev) => {
        if (prev === 0) {
          setTimeout(() => {
            const [lat, lng] = route[route.length - 1];
            setPos({ lat, lng });
          }, 0);
          return route.length - 1;
        }
        return prev;
      });
    }

    if (status !== 'delivering' && status !== 'returning') return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (status === 'delivering') {
          const next = prev + 1;
          if (next >= route.length) return prev;
          const [lat, lng] = route[next];
          setPos({ lat, lng });
          socket.emit('delivery:update', {
            deliveryId,
            lat,
            lng,
            currentLat: lat,
            currentLng: lng,
            status: 'delivering'
          });
          return next;
        } else {
          const next = prev - 1;
          if (next < 0) return 0;
          const [lat, lng] = route[next];
          setPos({ lat, lng });
          socket.emit('delivery:update', {
            deliveryId,
            lat,
            lng,
            currentLat: lat,
            currentLng: lng,
            status: 'returning'
          });
          return next;
        }
      });
    }, 500);
    return () => clearInterval(timer);
  }, [status, route, socket, deliveryId]);

  useEffect(() => {
    let mounted = true;
    import('leaflet').then(({ default: L }) => {
      if (!mounted) return;
      const url = '/images/longCar.png';
      const warehouseUrl = '/images/warehouse.png';
      setCarIcon(
        L.icon({
          iconUrl: url,
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [40, 40],
          iconAnchor: [20, 35],
          popupAnchor: [0, -35]
        })
      );
      setStartIcon(
        L.icon({
          iconUrl: warehouseUrl,
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      );
      setEndIcon(
        L.icon({
          iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialStart && (!start || !pos)) {
      setStart(initialStart);
      setPos(initialStart);
    }
    if (initialEnd && !end) {
      setEnd(initialEnd);
    }
  }, [initialStart?.lat, initialStart?.lng, initialEnd?.lat, initialEnd?.lng]);

  useEffect(() => {
    const id = String(deliveryId || '').trim();
    if (!id) return;
    fetchDeliveryById(id)
      .then((d) => {
        const sLat = d.startLat ?? undefined;
        const sLng = d.startLng ?? undefined;
        const eLat = d.endLat ?? undefined;
        const eLng = d.endLng ?? undefined;
        if (typeof sLat === 'number' && typeof sLng === 'number') {
          setStart({ lat: sLat, lng: sLng });
          setPos({ lat: sLat, lng: sLng });
          setCurrentIndex(0);
        }
        if (typeof eLat === 'number' && typeof eLng === 'number') {
          setEnd({ lat: eLat, lng: eLng });
        }
      })
      .catch(() => {});
  }, [deliveryId]);

  useEffect(() => {
    if (start && end) {
      fetchRouteOSRM(start, end).then((r) => {
        setRoute(r.positions);
        setCurrentIndex(0);
      });
    } else {
      setRoute([]);
      setCurrentIndex(0);
    }
  }, [start?.lat, start?.lng, end?.lat, end?.lng]);

  useEffect(() => {
    const id = String(deliveryId || '').trim();
    if (!id) return;
    socket.emit('delivery:subscribe', { deliveryId: id });
    const onSub = (p: any) => {};
    const onStart = (p: any) => {
      setStart({ lat: p.startLat, lng: p.startLng });
      setPos({ lat: p.startLat, lng: p.startLng });
      if (Array.isArray(p.route)) setRoute(p.route as [number, number][]);
      setCurrentIndex(0);
    };
    const onUpdate = (p: any) => {
      setPos({ lat: p.lat, lng: p.lng });
      const idx = route.length
        ? route.reduce(
            (best, cur, i) => {
              const d = distanceSq(cur, { lat: p.lat, lng: p.lng });
              return d < best.d ? { i, d } : best;
            },
            { i: 0, d: Number.POSITIVE_INFINITY }
          ).i
        : 0;
      setCurrentIndex(idx);
    };
    const onEnd = (p: any) => {
      setEnd({ lat: p.endLat, lng: p.endLng });
      setPos({ lat: p.endLat, lng: p.endLng });
      setCurrentIndex(Math.max(route.length - 1, 0));
    };
    socket.on('delivery:subscribed', onSub);
    socket.on('delivery:start', onStart);
    socket.on('delivery:update', onUpdate);
    socket.on('delivery:end', onEnd);
    return () => {
      socket.off('delivery:subscribed', onSub);
      socket.off('delivery:start', onStart);
      socket.off('delivery:update', onUpdate);
      socket.off('delivery:end', onEnd);
    };
  }, [socket, deliveryId, route.length]);

  useEffect(() => {
    if (!mapRef.current) return;
    const pts: [number, number][] = [];
    if (start) pts.push([start.lat, start.lng]);
    if (end) pts.push([end.lat, end.lng]);
    if (route && route.length >= 2) {
      pts.push(route[0], route[route.length - 1]);
    }
    if (pts.length >= 2) {
      mapRef.current.fitBounds(pts as any, { padding: [30, 30], maxZoom: 14 });
    }
  }, [start?.lat, start?.lng, end?.lat, end?.lng, route.length]);

  return (
    <>
      {(start || end) && (
        <MapContainer
          center={[
            pos?.lat ?? start?.lat ?? end?.lat ?? 21.0278,
            pos?.lng ?? start?.lng ?? end?.lng ?? 105.8342
          ]}
          zoom={13}
          style={{ height: 320, width: '100%' }}
          scrollWheelZoom
          ref={(m: LeafletMap | null) => {
            mapRef.current = m;
            if (m) {
              const pb = m.createPane('pane-blue');
              const pg = m.createPane('pane-gray');
              if (pb) pb.style.zIndex = '390';
              if (pg) pg.style.zIndex = '391';
            }
          }}
        >
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          {start &&
            (startIcon ? (
              <Marker position={[start.lat, start.lng]} icon={startIcon}>
                <Tooltip direction='top' offset={[0, -12]}>
                  Xuất phát
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[start.lat, start.lng]}>
                <Tooltip direction='top' offset={[0, -12]}>
                  Xuất phát
                </Tooltip>
              </Marker>
            ))}
          {end &&
            (endIcon ? (
              <Marker position={[end.lat, end.lng]} icon={endIcon}>
                <Tooltip direction='top' offset={[0, -12]}>
                  Điểm đến
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[end.lat, end.lng]}>
                <Tooltip direction='top' offset={[0, -12]}>
                  Điểm đến
                </Tooltip>
              </Marker>
            ))}
          {pos &&
            (carIcon ? (
              <Marker position={[pos.lat, pos.lng]} icon={carIcon}>
                <Tooltip direction='top' offset={[0, -20]}>
                  Xe vận tải
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[pos.lat, pos.lng]}>
                <Tooltip direction='top' offset={[0, -20]}>
                  Xe vận tải
                </Tooltip>
              </Marker>
            ))}
          {route.length > 0 &&
            (returning ? (
              <>
                {route.length - currentIndex >= 2 && (
                  <Polyline
                    positions={route.slice(Math.max(currentIndex, 0))}
                    pathOptions={{
                      pane: 'pane-gray',
                      color: '#9ca3af',
                      weight: 6,
                      opacity: 0.95
                    }}
                  />
                )}
                {route.length > 1 && currentIndex > 0 && (
                  <Polyline
                    positions={route.slice(
                      0,
                      Math.min(currentIndex + 1, route.length)
                    )}
                    pathOptions={{
                      pane: 'pane-blue',
                      color: '#2563eb',
                      weight: 5,
                      opacity: 0.95
                    }}
                  />
                )}
              </>
            ) : (
              <>
                {route.length > 1 && currentIndex > 0 && (
                  <Polyline
                    positions={route.slice(
                      0,
                      Math.min(currentIndex + 1, route.length)
                    )}
                    pathOptions={{
                      pane: 'pane-gray',
                      color: '#9ca3af',
                      weight: 6,
                      opacity: 0.95
                    }}
                  />
                )}
                {route.length - currentIndex >= 2 && (
                  <Polyline
                    positions={route.slice(Math.max(currentIndex, 0))}
                    pathOptions={{
                      pane: 'pane-blue',
                      color: '#2563eb',
                      weight: 5,
                      opacity: 0.95
                    }}
                  />
                )}
              </>
            ))}
        </MapContainer>
      )}
    </>
  );
}

const phaseStatusConfig: Record<
  OrderPhaseStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  preparing: { label: 'Chuẩn bị', variant: 'secondary' },
  delivering: { label: 'Đang giao', variant: 'default' },
  delivered: { label: 'Đã giao', variant: 'default' },
  completed: { label: 'Hoàn thành', variant: 'default' },
  canceled: { label: 'Đã hủy', variant: 'destructive' }
};

function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function PhaseCardSkeleton() {
  return (
    <div className='space-y-2 rounded-md border p-3'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-4 w-14' />
      </div>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-8 w-full' />
    </div>
  );
}

function EmptyScheduleState() {
  return (
    <Card className='flex h-full items-center justify-center'>
      <CardContent className='py-10 text-center'>
        <TruckIcon className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
        <h3 className='text-muted-foreground mb-1 text-sm font-medium'>
          Chọn một lịch giao hàng
        </h3>
        <p className='text-muted-foreground mx-auto max-w-xs text-xs'>
          Chọn lịch từ danh sách bên trái để xem đợt giao hàng
        </p>
      </CardContent>
    </Card>
  );
}

export function PhaseDetailPane({
  schedule,
  phases,
  phasesLoading,
  trucks,
  trucksLoading,
  deliveryStaffs,
  deliveryStaffsLoading,
  getDeliveryByPhaseId,
  hasDeliveryForPhase,
  onCreateDelivery,
  onUpdateDeliveryStatus,
  onUploadPhaseImageProof,
  isCreating,
  loadingUpdateStatusId,
  uploadingProofPhaseId
}: PhaseDetailPaneProps) {
  const { toast } = useToast();
  const [selectedPhaseForCreate, setSelectedPhaseForCreate] =
    useState<OrderPhase | null>(null);
  const [deliveryForProof, setDeliveryForProof] = useState<Delivery | null>(
    null
  );
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [submittingProof, setSubmittingProof] = useState(false);

  if (!schedule) {
    return <EmptyScheduleState />;
  }

  const handleCreateDelivery = async (data: CreateDeliveryDto) => {
    const result = await onCreateDelivery(data);
    if (result) {
      setSelectedPhaseForCreate(null);
    }
  };

  const handleDeliveryStatusChange = async (
    delivery: Delivery,
    status: DeliveryStatusEnum
  ) => {
    if (status === 'delivered') {
      setDeliveryForProof(delivery);
      setProofFiles([]);
      return;
    }
    await onUpdateDeliveryStatus(delivery.id, status);
  };

  const closeProofModal = () => {
    setDeliveryForProof(null);
    setProofFiles([]);
    setSubmittingProof(false);
  };

  const handleConfirmProofUpload = async () => {
    if (!deliveryForProof) return;
    if (!proofFiles.length) {
      toast({
        title: 'Thiếu hình ảnh',
        description: 'Vui lòng tải lên hình ảnh xác nhận trước khi tiếp tục',
        variant: 'destructive'
      });
      return;
    }

    const phaseId = deliveryForProof.orderPhase?.id;
    if (!phaseId) {
      toast({
        title: 'Không tìm thấy đợt giao hàng',
        description: 'Không thể xác định đợt giao hàng để tải minh chứng',
        variant: 'destructive'
      });
      return;
    }

    setSubmittingProof(true);
    const uploaded = await onUploadPhaseImageProof(phaseId, proofFiles);
    if (uploaded) {
      await onUpdateDeliveryStatus(deliveryForProof.id, 'delivered');
      closeProofModal();
    } else {
      setSubmittingProof(false);
    }
  };

  return (
    <>
      <Card className='flex h-full flex-col gap-0'>
        <CardHeader className='flex-shrink-0 px-4 py-3'>
          {/* Schedule Header */}
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='mb-0.5 flex items-center gap-1.5'>
                <span className='text-muted-foreground font-mono text-[10px]'>
                  #{schedule.id.slice(0, 11).toUpperCase()}
                </span>
                <Badge
                  variant={
                    schedule.status === 'processing' ? 'default' : 'secondary'
                  }
                  className='px-1.5 py-0 text-[10px]'
                >
                  {schedule.status}
                </Badge>
              </div>
              <CardTitle className='text-base'>
                {schedule.consignee?.organizationName || 'Lịch giao hàng'}
              </CardTitle>
              {schedule.description && (
                <CardDescription className='mt-0.5 text-xs'>
                  {schedule.description}
                </CardDescription>
              )}
            </div>
          </div>

          {/* Schedule Meta */}
          <div className='text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs'>
            {schedule.deliveryDate && (
              <span className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {formatDate(schedule.deliveryDate)}
              </span>
            )}
            {schedule.address && (
              <span className='flex items-center gap-1'>
                <MapPin className='h-3 w-3' />
                {schedule.address}
              </span>
            )}
          </div>

          {/* Products summary */}
          {schedule.orderDetails && schedule.orderDetails.length > 0 && (
            <div className='bg-muted/50 mt-2 rounded-md p-2'>
              <h4 className='mb-1 flex items-center gap-1 text-xs font-medium'>
                <Package className='h-3 w-3' />
                Sản phẩm ({schedule.orderDetails.length})
              </h4>
              <div className='flex flex-wrap gap-1'>
                {schedule.orderDetails.map((detail, idx) => (
                  <Badge
                    key={detail.id || idx}
                    variant='outline'
                    className='px-1.5 py-0 text-[10px]'
                  >
                    {(detail as any)?.product?.name || 'Sản phẩm'} -{' '}
                    {detail.quantity} {detail.unit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>

        <Separator />

        <CardContent className='flex-1 overflow-y-auto px-4 py-3'>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='flex items-center gap-1.5 text-sm font-medium'>
              <FileText className='h-3.5 w-3.5' />
              Các đợt giao hàng ({phases.length})
            </h3>
          </div>

          {phasesLoading ? (
            <div className='space-y-1.5'>
              {Array.from({ length: 3 }).map((_, i) => (
                <PhaseCardSkeleton key={i} />
              ))}
            </div>
          ) : phases.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Clock className='text-muted-foreground/50 mb-2 h-10 w-10' />
              <p className='text-muted-foreground text-xs'>
                Chưa có đợt giao hàng nào cho lịch này
              </p>
            </div>
          ) : (
            <Accordion type='multiple' className='space-y-1.5'>
              {phases.map((phase) => {
                const hasDelivery = hasDeliveryForPhase(phase.id);
                const delivery = getDeliveryByPhaseId(phase.id);
                const phaseStatus = phase.status || 'preparing';

                return (
                  <AccordionItem
                    key={phase.id}
                    value={phase.id}
                    className='bg-card rounded-md border'
                  >
                    <AccordionTrigger className='hover:bg-accent cursor-pointer px-3 py-2 hover:no-underline'>
                      <div className='flex flex-1 items-center justify-between gap-2 pr-1'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full text-xs',
                              hasDelivery
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {hasDelivery ? (
                              <CheckCircle2 className='h-3.5 w-3.5' />
                            ) : (
                              <span className='text-xs font-semibold'>
                                {phase.phaseNumber}
                              </span>
                            )}
                          </div>
                          <div className='text-left'>
                            <p className='text-sm font-medium'>
                              Đợt {phase.phaseNumber}
                            </p>
                            <p className='text-muted-foreground line-clamp-1 text-[10px]'>
                              {phase.description ||
                                `Đợt giao hàng số ${phase.phaseNumber}`}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          {hasDelivery ? (
                            <DeliveryStatusBadge status={delivery?.status} />
                          ) : (
                            <Badge
                              variant={
                                phaseStatusConfig[phaseStatus]?.variant ||
                                'outline'
                              }
                              className='px-1.5 py-0 text-[10px]'
                            >
                              {phaseStatusConfig[phaseStatus]?.label ||
                                phaseStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className='px-3 pb-3'>
                      <div className='space-y-2'>
                        {/* Phase products */}
                        {phase.orderInvoiceDetails &&
                          phase.orderInvoiceDetails.length > 0 && (
                            <div className='bg-muted/30 rounded-md p-2'>
                              <h5 className='mb-1 flex items-center gap-1 text-xs font-medium'>
                                <Package className='h-3 w-3' />
                                Sản phẩm
                              </h5>
                              <div className='space-y-0.5'>
                                {phase.orderInvoiceDetails.map(
                                  (detail, idx) => (
                                    <div
                                      key={detail.id || idx}
                                      className='flex items-center justify-between text-xs'
                                    >
                                      <span>
                                        {detail.product?.name || 'Sản phẩm'}
                                      </span>
                                      <span className='font-medium'>
                                        {detail.quantity} {detail.unit}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Delivery info or Create button */}
                        {hasDelivery && delivery ? (
                          <div className='space-y-2'>
                            {/* Delivery details */}
                            <div className='rounded-md border p-2'>
                              <h5 className='mb-2 flex items-center gap-1 text-xs font-medium'>
                                <TruckIcon className='h-3 w-3' />
                                Thông tin chuyến giao
                              </h5>

                              <div className='grid gap-1.5 text-xs'>
                                {delivery.truck && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Xe:
                                    </span>
                                    <span className='font-medium'>
                                      {delivery.truck.licensePlate}
                                    </span>
                                  </div>
                                )}
                                {delivery.startAddress && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Điểm đi:
                                    </span>
                                    <span className='truncate text-[10px]'>
                                      {delivery.startAddress}
                                    </span>
                                  </div>
                                )}
                                {delivery.endAddress && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Điểm đến:
                                    </span>
                                    <span className='truncate text-[10px]'>
                                      {delivery.endAddress}
                                    </span>
                                  </div>
                                )}
                                {delivery.startTime && (
                                  <div className='flex items-center justify-between'>
                                    <span className='text-muted-foreground'>
                                      Bắt đầu:
                                    </span>
                                    <span>
                                      {formatDateTime(delivery.startTime)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Map */}
                            {delivery && (
                              <RealtimeMap
                                deliveryId={delivery.id}
                                initialStart={
                                  delivery.startLat && delivery.startLng
                                    ? {
                                        lat: delivery.startLat,
                                        lng: delivery.startLng
                                      }
                                    : undefined
                                }
                                initialEnd={
                                  delivery.endLat && delivery.endLng
                                    ? {
                                        lat: delivery.endLat,
                                        lng: delivery.endLng
                                      }
                                    : undefined
                                }
                                status={delivery.status ?? undefined}
                              />
                            )}
                            <div className='rounded-md border p-2'>
                              <h5 className='mb-2 flex items-center gap-1 text-xs font-medium'>
                                <FileText className='h-3 w-3' />
                                Minh chứng giao hàng
                              </h5>

                              <div className='grid gap-1.5 text-xs'>
                                {phase.imageProof?.length && (
                                  <p className='text-muted-foreground'>
                                    {phase.imageProof?.length} hình ảnh
                                  </p>
                                )}
                                <div className='grid grid-cols-5 gap-2'>
                                  {phase.imageProof?.map((proof) => (
                                    <div
                                      className='flex items-center gap-1'
                                      key={proof.id}
                                    >
                                      <Image
                                        src={proof.photo?.path || ''}
                                        alt={proof.photo?.id || ''}
                                        width={80}
                                        height={80}
                                        className='h-full w-full rounded-md object-cover'
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Status stepper */}
                            <div className='rounded-md border p-2'>
                              <h5 className='mb-2 flex items-center gap-1 text-xs font-medium'>
                                <Clock className='h-3 w-3' />
                                Trạng thái
                              </h5>
                              <DeliveryStatusStepper
                                currentStatus={delivery.status}
                                onStatusChange={(status) =>
                                  handleDeliveryStatusChange(delivery, status)
                                }
                                isLoading={
                                  loadingUpdateStatusId === delivery.id ||
                                  uploadingProofPhaseId ===
                                    delivery.orderPhase?.id
                                }
                                canUpdate={true}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className='py-2 text-center'>
                            <p className='text-muted-foreground mb-2 text-xs'>
                              Đợt này chưa có chuyến giao hàng
                            </p>
                            <Button
                              size='sm'
                              onClick={() => setSelectedPhaseForCreate(phase)}
                              className='h-8 w-full'
                            >
                              <Plus className='mr-1.5 h-3.5 w-3.5' />
                              Tạo chuyến giao hàng
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Create Delivery Dialog */}
      {selectedPhaseForCreate && (
        <CreateDeliveryDialog
          open={!!selectedPhaseForCreate}
          onOpenChange={(open) => {
            if (!open) setSelectedPhaseForCreate(null);
          }}
          schedule={schedule}
          phase={selectedPhaseForCreate}
          trucks={trucks}
          trucksLoading={trucksLoading}
          deliveryStaffs={deliveryStaffs}
          deliveryStaffsLoading={deliveryStaffsLoading}
          onSubmit={handleCreateDelivery}
          isSubmitting={isCreating}
        />
      )}

      {/* Upload proof before marking delivered */}
      <Modal
        title='Tải minh chứng giao hàng'
        description='Vui lòng tải lên hình ảnh minh chứng trước khi chuyển trạng thái sang Đã giao.'
        isOpen={!!deliveryForProof}
        onClose={closeProofModal}
        footer={
          <div className='flex w-full justify-end gap-2'>
            <Button variant='outline' size='sm' onClick={closeProofModal}>
              Hủy
            </Button>
            <Button
              size='sm'
              onClick={handleConfirmProofUpload}
              disabled={
                submittingProof ||
                !!(
                  deliveryForProof?.orderPhase?.id &&
                  uploadingProofPhaseId === deliveryForProof.orderPhase.id
                )
              }
            >
              {submittingProof ? 'Đang tải...' : 'Xác nhận và cập nhật'}
            </Button>
          </div>
        }
      >
        <div className='space-y-3'>
          <FileUploader
            value={proofFiles}
            onValueChange={(files) => setProofFiles(files)}
            accept={{ 'image/*': [] }}
            maxFiles={5}
            multiple
          />
          <p className='text-muted-foreground text-xs'>
            Chỉ chuyển trạng thái sang Đã giao khi đã tải hình ảnh minh chứng
            (tối đa 5 ảnh).
          </p>
        </div>
      </Modal>
    </>
  );
}
