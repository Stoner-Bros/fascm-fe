import { create } from 'zustand';
import type { NotificationItem } from '@/services/notifications.service';

type State = {
  items: Array<NotificationItem & { data?: any }>;
  ephemeral?: (NotificationItem & { data?: any }) | null;
  ephemeralVisible: boolean;
};

type Actions = {
  setItems: (items: Array<NotificationItem & { data?: any }>) => void;
  addItem: (item: NotificationItem & { data?: any }) => void;
  addItemSilent: (item: NotificationItem & { data?: any }) => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  removeBy: (
    predicate: (item: NotificationItem & { data?: any }) => boolean
  ) => void;
  updateBy: (
    predicate: (item: NotificationItem & { data?: any }) => boolean,
    updater: (
      item: NotificationItem & { data?: any }
    ) => Partial<NotificationItem & { data?: any }>
  ) => void;
  showEphemeral: (item: NotificationItem) => void;
  hideEphemeral: () => void;
};

export const useNotificationsStore = create<State & Actions>((set) => ({
  items: [],
  ephemeral: null,
  ephemeralVisible: false,
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((s) => ({
      items: [item, ...s.items],
      ephemeral: item,
      ephemeralVisible: true
    })),
  addItemSilent: (item: NotificationItem & { data?: any }) =>
    set((s) => ({
      items: [item, ...s.items]
    })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    })),
  remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
  removeBy: (predicate) =>
    set((s) => ({
      items: s.items.filter((n) => !predicate(n))
    })),
  updateBy: (predicate, updater) =>
    set((s) => ({
      items: s.items.map((n) => (predicate(n) ? { ...n, ...updater(n) } : n))
    })),
  showEphemeral: (item) =>
    set(() => ({
      ephemeral: item,
      ephemeralVisible: true
    })),
  hideEphemeral: () =>
    set(() => ({
      ephemeralVisible: false
    }))
}));
