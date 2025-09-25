'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

// Fix cho default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Helper để encode UTF-8 an toàn
function btoaUTF8(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoaUTF8(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <rect x="2" y="2" width="28" height="28" fill="white" stroke="red" stroke-width="2" rx="4"/>
      <rect x="6" y="8" width="12" height="8" fill="red" rx="2"/>
      <rect x="18" y="12" width="6" height="4" fill="red" rx="1"/>
      <circle cx="10" cy="22" r="3" fill="black"/>
      <circle cx="22" cy="22" r="3" fill="black"/>
      <text x="16" y="28" text-anchor="middle" font-size="8" fill="red">TRUCK</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Custom checkpoint icons - Tăng size lên 32x32
const checkpointReachedIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoaUTF8(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="green" stroke="white" stroke-width="3"/>
      <path d="M10 16l4 4 8-8" stroke="white" stroke-width="3" fill="none"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const checkpointPendingIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoaUTF8(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="14" fill="gray" stroke="white" stroke-width="3"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface LeafletMapProps {
  route: [number, number][];
  checkpoints: Array<{
    id: string;
    name: string;
    position: [number, number];
    reached: boolean;
    timestamp?: string;
    blockHash?: string;
  }>;
  truckPosition: [number, number];
  truckData: {
    id: string;
    driver: string;
    speed: number;
    temperature: number;
    humidity: number;
  };
}

export default function LeafletMap({
  route,
  checkpoints,
  truckPosition,
  truckData
}: LeafletMapProps) {
  const truckMarkerRef = useRef<L.Marker | null>(null);

  // Component để auto-fit map bounds
  function FitBounds() {
    const map = useMap();

    useEffect(() => {
      if (route.length > 0) {
        const bounds = L.latLngBounds(route);
        // Thêm truck position vào bounds
        bounds.extend(truckPosition);
        // Thêm checkpoints vào bounds
        checkpoints.forEach((checkpoint) => {
          bounds.extend(checkpoint.position);
        });
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, [map, route, truckPosition, checkpoints]);

    return null;
  }

  // Component để animate truck movement
  function AnimatedTruck() {
    const map = useMap();

    useEffect(() => {
      if (truckMarkerRef.current) {
        // Smooth animation khi truck di chuyển
        truckMarkerRef.current.setLatLng(truckPosition);
      }
    }, [truckPosition, map]);

    return (
      <Marker position={truckPosition} icon={truckIcon} ref={truckMarkerRef}>
        <Popup>
          <div className='rounded-lg bg-red-50 p-3'>
            <h3 className='mb-2 flex items-center text-lg font-semibold text-red-800'>
              🚛 TRUCK {truckData.id}
            </h3>
            <div className='space-y-1'>
              <p className='text-sm text-gray-700'>
                <span className='font-medium'>Tài xế:</span> {truckData.driver}
              </p>
              <p className='text-sm text-gray-700'>
                <span className='font-medium'>Tốc độ:</span>{' '}
                {truckData.speed.toFixed(1)} km/h
              </p>
              <p
                className={`text-sm font-medium ${truckData.temperature > 5 ? 'text-red-600' : 'text-gray-700'}`}
              >
                <span className='font-medium'>Nhiệt độ:</span>{' '}
                {truckData.temperature.toFixed(1)}°C
                {truckData.temperature > 5 && ' ⚠️'}
              </p>
              <p
                className={`text-sm font-medium ${truckData.humidity > 75 ? 'text-red-600' : 'text-gray-700'}`}
              >
                <span className='font-medium'>Độ ẩm:</span>{' '}
                {truckData.humidity.toFixed(1)}%
                {truckData.humidity > 75 && ' ⚠️'}
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  }

  return (
    <MapContainer
      center={[21.019, 105.8327]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <FitBounds />
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Route với style cải thiện */}
      <Polyline
        positions={route}
        color='#2563eb'
        weight={5}
        opacity={0.8}
        dashArray='0'
        lineCap='round'
        lineJoin='round'
      />

      {/* Route shadow để tạo hiệu ứng 3D */}
      <Polyline
        positions={route}
        color='#1e40af'
        weight={7}
        opacity={0.3}
        dashArray='0'
        lineCap='round'
        lineJoin='round'
      />

      {/* Route đã đi (màu xanh lá) */}
      {route.length > 0 && (
        <Polyline
          positions={route.slice(
            0,
            Math.max(1, Math.floor(route.length * 0.3))
          )}
          color='#16a34a'
          weight={5}
          opacity={0.9}
          dashArray='0'
          lineCap='round'
          lineJoin='round'
        />
      )}

      {/* Checkpoints */}
      {checkpoints.map((checkpoint) => (
        <Marker
          key={checkpoint.id}
          position={checkpoint.position}
          icon={
            checkpoint.reached ? checkpointReachedIcon : checkpointPendingIcon
          }
        >
          <Popup>
            <div
              className={`rounded-lg p-3 ${checkpoint.reached ? 'bg-green-50' : 'bg-gray-50'}`}
            >
              <h3
                className={`mb-2 text-lg font-semibold ${checkpoint.reached ? 'text-green-800' : 'text-gray-800'}`}
              >
                {checkpoint.name}
              </h3>
              <div className='space-y-1'>
                <p
                  className={`text-sm font-medium ${checkpoint.reached ? 'text-green-700' : 'text-gray-600'}`}
                >
                  Trạng thái: {checkpoint.reached ? '✅ Đã qua' : '⏳ Chưa đến'}
                </p>
                {checkpoint.timestamp && (
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Thời gian:</span>{' '}
                    {checkpoint.timestamp}
                  </p>
                )}
                {checkpoint.blockHash && (
                  <p className='font-mono text-xs break-all text-gray-500'>
                    <span className='font-medium'>Hash:</span>{' '}
                    {checkpoint.blockHash}
                  </p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Truck - Với animation mượt */}
      <AnimatedTruck />
    </MapContainer>
  );
}
