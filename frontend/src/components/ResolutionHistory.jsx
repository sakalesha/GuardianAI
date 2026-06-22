import { format } from "date-fns";
import { CheckCircle2, Clock, AlertTriangle, User } from "lucide-react";
import { cn } from "../lib/utils";

const STATUS_ICONS = {
  PENDING: Clock,
  RESOLVED: CheckCircle2,
  VERIFIED_RESOLUTION: CheckCircle2,
  VERIFIED_TENTATIVE: CheckCircle2,
  SUSPICIOUS: AlertTriangle,
  SUSPICIOUS_CONTENT: AlertTriangle,
  REOPENED: AlertTriangle,
  REJECTED_ML: AlertTriangle,
  REJECTED_GPS: AlertTriangle,
  DELETED: AlertTriangle,
};

const STATUS_COLORS = {
  PENDING: "text-secondary",
  RESOLVED: "text-success",
  VERIFIED_RESOLUTION: "text-success",
  VERIFIED_TENTATIVE: "text-accent",
  SUSPICIOUS: "text-danger",
  SUSPICIOUS_CONTENT: "text-danger",
  REOPENED: "text-primary",
  REJECTED_ML: "text-danger",
  REJECTED_GPS: "text-danger",
  DELETED: "text-danger",
};

export default function ResolutionHistory({ complaint }) {
  const history = complaint.history || [
    {
      status: "PENDING",
      timestamp: complaint.timestamp,
      user: "System",
      message: "Complaint filed and archived.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock size={18} className="text-secondary" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/60">
          Audit Trail
        </h3>
      </div>

      <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-ink/5">
        {history.map((event, index) => {
          const Icon = STATUS_ICONS[event.status] || Clock;
          const statusColor = STATUS_COLORS[event.status] || "text-secondary";
          return (
            <div key={index} className="relative flex gap-6 group">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all shadow-sm border border-white",
                  statusColor.replace("text-", "bg-") + "/10",
                  statusColor,
                )}
              >
                <Icon size={18} />
              </div>

              <div className="flex-1 pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        STATUS_COLORS[event.status],
                      )}
                    >
                      {event.status}
                    </span>
                    <span className="text-[8px] font-black text-secondary/40 uppercase tracking-widest">
                      •
                    </span>
                    <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">
                      {format(new Date(event.timestamp), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-ink/5 rounded-full">
                    <User size={10} className="text-secondary/60" />
                    <span className="text-[8px] font-black text-secondary/60 uppercase tracking-widest">
                      {event.user}
                    </span>
                  </div>
                </div>

                {event.message && (
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-widest leading-relaxed">
                    {event.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
