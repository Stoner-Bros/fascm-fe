import { create } from 'zustand';
import type { NotificationItem } from '@/services/notifications.service';

type State = {
  items: NotificationItem[];
};

type Actions = {
  setItems: (items: NotificationItem[]) => void;
  addItem: (item: NotificationItem) => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
};

export const useNotificationsStore = create<State & Actions>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    })),
  remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) }))
}));
