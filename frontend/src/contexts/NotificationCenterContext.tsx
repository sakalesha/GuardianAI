import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NotificationEvent } from "@/lib/notifications";

const MAX_EVENTS = 30;

interface NotificationCenterValue {
  events: NotificationEvent[];
  unreadCount: number;
  addEvents: (events: NotificationEvent[]) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
}

const NotificationCenterContext = createContext<NotificationCenterValue | null>(null);

export function NotificationCenterProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addEvents = useCallback((newEvents: NotificationEvent[]) => {
    if (newEvents.length === 0) return;
    const eventsWithRead = newEvents.map((e) => ({ ...e, read: false }));
    setEvents((prev) => [...eventsWithRead, ...prev].slice(0, MAX_EVENTS));
    setUnreadCount((count) => count + newEvents.length);
  }, []);

  const markAllRead = useCallback(() => {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setEvents((prev) => {
      const event = prev.find((e) => e.id === id);
      if (event && !event.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
        return prev.map((e) => (e.id === id ? { ...e, read: true } : e));
      }
      return prev;
    });
  }, []);

  const value = useMemo(
    () => ({ events, unreadCount, addEvents, markAllRead, markAsRead }),
    [events, unreadCount, addEvents, markAllRead, markAsRead],
  );

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter(): NotificationCenterValue {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) {
    throw new Error("useNotificationCenter must be used within NotificationCenterProvider");
  }
  return ctx;
}