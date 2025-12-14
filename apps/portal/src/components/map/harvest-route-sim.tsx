'use client';

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap
} from 'react-leaflet';
import type { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  fetchDeliveryById,
  fetchDeliveriesByHarvestSchedule
} from '@/services/delivery.service';
import { updateHarvestScheduleStatus } from '@/services/harvest-schedule.service';
import {
  IconMapPin,
  IconTruck,
  IconClock,
  IconRoute
} from '@tabler/icons-react';

type LatLng = { lat: number; lng: number };

function normalizeAddress(text?: string | null): string | undefined {
  if (!text) return undefined;
  const t = String(text).replace(/\s+/g, ' ').trim();
  const placeholders = ['Địa chỉ khách hàng', 'Địa chỉ giao hàng', 'Địa chỉ'];
  if (!t || placeholders.includes(t)) return undefined;
  return t;
}

function FitBounds({
  from,
  to,
  route
}: {
  from?: LatLng;
  to?: LatLng;
  route: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [];
    if (from) pts.push([from.lat, from.lng]);
    if (to) pts.push([to.lat, to.lng]);
    if (route && route.length >= 2) {
      pts.push(route[0], route[route.length - 1]);
    }
    if (pts.length >= 2) {
      map.fitBounds(pts as [number, number][], {
        padding: [40, 40],
        maxZoom: 14
      });
    }
  }, [map, from?.lat, from?.lng, to?.lat, to?.lng, route.length]);
  return null;
}

async function geocode(text: string): Promise<LatLng | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=jsonv2&countrycodes=vn&limit=1&accept-language=vi`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (!item) return null;
    return { lat: Number(item.lat), lng: Number(item.lon) };
  } catch {
    return null;
  }
}

async function fetchRoute(
  from: LatLng,
  to: LatLng,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<{
  coords: [number, number][];
  distance: number;
  duration: number;
} | null> {
  try {
    const base = 'https://router.project-osrm.org';
    const path = `/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(base + path);
    const json = await res.json();
    const route = json?.routes?.[0];
    if (!route) return null;
    const coords: [number, number][] = route.geometry.coordinates ?? [];
    return {
      coords: coords.map(([lng, lat]: [number, number]) => [lat, lng]),
      distance: route.distance ?? 0,
      duration: route.duration ?? 0
    };
  } catch {
    return null;
  }
}

