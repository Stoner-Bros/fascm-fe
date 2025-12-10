'use client';

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  CircleMarker,
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
      map.fitBounds(pts as any, { padding: [30, 30], maxZoom: 14 });
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
  const [running, setRunning] = useState<boolean>(false);
  const [idx, setIdx] = useState<number>(0);
  const [subT, setSubT] = useState<number>(0);
  const timerRef = useRef<any>(null);

  const [carIcon, setCarIcon] = useState<Icon | undefined>(undefined);
  const [startIcon, setStartIcon] = useState<Icon | undefined>(undefined);
  const [endIcon, setEndIcon] = useState<Icon | undefined>(undefined);

  const [pos, setPos] = useState<LatLng | undefined>(undefined);
  const [startPos, setStartPos] = useState<LatLng | undefined>(undefined);
  const [endPos, setEndPos] = useState<LatLng | undefined>(undefined);
  const [connected, setConnected] = useState<boolean>(false);
  const [room, setRoom] = useState<string>('');
  const [lastEvent, setLastEvent] = useState<string>('');
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
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('delivery:subscribe', { deliveryId: activeDeliveryId });
    socket.on('delivery:subscribed', (p: any) => setRoom(p?.room ?? ''));
    socket.on('delivery:start', (p: any) => {
      setLastEvent('start');
      setStartPos({ lat: p.startLat, lng: p.startLng });
      setEndPos(undefined);
      setPos({ lat: p.startLat, lng: p.startLng });
      if (p.startAddress) setStartAddr(normalizeAddress(p.startAddress));
      if (Array.isArray(p.route)) setRoute(p.route);
    });
    socket.on('delivery:update', (p: any) => {
      setLastEvent('update');
      setPos({ lat: p.lat, lng: p.lng });
    });
    socket.on('delivery:end', async (p: any) => {
      setLastEvent('end');
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
        } catch {}
      }
    });
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

  const poiIdx1 = Math.floor(route.length * 0.25);
  const poiIdx2 = Math.floor(route.length * 0.6);
  const poiIdx3 = Math.floor(route.length * 0.8);
  const poi1 = route[poiIdx1];
  const poi2 = route[poiIdx2];
  const poi3 = route[poiIdx3];

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

  return (
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
      <div className='lg:col-span-2'>
        <div className='mb-2 flex items-center justify-between'>
          <div className='text-sm'>Hàng: {cargo}</div>
          <div className='flex gap-2'>
            <button
              className='rounded border px-2 py-1 text-sm'
              onClick={() => setRunning(true)}
              disabled={!!activeDeliveryId}
            >
              Bắt đầu
            </button>
            <button
              className='rounded border px-2 py-1 text-sm'
              onClick={() => setRunning(false)}
              disabled={!!activeDeliveryId}
            >
              Tạm dừng
            </button>
          </div>
        </div>
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
          style={{ height: 380, width: '100%' }}
          scrollWheelZoom
        >
          <FitBounds
            from={from ?? startPos}
            to={to ?? endPos}
            route={route.length > 0 ? route : routeOsrm}
          />
          <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          {route.length > 0 && traveled.length > 0 && (
            <Polyline positions={traveled} color='#9ca3af' />
          )}
          {route.length > 0 && remaining.length > 0 && (
            <Polyline positions={remaining} color='blue' />
          )}
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
                    <Polyline positions={traveledOsrm} color='#9ca3af' />
                  )}
                  {remainingOsrm.length > 0 && (
                    <Polyline positions={remainingOsrm} color='blue' />
                  )}
                </>
              );
            })()}
          {from &&
            (startIcon ? (
              <Marker position={[from.lat, from.lng]} icon={startIcon}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Xuất phát</div>
                    <div>{startAddr ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[from.lat, from.lng]}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Xuất phát</div>
                    <div>{startAddr ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          {startPos &&
            !from &&
            (startIcon ? (
              <Marker position={[startPos.lat, startPos.lng]} icon={startIcon}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Xuất phát</div>
                    <div>{startAddr ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[startPos.lat, startPos.lng]}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Xuất phát</div>
                    <div>{startAddr ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          {to &&
            (endIcon ? (
              <Marker position={[to.lat, to.lng]} icon={endIcon}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Điểm đến</div>
                    <div>{endAddr ?? normalizeAddress(endAddress) ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[to.lat, to.lng]}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Điểm đến</div>
                    <div>{endAddr ?? normalizeAddress(endAddress) ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          {endPos &&
            !to &&
            (endIcon ? (
              <Marker position={[endPos.lat, endPos.lng]} icon={endIcon}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Điểm đến</div>
                    <div>{endAddr ?? normalizeAddress(endAddress) ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={[endPos.lat, endPos.lng]}>
                <Tooltip direction='top' offset={[0, -12]}>
                  <div className='text-xs'>
                    <div>Điểm đến</div>
                    <div>{endAddr ?? '-'}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          {viewPos &&
            (carIcon ? (
              <Marker position={viewPos} icon={carIcon}>
                <Tooltip direction='top' offset={[0, -20]}>
                  <div className='text-xs'>
                    <div>Xe vận tải</div>
                    <div>Sản phẩm: {productName ?? '-'}</div>
                    <div>Hàng: {cargo}</div>
                    <div>Tiến độ: {progress}%</div>
                  </div>
                </Tooltip>
              </Marker>
            ) : (
              <Marker position={viewPos}>
                <Tooltip direction='top' offset={[0, -20]}>
                  <div className='text-xs'>
                    <div>Xe vận tải</div>
                    <div>Sản phẩm: {productName ?? '-'}</div>
                    <div>Hàng: {cargo}</div>
                    <div>Tiến độ: {progress}%</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          {poi1 && <CircleMarker center={poi1} radius={6} color='orange' />}
          {poi2 && <CircleMarker center={poi2} radius={6} color='purple' />}
          {poi3 && <CircleMarker center={poi3} radius={6} color='green' />}
        </MapContainer>
      </div>
      <div className='lg:col-span-1'>
        <div className='rounded border p-3'>
          <div className='text-sm'>Tiến độ: {progress}%</div>
          <div className='mt-2 text-sm'>
            Quãng đường: {(distance / 1000).toFixed(1)} km
          </div>
          <div className='text-sm'>
            Thời gian dự kiến: {Math.round(duration / 60)} phút
          </div>
          <div className='text-sm'>
            Khởi hành: {startAddr ?? normalizeAddress(startAddress) ?? '-'}
          </div>
          <div className='text-sm'>
            Đích đến: {endAddr ?? normalizeAddress(endAddress) ?? '-'}
          </div>
          {activeDeliveryId && (
            <div className='mt-2 text-xs'>
              <span className='mr-2'>
                Socket: {connected ? 'connected' : 'disconnected'}
              </span>
              <span className='mr-2'>Room: {room || '-'}</span>
              <span>Last: {lastEvent || '-'}</span>
            </div>
          )}
          <div className='mt-3 space-y-2'>
            <div className={progress >= 0 ? 'font-medium' : ''}>Khởi hành</div>
            <div className={progress >= 25 ? 'font-medium' : ''}>
              Dừng nhiên liệu
            </div>
            <div className={progress >= 60 ? 'font-medium' : ''}>Kiểm tra</div>
            <div className={progress >= 80 ? 'font-medium' : ''}>Nghỉ ngắn</div>
            <div className={progress >= 100 ? 'font-medium' : ''}>Đến nơi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
