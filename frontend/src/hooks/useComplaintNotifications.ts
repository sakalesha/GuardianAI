import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useComplaints } from "@/hooks/useComplaints";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationCenter } from "@/contexts/NotificationCenterContext";
import {
  actorsForRole,
  notificationEvents,
  scopeForRole,
} from "@/lib/notifications";
import type { Complaint } from "@/types/complaint";

export function ComplaintWatcher() {
  const { user } = useAuth();
  const { addEvents } = useNotificationCenter();
  const navigate = useNavigate();
  const { data = [] } = useComplaints();
  const baseline = useRef<Map<string, Complaint> | null>(null);
  const scopeRef = useRef<string | null>(null);

  useEffect(() => {
    const scope = scopeForRole(user?.role);
    if (scope !== scopeRef.current) {
      scopeRef.current = scope;
      baseline.current = null;
    }
    if (!scope) return;

    const snapshot = new Map(data.map((c) => [c.id, c]));
    if (!baseline.current) {
      baseline.current = snapshot;
      return;
    }

    const prev = [...baseline.current.values()];
    const events = notificationEvents(prev, data, {
      uid: user?.uid ?? "",
      scope,
      actors: actorsForRole(scope, user?.name ?? ""),
    });
    baseline.current = snapshot;
    if (events.length === 0) return;

    addEvents(events);
    for (const ev of events) {
      toast.info(ev.message, {
        id: ev.id,
        action: {
          label: "View",
          onClick: () => navigate(`/reports/${ev.complaintId}`),
        },
      });
    }
  }, [data, user, addEvents, navigate]);

  return null;
}