import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationCenter } from "@/contexts/NotificationCenterContext";
import { formatDistanceToNow, parseISO, startOfDay, isSameDay, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";
import { motion, AnimatePresence } from "motion/react";

type NotificationEvent = {
  id: string;
  complaintId: string;
  message: string;
  timestamp: string;
  read?: boolean;
  type?: "info" | "success" | "warning" | "error";
};

function groupByDate(events: NotificationEvent[]) {
  const groups = new Map<string, NotificationEvent[]>();
  const today = startOfDay(new Date());
  const yesterday = startOfDay(new Date(Date.now() - 86400000));

  for (const event of events) {
    const date = startOfDay(parseISO(event.timestamp));
    let label: string;
    if (isSameDay(date, today)) {
      label = "Today";
    } else if (isSameDay(date, yesterday)) {
      label = "Yesterday";
    } else {
      label = format(date, "MMM d, yyyy");
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(event);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => {
    const dateA = a === "Today" ? today : a === "Yesterday" ? yesterday : parseISO(a);
    const dateB = b === "Today" ? today : b === "Yesterday" ? yesterday : parseISO(b);
    return dateB.getTime() - dateA.getTime();
  });
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { events, unreadCount, markAllRead, markAsRead } = useNotificationCenter();
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Today", "Yesterday"]));

  const groupedEvents = useMemo(() => groupByDate(events), [events]);

  useEffect(() => {
    if (open) {
      markAllRead();
    }
  }, [open, markAllRead]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const handleItemClick = (event: NotificationEvent) => {
    if (!event.read) markAsRead(event.id);
    navigate(`/reports/${event.complaintId}`);
    setOpen(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllRead();
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[60vh]" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between pb-2">
          <span className="font-semibold">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 text-xs"
                onClick={handleMarkAllRead}
              >
                <Check className="size-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        {unreadCount > 0 && (
          <Badge tone="primary" variant="solid" size="sm" className="mb-2 w-full justify-center">
            {unreadCount} unread
          </Badge>
        )}

        <DropdownMenuSeparator />

        {events.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Bell className="size-10 mx-auto text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/70">You're all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-[50vh] pr-1">
            <div className="space-y-3 px-1">
              {groupedEvents.map(([label, groupEvents]) => {
                const isExpanded = expandedGroups.has(label);
                const unreadInGroup = groupEvents.filter((e) => !e.read).length;

                return (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md",
                        "hover:bg-accent"
                      )}
                      onClick={() => toggleGroup(label)}
                      aria-expanded={isExpanded}
                    >
                      <span className="flex items-center gap-2">
                        {label === "Today" && <span className="text-primary">●</span>}
                        {label === "Yesterday" && <span className="text-warning">●</span>}
                        {label !== "Today" && label !== "Yesterday" && <span className="text-muted-foreground">📅</span>}
                        <span>{label}</span>
                        {unreadInGroup > 0 && (
                          <Badge tone="primary" variant="solid" size="sm">
                            {unreadInGroup}
                          </Badge>
                        )}
                      </span>
                      <span className="transition-transform duration-fast" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▼
                      </span>
                    </button>

                    <AnimatePresence mode="popLayout">
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1 mt-1 ml-2 border-l border-border/50 pl-2"
                        >
                          {groupEvents.map((event) => (
                            <DropdownMenuItem
                              key={event.id}
                              className={cn(
                                "flex flex-col items-start gap-1 py-2 pr-2",
                                !event.read && "bg-accent/50",
                              )}
                              onSelect={() => handleItemClick(event)}
                              inset
                            >
                              <div className="flex w-full items-start justify-between gap-2">
                                <span className={cn(
                                  "text-sm leading-snug flex-1",
                                  !event.read && "font-medium",
                                  event.type === "error" && "text-destructive",
                                  event.type === "success" && "text-success",
                                  event.type === "warning" && "text-warning",
                                )}>
                                  {event.message}
                                </span>
                                {!event.read && (
                                  <span className="flex size-2 shrink-0 items-center justify-center rounded-full bg-primary" aria-hidden="true" />
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(parseISO(event.timestamp), { addSuffix: true })}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center justify-center py-2 text-sm text-muted-foreground hover:text-foreground"
          onSelect={() => { /* Could navigate to notifications page */ }}
          disabled
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}