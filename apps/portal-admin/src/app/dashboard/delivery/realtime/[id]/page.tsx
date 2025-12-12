'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useParams } from 'next/navigation';
import {
  fetchDeliveryById,
  updateDeliveryStatus
} from '@/services/delivery.service';
import { Delivery } from '@/types';
import PageContainer from '@/components/layout/page-container';
type LatLng = { lat: number; lng: number };

function distanceSq(a: [number, number], b: LatLng) {
  const dx = a[0] - b.lat;
  const dy = a[1] - b.lng;
  return dx * dx + dy * dy;
}

async function fetchRouteOSRM(origin: LatLng, destination: LatLng) {
  const base = 'https://router.project-osrm.org';
  const path = `/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const res = await fetch(base + path);
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
}

export default function DeliveryDetailPage() {
  const params = useParams<{ id: string }>();
  const deliveryId = String(params?.id ?? '');

  const [selected, setSelected] = useState<Delivery | null>(null);
  const [orderId, setOrderId] = useState('');
  const [start, setStart] = useState<LatLng | undefined>(undefined);
  const [end, setEnd] = useState<LatLng | undefined>(undefined);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationMin, setDurationMin] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [returning, setReturning] = useState<boolean>(false);
  const [pos, setPos] = useState<LatLng | undefined>(undefined);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const socket = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return io(base + '/deliveries', {
      transports: ['websocket']
    });
  }, []);

  const [carIcon, setCarIcon] = useState<Icon | undefined>(undefined);
  const [startIcon, setStartIcon] = useState<Icon | undefined>(undefined);
  const [endIcon, setEndIcon] = useState<Icon | undefined>(undefined);

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
    if (start && end) {
      fetchRouteOSRM(start, end).then((r) => {
        setRoute(r.positions);
        setDistanceKm(r.distanceKm);
        setDurationMin(r.durationMin);
        setProgress(0);
        setCurrentIndex(0);
      });
    } else {
      setRoute([]);
      setDistanceKm(0);
      setDurationMin(0);
      setProgress(0);
      setCurrentIndex(0);
    }
  }, [start?.lat, start?.lng, end?.lat, end?.lng]);

  useEffect(() => {
    const id = deliveryId.trim();
    if (!id) return;
    fetchDeliveryById(id)
      .then((d) => {
        setSelected(d);
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
        if (d.orderPhase?.id) {
          setOrderId(d.orderPhase.id);
        }
        const status = String(d.status ?? '').toUpperCase();
        if (status === 'COMPLETED' || status === 'DELIVERED') {
          if (typeof eLat === 'number' && typeof eLng === 'number') {
            setPos({ lat: eLat, lng: eLng });
            setCurrentIndex(Math.max(route.length - 1, 0));
          }
        }
      })
      .catch(() => {});
  }, [deliveryId]);

  useEffect(() => {
    const id = deliveryId.trim();
    if (!id) return;
    socket.emit('delivery:subscribe', { deliveryId: id });
    const onSub = (p: any) => {};
    const onStart = async (p: any) => {
      setStart({ lat: p.startLat, lng: p.startLng });
      setPos({ lat: p.startLat, lng: p.startLng });
      if (Array.isArray(p.route)) setRoute(p.route as [number, number][]);
      if (typeof p.orderId === 'string') setOrderId(p.orderId);
      try {
        await updateDeliveryStatus(id, 'delivering');
        const d = await fetchDeliveryById(id);
        setSelected(d);
      } catch {}
      setProgress(0);
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
    const onEnd = async (p: any) => {
      setEnd({ lat: p.endLat, lng: p.endLng });
      setPos({ lat: p.endLat, lng: p.endLng });
      try {
        await updateDeliveryStatus(id, 'delivered');
        const d = await fetchDeliveryById(id);
        setSelected(d);
      } catch {}
      setProgress(100);
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
  }, [socket, deliveryId]);

  const startTrip = async () => {
    if (!deliveryId || !start) return;
    setPos(start);
    setRunning(false);
    socket.emit('delivery:start', {
      deliveryId,
      orderId: orderId || undefined,
      startLat: start.lat,
      startLng: start.lng,
      startTime: new Date().toISOString(),
      route: route
    });
    try {
      await updateDeliveryStatus(deliveryId, 'delivering');
      const d = await fetchDeliveryById(deliveryId);
      setSelected(d);
    } catch {}
    setProgress(0);
    setCurrentIndex(0);
  };

  const simulate = async () => {
    if (route.length < 2 || !deliveryId) return;
    setRunning(true);
    let i = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(async () => {
      if (i >= route.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setProgress(100);
        setCurrentIndex(Math.max(route.length - 1, 0));
        try {
          await updateDeliveryStatus(deliveryId, 'delivered');
          const d = await fetchDeliveryById(deliveryId);
          setSelected(d);
        } catch {}
        return;
      }
      const [lat, lng] = route[i];
      setPos({ lat, lng });
      setCurrentIndex(i);
      socket.emit('delivery:update', {
        deliveryId,
        lat,
        lng,
        timestamp: new Date().toISOString()
      });
      const pct =
        route.length > 1 ? Math.round((i / (route.length - 1)) * 100) : 0;
      setProgress(pct);
      i += 1;
    }, 1000);
    try {
      await updateDeliveryStatus(deliveryId, 'delivering');
      const d = await fetchDeliveryById(deliveryId);
      setSelected(d);
    } catch {}
  };

  const endTrip = async () => {
    if (!deliveryId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    const finalEnd = end || pos || start;
    if (finalEnd) {
      socket.emit('delivery:end', {
        deliveryId,
        endLat: finalEnd.lat,
        endLng: finalEnd.lng,
        endTime: new Date().toISOString()
      });
    }
    try {
      await updateDeliveryStatus(deliveryId, 'delivered');
      const d = await fetchDeliveryById(deliveryId);
      setSelected(d);
    } catch {}
    setProgress(100);
    setCurrentIndex(Math.max(route.length - 1, 0));
  };

  const returnTrip = async () => {
    if (!deliveryId || !start || route.length < 2) return;
    const reversed = [...route].reverse();
    setReturning(true);
    setRunning(true);
    let i = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      if (String(selected?.status ?? '').toLowerCase() !== 'delivered') {
        await updateDeliveryStatus(deliveryId, 'delivered');
        const d1 = await fetchDeliveryById(deliveryId);
        setSelected(d1);
      }
      await updateDeliveryStatus(deliveryId, 'returning');
      const d2 = await fetchDeliveryById(deliveryId);
      setSelected(d2);
    } catch {}
    timerRef.current = setInterval(async () => {
      if (i >= reversed.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setReturning(false);
        setProgress(100);
        setCurrentIndex(0);
        try {
          await updateDeliveryStatus(deliveryId, 'completed');
          const d = await fetchDeliveryById(deliveryId);
          setSelected(d);
        } catch {}
        return;
      }
      const [lat, lng] = reversed[i];
      setPos({ lat, lng });
      setCurrentIndex(Math.max(reversed.length - 1 - i, 0));
      socket.emit('delivery:update', {
        deliveryId,
        lat,
        lng,
        timestamp: new Date().toISOString()
      });
      const pct =
        reversed.length > 1 ? Math.round((i / (reversed.length - 1)) * 100) : 0;
      setProgress(pct);
      i += 1;
    }, 1000);
  };

  const finishTrip = async () => {
    if (!deliveryId || !start) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setReturning(false);
    setPos(start);
    setCurrentIndex(0);
    setProgress(0);
    try {
      const cur = String(selected?.status ?? '').toLowerCase();
      if (cur === 'delivering') {
        await updateDeliveryStatus(deliveryId, 'delivered');
      }
      let d1 = await fetchDeliveryById(deliveryId);
      setSelected(d1);
      if (String(d1.status ?? '').toLowerCase() !== 'returning') {
        await updateDeliveryStatus(deliveryId, 'returning');
      }
      let attempts = 0;
      while (attempts < 3) {
        const d = await fetchDeliveryById(deliveryId);
        setSelected(d);
        if (String(d.status ?? '').toLowerCase() === 'returning') break;
        await new Promise((r) => setTimeout(r, 400));
        attempts += 1;
      }
      await updateDeliveryStatus(deliveryId, 'completed');
      const d2 = await fetchDeliveryById(deliveryId);
      setSelected(d2);
    } catch {}
  };

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
    <PageContainer>
      <div className='space-y-4 p-4'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <div className='rounded border p-3'>
            <div className='text-muted-foreground text-xs'>Tiến độ</div>
            <div className='text-sm font-medium'>{progress}%</div>
          </div>
          <div className='rounded border p-3'>
            <div className='text-muted-foreground text-xs'>Quãng đường</div>
            <div className='text-sm font-medium'>
              {distanceKm > 0 ? `${distanceKm.toFixed(1)} km` : '-'}
            </div>
          </div>
          <div className='rounded border p-3'>
            <div className='text-muted-foreground text-xs'>
              Thời gian dự kiến
            </div>
            <div className='text-sm font-medium'>
              {durationMin > 0 ? `${durationMin} phút` : '-'}
            </div>
          </div>
        </div>
        {start && end && route.length > 0 && (
          <MapContainer
            center={[start?.lat ?? 21.0278, start?.lng ?? 105.8342]}
            zoom={13}
            style={{ height: 420, width: '100%' }}
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
            {returning ? (
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
            )}
          </MapContainer>
        )}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-md border p-4 sm:col-span-2'>
            <div className='mb-2 flex items-center justify-between'>
              <div className='text-sm'>Chi tiết Delivery</div>
            </div>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <div className='rounded border p-3'>
                <div className='text-muted-foreground text-xs'>Delivery ID</div>
                <div className='text-sm font-medium'>{selected?.id ?? '-'}</div>
              </div>
              <div className='rounded border p-3'>
                <div className='text-muted-foreground text-xs'>
                  Harvester ID
                </div>
                <div className='text-sm font-medium'>
                  {selected?.harvestPhase?.id ?? '-'}
                </div>
              </div>
              <div className='rounded border p-3'>
                <div className='text-muted-foreground text-xs'>
                  Order Schedule
                </div>
                <div className='text-sm font-medium'>
                  {selected?.orderPhase?.id ?? '-'}
                </div>
              </div>
              <div className='rounded border p-3'>
                <div className='text-muted-foreground text-xs'>Trạng thái</div>
                <div className='text-sm font-medium'>
                  {selected?.status || '-'}
                </div>
              </div>
              <div className='rounded border p-3'>
                <div className='text-muted-foreground text-xs'>Bắt đầu</div>
                <div className='text-sm font-medium'>
                  {selected?.startTime ?? '-'}
                </div>
              </div>
              <div className='rounded border p-3'>
                <div className='text-muted-foreground text-xs'>Kết thúc</div>
                <div className='text-sm font-medium'>
                  {selected?.endTime ?? '-'}
                </div>
              </div>
            </div>
          </div>
          <div className='rounded-md border p-4'>
            <label className='text-sm'>Actions</label>
            {(() => {
              const statusLower = String(selected?.status ?? '').toLowerCase();
              const startEnabled =
                !!start &&
                statusLower !== 'delivering' &&
                statusLower !== 'delivered' &&
                statusLower !== 'returning' &&
                statusLower !== 'completed';
              const simulateEnabled =
                statusLower === 'delivering' && !running && route.length >= 2;
              const endEnabled = statusLower === 'delivering';
              const returnEnabled =
                statusLower === 'delivered' &&
                !running &&
                !returning &&
                route.length >= 2;
              const finishEnabled = statusLower === 'returning';

              const steps = [
                {
                  key: 'start',
                  label: 'Bắt đầu',
                  action: startTrip,
                  enabled: startEnabled,
                  state:
                    statusLower === ''
                      ? 'pending'
                      : [
                            'delivering',
                            'delivered',
                            'returning',
                            'completed'
                          ].includes(statusLower)
                        ? 'completed'
                        : 'pending'
                },
                {
                  key: 'simulate',
                  label: 'Giả lập',
                  action: simulate,
                  enabled: simulateEnabled,
                  state:
                    statusLower === 'delivering'
                      ? running
                        ? 'in_progress'
                        : 'pending'
                      : ['delivered', 'returning', 'completed'].includes(
                            statusLower
                          )
                        ? 'completed'
                        : 'pending'
                },
                {
                  key: 'end',
                  label: 'Kết thúc',
                  action: endTrip,
                  enabled: endEnabled,
                  state:
                    statusLower === 'delivering'
                      ? !running
                        ? 'pending'
                        : 'pending'
                      : ['delivered', 'returning', 'completed'].includes(
                            statusLower
                          )
                        ? 'completed'
                        : 'pending'
                },
                {
                  key: 'return',
                  label: 'Quay về kho',
                  action: returnTrip,
                  enabled: returnEnabled,
                  state:
                    statusLower === 'returning'
                      ? returning || running
                        ? 'in_progress'
                        : 'completed'
                      : statusLower === 'delivered'
                        ? 'pending'
                        : statusLower === 'completed'
                          ? 'completed'
                          : 'pending'
                },
                {
                  key: 'finish',
                  label: 'Kết thúc hành trình',
                  action: finishTrip,
                  enabled: finishEnabled,
                  state:
                    statusLower === 'completed'
                      ? 'completed'
                      : statusLower === 'returning'
                        ? 'pending'
                        : 'pending'
                }
              ] as const;

              const firstPending = steps.findIndex(
                (s) => s.state === 'pending' || s.state === 'in_progress'
              );
              const activeIndex =
                firstPending >= 0 ? firstPending : steps.length - 1;

              return (
                <div className='mt-2 space-y-3'>
                  <div className='flex items-center gap-2'>
                    {steps.map((s, i) => (
                      <div
                        key={s.key}
                        className={`flex items-center gap-2 ${i < steps.length - 1 ? '' : ''}`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                            s.state === 'completed'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : i === activeIndex
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-200 bg-gray-100 text-gray-700'
                          }`}
                        >
                          {i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div className='mx-1 h-px w-8 bg-gray-300' />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className='space-y-2'>
                    {steps.map((s, i) => (
                      <div key={s.key} className='rounded border p-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='text-sm font-medium'>{s.label}</div>
                            <span
                              className={`rounded px-2 py-0.5 text-xs ${
                                s.state === 'completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : s.state === 'in_progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {s.state === 'completed'
                                ? 'Hoàn thành'
                                : s.state === 'in_progress'
                                  ? 'Đang thực hiện'
                                  : 'Chờ thực hiện'}
                            </span>
                          </div>
                          <button
                            className={`rounded border px-3 py-1 text-sm ${
                              s.enabled ? '' : 'cursor-not-allowed opacity-50'
                            }`}
                            disabled={!s.enabled}
                            onClick={s.action}
                          >
                            Thực hiện
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
