import { useNotifications } from "../contexts/NotificationContext";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function NotificationList({ isOpen, onClose }) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } =
    useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-8 border-b border-ink/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-primary" size={24} />
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                  Notifications
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-paper flex items-center justify-center hover:bg-ink/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <Bell size={64} strokeWidth={1} />
                  <p className="font-bold uppercase tracking-widest text-xs">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "p-5 rounded-3xl border transition-all cursor-pointer relative group",
                      notification.read
                        ? "bg-white border-ink/5 opacity-60"
                        : "bg-paper border-primary/20 shadow-lg shadow-primary/5",
                    )}
                  >
                    {!notification.read && (
                      <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full" />
                    )}
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          notification.newStatus === "RESOLVED"
                            ? "bg-success/10 text-success"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {notification.newStatus === "RESOLVED" ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <AlertCircle size={20} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold leading-tight">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                          <Clock size={12} />
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            { addSuffix: true },
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-8 border-t border-ink/5 grid grid-cols-2 gap-4">
                <button
                  onClick={markAllAsRead}
                  className="py-4 rounded-xl bg-paper text-ink text-[10px] font-black uppercase tracking-widest hover:bg-ink/5 transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearNotifications}
                  className="py-4 rounded-xl bg-danger/5 text-danger text-[10px] font-black uppercase tracking-widest hover:bg-danger/10 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
