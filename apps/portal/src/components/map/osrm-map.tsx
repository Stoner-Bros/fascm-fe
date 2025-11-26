'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
  useMap
} from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';

const DEFAULT_CENTER: LatLngExpression = [21.0278, 105.8342];

type LatLng = { lat: number; lng: number };
const VN_MIN_LAT = 8.18;
const VN_MAX_LAT = 23.39;
const VN_MIN_LNG = 102.14;
const VN_MAX_LNG = 109.46;
function inVietnam(p: LatLng) {
  return (
    p.lat >= VN_MIN_LAT &&
    p.lat <= VN_MAX_LAT &&
    p.lng >= VN_MIN_LNG &&
    p.lng <= VN_MAX_LNG
  );
}

async function reverseGeocodeOSM(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=18&addressdetails=1&accept-language=vi`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    return String(data?.display_name ?? '');
  } catch {
    return '';
  }
}

async function fetchRouteOSRM(
  origin: LatLng,
  destination: LatLng,
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<[number, number][]> {
  const base = 'https://router.project-osrm.org';
  const path = `/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
  const res = await fetch(base + path);
  const json = await res.json();
  const coords: [number, number][] =
    json?.routes?.[0]?.geometry?.coordinates ?? [];
  return coords.map(([lng, lat]: [number, number]) => [lat, lng]);
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

function RecenterOnChange({ pos, zoom }: { pos?: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView([pos.lat, pos.lng], zoom, { animate: true });
  }, [pos?.lat, pos?.lng, zoom]);
  return null;
}

export function AddressPickerMap({
  value,
  onChange,
  className,
  routeFrom,
  routeTo,
  profile = 'driving'
}: {
  value?: { position?: LatLng; address?: string };
  onChange?: (next: { position: LatLng; address: string }) => void;
  className?: string;
  routeFrom?: LatLng;
  routeTo?: LatLng;
  profile?: 'driving' | 'walking' | 'cycling';
}) {
  const [position, setPosition] = useState<LatLng | undefined>(value?.position);
  const [address, setAddress] = useState<string>(value?.address ?? '');
  const [route, setRoute] = useState<[number, number][]>([]);

  const markerIcon = useMemo(() => {
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
  }, []);

  useEffect(() => {
    if (value?.position) setPosition(value.position);
    if (typeof value?.address === 'string') setAddress(value.address);
  }, [value]);

  const pickFromBrowser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const p = { lat, lng };
        const addr = inVietnam(p) ? await reverseGeocodeOSM(lat, lng) : '';
        setPosition(p);
        setAddress(addr);
        onChange?.({ position: p, address: addr });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const preciseLocate = () => {
    if (!navigator.geolocation) return;
    let best: GeolocationPosition | null = null;
    const start = Date.now();
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (
          !best ||
          (pos.coords.accuracy || Infinity) < (best.coords.accuracy || Infinity)
        ) {
          best = pos;
        }
        if ((pos.coords.accuracy || 9999) <= 40 || Date.now() - start > 6000) {
          navigator.geolocation.clearWatch(watchId);
          if (!best) return;
          const lat = best.coords.latitude;
          const lng = best.coords.longitude;
          reverseGeocodeOSM(lat, lng).then((addr) => {
            const p = { lat, lng };
            setPosition(p);
            setAddress(addr);
            onChange?.({ position: p, address: addr });
          });
        }
      },
      () => {
        navigator.geolocation.clearWatch(watchId);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePick = async (p: LatLng) => {
    setPosition(p);
    const addr = await reverseGeocodeOSM(p.lat, p.lng);
    setAddress(addr);
    onChange?.({ position: p, address: addr });
  };

  useEffect(() => {
    (async () => {
      if (routeFrom && routeTo) {
        const coords = await fetchRouteOSRM(routeFrom, routeTo, profile);
        setRoute(coords);
      } else {
        setRoute([]);
      }
    })();
  }, [routeFrom?.lat, routeFrom?.lng, routeTo?.lat, routeTo?.lng, profile]);

  return (
    <div className={className}>
      <div className='mb-2 flex items-center gap-2'>
        <button
          type='button'
          className='cursor-pointer rounded border px-2 py-1 text-sm hover:bg-slate-100'
          onClick={pickFromBrowser}
        >
          Lấy vị trí hiện tại
        </button>
        <span className='text-muted-foreground text-xs'>
          {address ? address : 'Chọn trên bản đồ để lấy địa chỉ'}
        </span>
      </div>
      <MapContainer
        center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
        zoom={position ? 17 : 6}
        style={{ height: 320, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        <ClickHandler onPick={handlePick} />
        <RecenterOnChange pos={position} zoom={17} />
        {position && (
          <Marker
            position={[position.lat, position.lng]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = (e as any).target.getLatLng();
                handlePick({ lat: m.lat, lng: m.lng });
              }
            }}
          />
        )}
        {route.length > 0 && <Polyline positions={route} color='blue' />}
      </MapContainer>
    </div>
  );
}
