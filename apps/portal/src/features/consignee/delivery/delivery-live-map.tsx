'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
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
const Polyline = dynamic(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
);
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), {
  ssr: false
});
import type { Icon, Map as LeafletMap } from 'leaflet';
import { io } from 'socket.io-client';
import { fetchOrderDetails } from '@/services/order-detail.service';
import { fetchDeliveryById } from '@/services/delivery.service';

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
  return positions;
}

// Fit bounds via map ref to avoid SSR issues with useMap

export default function DeliveryLiveMap({
  deliveryId
}: {
  deliveryId: string;
}) {
  const [pos, setPos] = useState<LatLng | undefined>(undefined);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeOsrm, setRouteOsrm] = useState<[number, number][]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [orderId, setOrderId] = useState<string>('');
  const [items, setItems] = useState<
    { productName: string; qty: number; uom: string }[]
  >([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [room, setRoom] = useState<string>('');
  const [lastEvent, setLastEvent] = useState<string>('');
  const [startPos, setStartPos] = useState<LatLng | undefined>(undefined);
  const [endPos, setEndPos] = useState<LatLng | undefined>(undefined);
  const mapRef = useRef<LeafletMap | null>(null);

  const socket = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return io(base + '/deliveries', { transports: ['websocket'] });
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
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('delivery:subscribe', { deliveryId });
    socket.on('delivery:subscribed', (p: any) => setRoom(p?.room ?? ''));
    socket.on('delivery:start', (p: any) => {
      setLastEvent('start');
      setStartPos({ lat: p.startLat, lng: p.startLng });
      setEndPos(undefined);
      setPos({ lat: p.startLat, lng: p.startLng });
      if (Array.isArray(p.route)) setRoute(p.route);
      if (typeof p.orderId === 'string') setOrderId(p.orderId);
      setCurrentIndex(0);
    });
    socket.on('delivery:update', (p: any) => {
      setLastEvent('update');
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
    });
    socket.on('delivery:end', (p: any) => {
      setLastEvent('end');
      setEndPos({ lat: p.endLat, lng: p.endLng });
      setPos({ lat: p.endLat, lng: p.endLng });
      setCurrentIndex(Math.max(route.length - 1, 0));
    });
    return () => {
      socket.off('delivery:start');
      socket.off('delivery:update');
      socket.off('delivery:end');
      socket.off('delivery:subscribed');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, deliveryId]);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetails({ orderId, page: 1, limit: 50 }).then((res) => {
      const rows = res.data.map((d: any) => ({
        productName: d.product?.name ?? '',
        qty: d.quantity ?? 0,
        uom: d.uom ?? ''
      }));
      setItems(rows);
    });
  }, [orderId]);

  useEffect(() => {
    const id = deliveryId?.trim();
    if (!id) return;
    fetchDeliveryById(id)
      .then((d) => {
        if (
          !startPos &&
          typeof d.startLat === 'number' &&
          typeof d.startLng === 'number'
        ) {
          setStartPos({ lat: d.startLat, lng: d.startLng });
          setPos({ lat: d.startLat, lng: d.startLng });
        }
        if (
          !endPos &&
          typeof d.endLat === 'number' &&
          typeof d.endLng === 'number'
        ) {
          setEndPos({ lat: d.endLat, lng: d.endLng });
        }
        if (!orderId && d.orderSchedule?.id) {
          setOrderId(d.orderSchedule.id);
        }
      })
      .catch(() => {
        // ignore fetch errors
      });
  }, [deliveryId]);

  useEffect(() => {
    if (!startPos || !endPos) return;
    fetchRouteOSRM(startPos, endPos)
      .then((positions) => setRouteOsrm(positions))
      .catch(() => setRouteOsrm([]));
  }, [startPos?.lat, startPos?.lng, endPos?.lat, endPos?.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    const pts: [number, number][] = [];
    if (startPos) pts.push([startPos.lat, startPos.lng]);
    if (endPos) pts.push([endPos.lat, endPos.lng]);
    const r = route.length > 0 ? route : routeOsrm;
    if (r && r.length >= 2) pts.push(r[0], r[r.length - 1]);
    if (pts.length >= 2) {
      mapRef.current.fitBounds(pts as any, { padding: [30, 30], maxZoom: 14 });
    }
  }, [
    startPos?.lat,
    startPos?.lng,
    endPos?.lat,
    endPos?.lng,
    route.length,
    routeOsrm.length
  ]);

  return (
    <div className='space-y-4'>
      <div className='rounded-md border p-2 text-xs'>
        <span className='mr-2'>
          Socket: {connected ? 'connected' : 'disconnected'}
        </span>
        <span className='mr-2'>Room: {room || '-'}</span>
        <span>Last: {lastEvent || '-'}</span>
      </div>
      <MapContainer
        center={[pos?.lat ?? 21.0278, pos?.lng ?? 105.8342]}
        zoom={pos ? 15 : 12}
        style={{ height: 420, width: '100%' }}
        scrollWheelZoom
        ref={(m: LeafletMap | null) => {
          mapRef.current = m;
        }}
      >
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        {startPos &&
          (startIcon ? (
            <Marker position={[startPos.lat, startPos.lng]} icon={startIcon}>
              <Tooltip direction='top' offset={[0, -12]}>
                Xuất phát
              </Tooltip>
            </Marker>
          ) : (
            <Marker position={[startPos.lat, startPos.lng]}>
              <Tooltip direction='top' offset={[0, -12]}>
                Xuất phát
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
        {endPos &&
          (endIcon ? (
            <Marker position={[endPos.lat, endPos.lng]} icon={endIcon}>
              <Tooltip direction='top' offset={[0, -12]}>
                Điểm đến
              </Tooltip>
            </Marker>
          ) : (
            <Marker position={[endPos.lat, endPos.lng]}>
              <Tooltip direction='top' offset={[0, -12]}>
                Điểm đến
              </Tooltip>
            </Marker>
          ))}
        {route.length > 1 && currentIndex > 0 && (
          <Polyline
            positions={route.slice(0, Math.min(currentIndex + 1, route.length))}
            color='#9ca3af'
          />
        )}
        {route.length - currentIndex >= 2 && (
          <Polyline
            positions={route.slice(Math.max(currentIndex, 0))}
            color='blue'
          />
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
              if (pos) return [[pos.lat, pos.lng] as [number, number], ...arr];
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
      </MapContainer>
      <div className='rounded-md border p-4'>
        <div className='mb-2 text-sm font-semibold'>Sản phẩm trong đơn</div>
        {items.length === 0 ? (
          <div className='text-muted-foreground text-sm'>Chưa có dữ liệu.</div>
        ) : (
          <ul className='text-sm'>
            {items.map((it, idx) => (
              <li key={idx} className='flex justify-between'>
                <span>{it.productName}</span>
                <span>
                  {it.qty} {it.uom}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
