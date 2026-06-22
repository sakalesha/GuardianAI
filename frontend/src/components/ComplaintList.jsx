import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  AlertCircle,
  Search,
  Calendar,
  Tag,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useState, useMemo } from "react";

export default function ComplaintList({ complaints }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");

  const sortedAndFilteredComplaints = useMemo(() => {
    let result = [...complaints];
    // Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.category.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query)) ||
          c.id.toLowerCase().includes(query),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "NEWEST":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "OLDEST":
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        case "STATUS":
          return a.status.localeCompare(b.status);
        case "CATEGORY":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return result;
  }, [complaints, searchQuery, sortBy]);

  const getSLAStatus = (deadline) => {
    const hoursRemaining =
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursRemaining > 48) return { color: "bg-success", label: "On Track" };
    if (hoursRemaining > 24) return { color: "bg-primary", label: "Warning" };
    return { color: "bg-danger", label: "Critical" };
  };

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 glass rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
          <AlertCircle className="text-secondary" size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">No Reports Yet</h3>
          <p className="text-sm text-slate-500 max-w-[200px]">
            Your filed complaints will appear here for tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4 animate-slam">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              My Reports
            </h2>
            <p className="text-secondary font-bold uppercase tracking-widest text-xs">
              Track and verify your civic complaints.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "NEWEST", icon: Clock, label: "Newest" },
              { id: "OLDEST", icon: Calendar, label: "Oldest" },
              { id: "STATUS", icon: Activity, label: "Status" },
              { id: "CATEGORY", icon: Tag, label: "Category" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  sortBy === opt.id
                    ? "bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] border-transparent"
                    : "glass text-secondary border border-white/10 hover:border-primary/50 hover:text-primary",
                )}
              >
                <opt.icon size={12} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="SEARCH ARCHIVES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 glass border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-ink focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all"
          />
        </div>
      </div>

      {sortedAndFilteredComplaints.length === 0 ? (
        <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <AlertCircle className="mx-auto text-secondary mb-4" size={48} />
          <p className="text-secondary text-xs font-black uppercase tracking-[0.2em]">
            No records found in current scope
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedAndFilteredComplaints.map((complaint, i) => {
            const sla = getSLAStatus(complaint.slaDeadline);
            return (
              <motion.div
                key={complaint.id}
                data-complaint-id={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "glass rounded-[2.5rem] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden hover:shadow-[0_0_40px_rgba(0,240,255,0.2)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-500 cursor-pointer group relative",
                  i === 0 && "md:col-span-2 lg:col-span-2 md:aspect-[21/9]",
                )}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={complaint.imageUrl}
                    alt={complaint.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-2xl backdrop-blur-md border border-white/20",
                        complaint.status === "RESOLVED"
                          ? "bg-success/90 text-white"
                          : complaint.status === "SUSPICIOUS"
                            ? "bg-danger/90 text-white"
                            : "bg-primary/90 text-white",
                      )}
                    >
                      {complaint.status}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-2xl backdrop-blur-md border border-white/20 bg-white/20 text-white">
                      {complaint.category}
                    </span>

                    {/* SLA Indicator */}
                    <div
                      title={`SLA Deadline: ${format(new Date(complaint.slaDeadline), "PPP p")}`}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 cursor-help",
                        sla.color === "bg-success"
                          ? "bg-success/20 text-white"
                          : sla.color === "bg-primary"
                            ? "bg-primary/20 text-white"
                            : "bg-danger/20 text-white",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          sla.color,
                        )}
                      />
                      SLA: {sla.label}
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest data-value">
                          {complaint.id}
                        </p>
                        <h3 className="font-black text-2xl text-white uppercase italic tracking-tight leading-none">
                          {complaint.category}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {formatDistanceToNow(new Date(complaint.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="h-1 w-full glass rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3 shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
