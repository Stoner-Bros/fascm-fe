'use client';
import { RoleEnum } from '@/constants/enums';
import { useAuth } from '@/hooks/use-auth';
import { removeCookie, setCookie } from '@/lib/cookie';
import { fetchMine } from '@/services/auth.service';
import { subscribeIoTDataUpdates } from '@/services/iotdevice.service';
import {
  subscribeDeliveryStaffNotifications,
  subscribeGlobalNotifications,
  subscribeManagerNotifications,
  subscribeStaffNotifications,
  subscribeWarehouseNotifications,
  type NotificationPayload
} from '@/services/notifications.service';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function NotificationListener() {
  const addItem = useNotificationsStore((s) => s.addItem);
  const removeBy = useNotificationsStore((s) => s.removeBy);
  const updateBy = useNotificationsStore((s) => s.updateBy);
  const { user, setFullInfo } = useAuth();
  const [entityId, setEntityId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [subType, setSubType] = useState<
    'global' | 'manager' | 'staff' | 'delivery'
  >('global');
  const t = useTranslations('Notifications');
  const SEPARATOR = ' • ';
  const resolveText = (raw?: string, params?: Record<string, any>) => {
    const key = String(raw ?? '').trim();
    if (!key) return '';
    const isKeyLike = /^[A-Za-z0-9_.-]+$/.test(key);
    if (!isKeyLike) return key;
    try {
      return t(key, params as any);
    } catch {
      return key;
    }
  };
  const normalizeNumber = (v: any): number | undefined => {
    const n = typeof v === 'string' ? Number(v) : v;
    return typeof n === 'number' && !Number.isNaN(n) ? n : undefined;
  };
  const numberFromMessage = (msg: string, key: 'temperature' | 'humidity') => {
    const r =
      key === 'temperature'
        ? /temperature[:\s]*([0-9]+(?:\.[0-9]+)?)/i
        : /humidity[:\s]*([0-9]+(?:\.[0-9]+)?)/i;
    const m = msg.match(r);
    if (!m) return undefined;
    const val = Number(m[1]);
    return Number.isNaN(val) ? undefined : val;
  };

  useEffect(() => {
    const unsubscribe = subscribeGlobalNotifications(
      (p: NotificationPayload) => {
        const id =
          p.id || `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
        let parsed: any = null;
        if (typeof p.data === 'string') {
          try {
            parsed = JSON.parse(p.data);
          } catch {}
        } else {
          parsed = p.data ?? null;
        }
        const orderScheduleId = parsed?.orderScheduleId ?? '';
        addItem({
          id,
          type: p.type,
          title: resolveText(p.title ?? 'defaultTitle'),
          message: resolveText(p.message ?? 'defaultMessage', {
            orderScheduleId,
            sep: SEPARATOR
          }),
          isRead: false,
          createdAt: p.timestamp,
          data: parsed
        });
      }
    );
    return () => unsubscribe();
  }, [addItem]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const roleName = user?.role?.name as RoleEnum | undefined;

      if (!roleName || roleName === RoleEnum.ADMIN) {
        setSubType('global');
        setEntityId('');
        setWarehouseId('');
        return;
      }

      try {
        const fullInfo = await fetchMine(roleName);
        setFullInfo(fullInfo);

        removeCookie('warehouseId');
        removeCookie('deliveryStaffId');

        if (roleName === RoleEnum.DELIVERY_STAFF) {
          setCookie('deliveryStaffId', String(fullInfo?.id ?? ''), {
            expires: 120
          });
        } else {
          setCookie('warehouseId', String(fullInfo?.warehouse?.id ?? ''), {
            expires: 120
          });
        }
        setEntityId(String(fullInfo?.id ?? ''));
        setWarehouseId(String(fullInfo?.warehouse?.id ?? ''));

        if (roleName === RoleEnum.MANAGER) {
          setSubType('manager');
        } else if (roleName === RoleEnum.STAFF) {
          setSubType('staff');
        } else if (roleName === RoleEnum.DELIVERY_STAFF) {
          setSubType('delivery');
        } else {
          setSubType('global');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [user?.role?.name]);

  useEffect(() => {
    const id = entityId.trim();
    if (!id) return;
    let unsub: (() => void) | null = null;
    const onNotify = (p: NotificationPayload) => {
      const nid =
        p.id || `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
      let parsed: any = null;
      if (typeof p.data === 'string') {
        try {
          parsed = JSON.parse(p.data);
        } catch {}
      } else {
        parsed = p.data ?? null;
      }
      const orderScheduleId = parsed?.orderScheduleId ?? '';
      const harvestScheduleId = parsed?.harvestScheduleId ?? '';
      addItem({
        id: nid,
        type: p.type,
        title: resolveText(p.title ?? 'defaultTitle'),
        message: resolveText(p.message ?? 'defaultMessage', {
          orderScheduleId,
          harvestScheduleId,
          sep: SEPARATOR
        }),
        isRead: false,
        createdAt: p.timestamp,
        data: parsed
      });
    };
    if (subType === 'manager') {
      unsub = subscribeManagerNotifications(id, onNotify);
    } else if (subType === 'staff') {
      unsub = subscribeStaffNotifications(id, onNotify);
    } else if (subType === 'delivery') {
      unsub = subscribeDeliveryStaffNotifications(id, onNotify);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [entityId, subType, addItem]);

  useEffect(() => {
    const id = warehouseId.trim();
    if (!id) return;
    const onNotify = (p: NotificationPayload) => {
      const nid =
        p.id || `tmp_${Date.now()}-${Math.random().toString(16).slice(2)}`;
      let parsed: any = null;
      if (typeof p.data === 'string') {
        try {
          parsed = JSON.parse(p.data);
        } catch {}
      } else {
        parsed = p.data ?? null;
      }
      const areaId = parsed?.areaId ?? '';
      const temperature = normalizeNumber(parsed?.temperature);
      const humidity = normalizeNumber(parsed?.humidity);
      const rawMsg = String(p.message ?? '').trim();
      const temperatureFromMsg =
        temperature != null
          ? temperature
          : numberFromMessage(rawMsg, 'temperature');
      const humidityFromMsg =
        humidity != null ? humidity : numberFromMessage(rawMsg, 'humidity');
      if (
        rawMsg === 'areaAlertResolved' ||
        String(p.type ?? '') === 'area-alert-resolved'
      ) {
        removeBy(
          (n) =>
            String(n.type || '') === 'area-alert' &&
            String((n as any).data?.areaId || '') === String(areaId)
        );
        addItem({
          id: nid,
          type: 'area-alert-resolved',
          title: resolveText('areaAlert', { areaId }),
          message: resolveText(
            temperatureFromMsg != null || humidityFromMsg != null
              ? 'areaAlertResolvedWithMetrics'
              : 'areaAlertResolved',
            {
              areaId,
              temperature: temperatureFromMsg,
              humidity: humidityFromMsg,
              sep: SEPARATOR
            }
          ),
          isRead: false,
          createdAt: p.timestamp,
          data: {
            areaId,
            temperature: temperatureFromMsg,
            humidity: humidityFromMsg
          }
        });

        if (temperatureFromMsg == null && humidityFromMsg == null) {
          const stop = subscribeIoTDataUpdates((payload) => {
            const pAreaId = (payload as any)?.areaId as string | undefined;
            if (pAreaId && String(pAreaId) !== String(areaId)) return;
            const readings: any = (
              typeof (payload as any)?.data === 'object'
                ? (payload as any)?.data
                : payload
            ) as any;
            const temp =
              typeof readings?.temperature === 'number'
                ? readings.temperature
                : typeof (payload as any)?.temperature === 'number'
                  ? (payload as any)?.temperature
                  : undefined;
            const hum =
              typeof readings?.humidity === 'number'
                ? readings.humidity
                : typeof (payload as any)?.humidity === 'number'
                  ? (payload as any)?.humidity
                  : undefined;
            if (temp == null && hum == null) return;
            updateBy(
              (n) => n.id === nid,
              () => ({
                data: { areaId, temperature: temp, humidity: hum },
                message: resolveText('areaAlertResolvedWithMetrics', {
                  areaId,
                  temperature: temp,
                  humidity: hum,
                  sep: SEPARATOR
                })
              })
            );
            stop();
          });
          setTimeout(() => {
            try {
              stop();
            } catch {}
          }, 5000);
        }
        return;
      }
      removeBy(
        (n) =>
          String(n.type || '') === 'area-alert' &&
          String((n as any).data?.areaId || '') === String(areaId)
      );
      addItem({
        id: nid,
        type: 'area-alert',
        title: resolveText('areaAlert', { areaId }),
        message: resolveText(
          temperatureFromMsg != null || humidityFromMsg != null
            ? 'areaAlertActiveWithMetrics'
            : 'areaAlertActive',
          {
            areaId,
            temperature: temperatureFromMsg,
            humidity: humidityFromMsg,
            sep: SEPARATOR
          }
        ),
        isRead: false,
        createdAt: p.timestamp,
        data: {
          areaId,
          temperature: temperatureFromMsg,
          humidity: humidityFromMsg
        }
      });
      if (temperatureFromMsg == null && humidityFromMsg == null) {
        const stop = subscribeIoTDataUpdates((payload) => {
          const pAreaId = (payload as any)?.areaId as string | undefined;
          const dId = String((payload as any)?.deviceId ?? '').trim();
          if (pAreaId && String(pAreaId) !== String(areaId)) return;
          const readings: any = (
            typeof (payload as any)?.data === 'object'
              ? (payload as any)?.data
              : payload
          ) as any;
          const temp =
            typeof readings?.temperature === 'number'
              ? readings.temperature
              : typeof (payload as any)?.temperature === 'number'
                ? (payload as any)?.temperature
                : undefined;
          const hum =
            typeof readings?.humidity === 'number'
              ? readings.humidity
              : typeof (payload as any)?.humidity === 'number'
                ? (payload as any)?.humidity
                : undefined;
          if (temp == null && hum == null) return;
          updateBy(
            (n) =>
              String(n.type || '') === 'area-alert' &&
              String((n as any).data?.areaId || '') === String(areaId),
            () => ({
              data: { areaId, temperature: temp, humidity: hum },
              message: resolveText('areaAlertActiveWithMetrics', {
                areaId,
                temperature: temp,
                humidity: hum,
                sep: SEPARATOR
              })
            })
          );
          stop();
        });
        setTimeout(() => {
          try {
            stop();
          } catch {}
        }, 5000);
      }
    };
    const unsub = subscribeWarehouseNotifications(id, onNotify);
    return () => {
      if (unsub) unsub();
    };
  }, [warehouseId, addItem, t]);

  return null;
}
