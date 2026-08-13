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
}

const NotificationCenterContext = createContext<NotificationCenterValue | null>(null);

export function NotificationCenterProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addEvents = useCallback((newEvents: NotificationEvent[]) => {
    if (newEvents.length === 0) return;
    setEvents((prev) => [...newEvents, ...prev].slice(0, MAX_EVENTS));
    setUnreadCount((count) => count + newEvents.length);
  }, []);

  const markAllRead = useCallback(() => setUnreadCount(0), []);

  const value = useMemo(
    () => ({ events, unreadCount, addEvents, markAllRead }),
    [events, unreadCount, addEvents, markAllRead],
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