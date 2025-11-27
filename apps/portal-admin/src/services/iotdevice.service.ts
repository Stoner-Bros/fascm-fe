import { fetchJSON, getApiBase } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';
import { IoTDeviceBE } from '@/types/iot-device';
import { io, Socket } from 'socket.io-client';

const BASE_PATH = '/io-t-devices';

export async function createIoTDevice(body: Partial<IoTDeviceBE>) {
  return fetchJSON<IoTDeviceBE>(BASE_PATH, { method: 'POST', body });
}

export async function fetchIoTDevices() {
  return fetchJSON<InfinityPaginationResponse<IoTDeviceBE>>(BASE_PATH);
}

export async function fetchIoTDeviceById(id: string) {
  return fetchJSON<IoTDeviceBE>(`${BASE_PATH}/${id}`);
}

function getSocketBase(): string {
  const base = getApiBase();
  return base.replace(/\/api\/v1$/, '');
}

export function connectIoTSocket(): Socket {
  const url = getSocketBase();
  return io(url, { path: '/socket.io', transports: ['websocket'] });
}

export type IoTEventPayload = Partial<IoTDeviceBE> & { id: string };

export function subscribeIoTDeviceUpdates(
  onUpdate: (payload: IoTEventPayload) => void
): () => void {
  const socket = connectIoTSocket();
  const handler = (payload: any) => {
    if (payload && typeof payload === 'object' && payload.id) {
      onUpdate(payload as IoTEventPayload);
    }
  };
  const events = ['io-t-devices', 'iot-device', 'iot-device-update', 'iot'];
  events.forEach((evt) => socket.on(evt, handler));
  return () => {
    events.forEach((evt) => socket.off(evt, handler));
    socket.disconnect();
  };
}

export function subscribeIoTDataUpdates(
  onData: (payload: IoTEventPayload) => void
): () => void {
  const socket = connectIoTSocket();
  const handler = (payload: any) => {
    if (payload && typeof payload === 'object' && payload.id) {
      onData(payload as IoTEventPayload);
    }
  };
  const events = ['iot-data', 'io-t-device-data', 'sensor-data'];
  events.forEach((evt) => socket.on(evt, handler));
  return () => {
    events.forEach((evt) => socket.off(evt, handler));
    socket.disconnect();
  };
}