export default function HarvestRouteSim({
  cargo,
  startAddress,
  endAddress,
  productName,
  deliveryId,
  harvestScheduleId,
  startLat,
  startLng,
  endLat,
  endLng
}: {
  cargo: string;
  startAddress?: string;
  endAddress?: string;
  productName?: string;
  deliveryId?: string;
  harvestScheduleId?: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
}) {
  const [from, setFrom] = useState<LatLng | undefined>(undefined);
  const [to, setTo] = useState<LatLng | undefined>(undefined);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeOsrm, setRouteOsrm] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [running] = useState<boolean>(true);
  const [idx, setIdx] = useState<number>(0);
  const [subT, setSubT] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [carIcon, setCarIcon] = useState<Icon | undefined>(undefined);
  const [startIcon, setStartIcon] = useState<Icon | undefined>(undefined);
  const [endIcon, setEndIcon] = useState<Icon | undefined>(undefined);

  const [pos, setPos] = useState<LatLng | undefined>(undefined);
  const [startPos, setStartPos] = useState<LatLng | undefined>(undefined);
  const [endPos, setEndPos] = useState<LatLng | undefined>(undefined);
  const [autoDeliveryId, setAutoDeliveryId] = useState<string>('');
  const activeDeliveryId = (deliveryId ?? '').trim() || autoDeliveryId;
  const [startAddr, setStartAddr] = useState<string | undefined>(
    normalizeAddress(startAddress)
  );
  const [endAddr, setEndAddr] = useState<string | undefined>(
    normalizeAddress(endAddress)
  );

  const socket = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return io(base + '/deliveries', { transports: ['websocket'] });
  }, []);

  useEffect(() => {
    let mounted = true;
    import('leaflet').then(({ default: L }) => {
      if (!mounted) return;
      setCarIcon(
        L.icon({
          iconUrl: '/images/longCar.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [40, 40],
          iconAnchor: [20, 35],
          popupAnchor: [0, -35]
        })
      );
      setStartIcon(
        L.icon({
          iconUrl: '/images/warehouse.png',
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
    if (activeDeliveryId) return;
    if (typeof startLat === 'number' && typeof startLng === 'number') {
      setFrom({ lat: startLat, lng: startLng });
    }
    if (typeof endLat === 'number' && typeof endLng === 'number') {
      setTo({ lat: endLat, lng: endLng });
    }
  }, [startLat, startLng, endLat, endLng, activeDeliveryId]);

  useEffect(() => {
    if (activeDeliveryId) return;
    if (
      typeof startLat === 'number' ||
      typeof startLng === 'number' ||
      typeof endLat === 'number' ||
      typeof endLng === 'number'
    ) {
      return;
    }
    let mounted = true;
    const sAddr = normalizeAddress(startAddress);
    const eAddr = normalizeAddress(endAddress);
    if (sAddr) {
      geocode(sAddr).then((p) => {
        if (!mounted) return;
        if (p) setFrom(p);
      });
    }
    if (eAddr) {
      geocode(eAddr).then((p) => {
        if (!mounted) return;
        if (p) setTo(p);
      });
    }
    return () => {
      mounted = false;
    };
  }, [
    startAddress,
    endAddress,
    activeDeliveryId,
    startLat,
    startLng,
    endLat,
    endLng
  ]);

  useEffect(() => {
    if (activeDeliveryId) return;
    let mounted = true;
    if (!from || !to) return;
    fetchRoute(from, to, 'driving').then((r) => {
      if (!mounted) return;
      if (r) {
        setRoute(r.coords);
        setRouteOsrm(r.coords);
        setDistance(r.distance);
        setDuration(r.duration);
        setIdx(0);
      }
    });
    return () => {
      mounted = false;
    };
  }, [from?.lat, from?.lng, to?.lat, to?.lng, activeDeliveryId]);

  useEffect(() => {
    if (!running || route.length === 0 || activeDeliveryId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSubT((t) => {
        const nt = Math.min(1, t + 0.25);
        if (nt >= 1) {
          setIdx((i) => Math.min(i + 1, route.length - 1));
          return 0;
        }
        return nt;
      });
    }, 120);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, route.length, activeDeliveryId]);

  useEffect(() => {
    if (!activeDeliveryId) return;
    socket.on('connect', () => {});
    socket.on('disconnect', () => {});
    socket.emit('delivery:subscribe', { deliveryId: activeDeliveryId });
    socket.on('delivery:subscribed', () => {});
    socket.on(
      'delivery:start',
      (p: {
        startLat: number;
        startLng: number;
        startAddress?: string;
        route?: [number, number][];
      }) => {
        setStartPos({ lat: p.startLat, lng: p.startLng });
        setEndPos(undefined);
        setPos({ lat: p.startLat, lng: p.startLng });
        if (p.startAddress) setStartAddr(normalizeAddress(p.startAddress));
        if (Array.isArray(p.route)) setRoute(p.route);
      }
    );
    socket.on('delivery:update', (p: { lat: number; lng: number }) => {
      setPos({ lat: p.lat, lng: p.lng });
    });
    socket.on(
      'delivery:end',
      async (p: { endLat: number; endLng: number; endAddress?: string }) => {
        setEndPos({ lat: p.endLat, lng: p.endLng });
        setPos({ lat: p.endLat, lng: p.endLng });
        if (p.endAddress) setEndAddr(normalizeAddress(p.endAddress));
        const id = activeDeliveryId.trim();
        if (id && harvestScheduleId) {
          try {
            const d = await fetchDeliveryById(id);
            const st = String(d.status ?? '').toLowerCase();
            if (st === 'completed') {
              await updateHarvestScheduleStatus(
                harvestScheduleId as string,
                'COMPLETED'
              );
            }
          } catch {
            // Ignore errors
          }
        }
      }
    );
    return () => {
      socket.off('delivery:start');
      socket.off('delivery:update');
      socket.off('delivery:end');
      socket.off('delivery:subscribed');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, activeDeliveryId, harvestScheduleId]);

  useEffect(() => {
    const id = activeDeliveryId?.trim();
    if (!id) return;
    fetchDeliveryById(id)
      .then((d) => {
        const sLat = d.startLat != null ? Number(d.startLat) : undefined;
        const sLng = d.startLng != null ? Number(d.startLng) : undefined;
        if (!startPos && Number.isFinite(sLat) && Number.isFinite(sLng)) {
          setStartPos({ lat: sLat as number, lng: sLng as number });
          setPos({ lat: sLat as number, lng: sLng as number });
        }
        const eLat = d.endLat != null ? Number(d.endLat) : undefined;
        const eLng = d.endLng != null ? Number(d.endLng) : undefined;
        if (!endPos && Number.isFinite(eLat) && Number.isFinite(eLng)) {
          setEndPos({ lat: eLat as number, lng: eLng as number });
        }
        if (d.startAddress) setStartAddr(normalizeAddress(d.startAddress));
        if (d.endAddress) setEndAddr(normalizeAddress(d.endAddress));
      })
      .catch(() => {});
  }, [activeDeliveryId]);

  useEffect(() => {
    if (!activeDeliveryId) return;
    let cancelled = false;
    const sAddr = normalizeAddress(startAddress);
    const eAddr = normalizeAddress(endAddress);
    if (!startPos && sAddr) {
      geocode(sAddr).then((p) => {
        if (!cancelled && p) setStartPos(p);
      });
    }
    if (!endPos && eAddr) {
      geocode(eAddr).then((p) => {
        if (!cancelled && p) setEndPos(p);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [
    activeDeliveryId,
    startPos?.lat,
    startPos?.lng,
    endPos?.lat,
    endPos?.lng,
    startAddress,
    endAddress
  ]);

  useEffect(() => {
    if (!activeDeliveryId) return;
    if (!startPos || !endPos) return;
    fetchRoute(startPos, endPos, 'driving').then((r) => {
      if (r) {
        setDistance(r.distance);
        setDuration(r.duration);
        setRouteOsrm(r.coords ?? []);
      }
    });
  }, [
    activeDeliveryId,
    startPos?.lat,
    startPos?.lng,
    endPos?.lat,
    endPos?.lng
  ]);

  useEffect(() => {
    if (!activeDeliveryId) return;
    if (!pos || route.length === 0) return;
    let nearestIndex = 0;
    let best = Infinity;
    for (let i = 0; i < route.length; i++) {
      const dLat = route[i][0] - pos.lat;
      const dLng = route[i][1] - pos.lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < best) {
        best = dist;
        nearestIndex = i;
      }
    }
    setIdx(nearestIndex);
    setSubT(0);
  }, [activeDeliveryId, pos?.lat, pos?.lng, route.length]);

  useEffect(() => {
    const sid = harvestScheduleId?.trim();
    if (!sid || activeDeliveryId) return;
    fetchDeliveriesByHarvestSchedule({
      harvestScheduleId: sid,
      page: 1,
      limit: 10
    })
      .then((res) => {
        const all = Array.isArray(res?.data) ? res.data : [];
        const list = all.filter(
          (x) => String(x?.harvestSchedule?.id ?? '') === sid
        );
        const prefer =
          list.find(
            (x) => String(x.status ?? '').toLowerCase() === 'delivering'
          ) ||
          list.find(
            (x) => String(x.status ?? '').toLowerCase() === 'scheduled'
          ) ||
          list
            .filter((x) => String(x.status ?? '').toLowerCase() !== 'completed')
            .sort(
              (a, b) =>
                new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime() -
                new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime()
            )[0] ||
          (list.length === 0 ? all : list)
            .slice()
            .sort(
              (a, b) =>
                new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime() -
                new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime()
            )[0];
        if (prefer?.id) setAutoDeliveryId(String(prefer.id));
      })
      .catch(() => {});
  }, [harvestScheduleId, activeDeliveryId]);

  const progress =
    route.length > 1 ? Math.round((idx / (route.length - 1)) * 100) : 0;

  const currentPos = (() => {
    const cur = route[idx];
    const next = route[Math.min(idx + 1, route.length - 1)];
    if (!cur) return undefined;
    if (!next) return cur as [number, number];
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x);
    const t = ease(subT);
    const lat = cur[0] + (next[0] - cur[0]) * t;
    const lng = cur[1] + (next[1] - cur[1]) * t;
    return [lat, lng] as [number, number];
  })();

  const viewPos =
    currentPos ?? (pos ? ([pos.lat, pos.lng] as [number, number]) : undefined);

  const traveled = (() => {
    if (route.length === 0) return [] as [number, number][];
    const arr = route.slice(0, Math.max(idx, 1));
    if (viewPos) arr.push(viewPos);
    return arr;
  })();

  const remaining = (() => {
    if (route.length === 0) return [] as [number, number][];
    const arr = route.slice(Math.min(idx + 1, route.length - 1));
    if (viewPos) return [viewPos, ...arr];
    return arr;
  })();

  const displayStartAddr =
    startAddr ?? normalizeAddress(startAddress) ?? 'Điểm xuất phát';
  const displayEndAddr = endAddr ?? normalizeAddress(endAddress) ?? 'Điểm đến';

  return (
    <div className='space-y-4'>
      {/* Info Cards */}
      <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
        <div className='bg-primary/5 flex items-center gap-3 rounded-lg border p-3'>
          <div className='bg-primary/10 rounded-full p-2'>
            <IconTruck className='text-primary h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-muted-foreground text-xs'>Hàng hóa</p>
            <p className='truncate text-sm font-medium'>{cargo}</p>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg border bg-blue-50 p-3 dark:bg-blue-950/30'>
          <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-900/50'>
            <IconRoute className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-muted-foreground text-xs'>Quãng đường</p>
            <p className='text-sm font-medium'>
              {distance > 0 ? `${(distance / 1000).toFixed(1)} km` : '—'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg border bg-orange-50 p-3 dark:bg-orange-950/30'>
          <div className='rounded-full bg-orange-100 p-2 dark:bg-orange-900/50'>
            <IconClock className='h-5 w-5 text-orange-600 dark:text-orange-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-muted-foreground text-xs'>Thời gian dự kiến</p>
            <p className='text-sm font-medium'>
              {duration > 0 ? `${Math.round(duration / 60)} phút` : '—'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg border bg-green-50 p-3 dark:bg-green-950/30'>
          <div className='rounded-full bg-green-100 p-2 dark:bg-green-900/50'>
            <IconMapPin className='h-5 w-5 text-green-600 dark:text-green-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-muted-foreground text-xs'>Tiến độ</p>
            <p className='text-sm font-medium'>{progress}%</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='bg-muted h-2 overflow-hidden rounded-full'>
          <div
            className='bg-primary h-full rounded-full transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='flex items-center justify-between text-xs'>
          <div className='text-muted-foreground flex items-center gap-1'>
            <span className='inline-block h-2 w-2 rounded-full bg-green-500' />
            <span className=''>{displayStartAddr}</span>
          </div>
          <div className='text-muted-foreground flex items-center gap-1'>
            <span className=''>{displayEndAddr}</span>
            <span className='inline-block h-2 w-2 rounded-full bg-red-500' />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className='overflow-hidden rounded-xl border shadow-sm'>
        <MapContainer
          center={
            activeDeliveryId
              ? [pos?.lat ?? 21.0278, pos?.lng ?? 105.8342]
              : from
                ? [from.lat, from.lng]
                : startPos
                  ? [startPos.lat, startPos.lng]
                  : pos
                    ? [pos.lat, pos.lng]
                    : [10.775844, 106.701756]
          }
          zoom={
            activeDeliveryId
              ? pos
                ? 15
                : 12
              : from || startPos || pos
                ? 12
                : 6
          }
          style={{ height: 400, width: '100%' }}
          scrollWheelZoom
        >
          <FitBounds
            from={from ?? startPos}
            to={to ?? endPos}
            route={route.length > 0 ? route : routeOsrm}
          />
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

          {/* Traveled route (gray) */}
          {route.length > 0 && traveled.length > 0 && (
            <Polyline
              positions={traveled}
              color='#9ca3af'
              weight={4}
              opacity={0.6}
            />
          )}

          {/* Remaining route (blue) */}
          {route.length > 0 && remaining.length > 0 && (
            <Polyline positions={remaining} color='#3b82f6' weight={4} />
          )}

          {/* OSRM fallback route */}
          {route.length === 0 &&
            routeOsrm.length > 0 &&
            (() => {
              let nearestIndex = 0;
              if (pos) {
                let best = Infinity;
                for (let i = 0; i < routeOsrm.length; i++) {
                  const dLat = routeOsrm[i][0] - pos.lat;
                  const dLng = routeOsrm[i][1] - pos.lng;
                  const dist = dLat * dLat + dLng * dLng;
                  if (dist < best) {
                    best = dist;
                    nearestIndex = i;
                  }
                }
              }
              const traveledOsrm = (() => {
                const arr = routeOsrm.slice(0, Math.max(nearestIndex, 1));
                if (pos) arr.push([pos.lat, pos.lng]);
                return arr;
              })();
              const remainingOsrm = (() => {
                const arr = routeOsrm.slice(
                  Math.min(nearestIndex + 1, routeOsrm.length - 1)
                );
                if (pos)
                  return [[pos.lat, pos.lng] as [number, number], ...arr];
                return arr;
              })();
              return (
                <>
                  {traveledOsrm.length > 0 && (
                    <Polyline
                      positions={traveledOsrm}
                      color='#9ca3af'
                      weight={4}
                      opacity={0.6}
                    />
                  )}
                  {remainingOsrm.length > 0 && (
                    <Polyline
                      positions={remainingOsrm}
                      color='#3b82f6'
                      weight={4}
                    />
                  )}
                </>
              );
            })()}

          {/* Start marker */}
          {(from || startPos) && (
            <Marker
              position={
                from ? [from.lat, from.lng] : [startPos!.lat, startPos!.lng]
              }
              icon={startIcon}
            >
              <Tooltip direction='top' offset={[0, -12]}>
                <div className='text-xs font-medium'>
                  <div className='text-green-600'>Xuất phát</div>
                  <div className='text-muted-foreground'>
                    {displayStartAddr}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          )}

          {/* End marker */}
          {(to || endPos) && (
            <Marker
              position={to ? [to.lat, to.lng] : [endPos!.lat, endPos!.lng]}
              icon={endIcon}
            >
              <Tooltip direction='top' offset={[0, -12]}>
                <div className='text-xs font-medium'>
                  <div className='text-red-600'>Điểm đến</div>
                  <div className='text-muted-foreground'>{displayEndAddr}</div>
                </div>
              </Tooltip>
            </Marker>
          )}

          {/* Current position (vehicle) */}
          {viewPos && (
            <Marker position={viewPos} icon={carIcon}>
              <Tooltip direction='top' offset={[0, -20]}>
                <div className='space-y-1 text-xs'>
                  <div className='font-semibold'>Xe vận tải</div>
                  {productName && (
                    <div className='text-muted-foreground'>
                      Sản phẩm: {productName}
                    </div>
                  )}
                  <div className='text-muted-foreground'>Hàng: {cargo}</div>
                  <div className='text-primary font-medium'>
                    Tiến độ: {progress}%
                  </div>
                </div>
              </Tooltip>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
