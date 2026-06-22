import { format, isAfter } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  Share2,
  Check,
  Trash2,
  AlertOctagon,
} from "lucide-react";
import { useState } from "react";
import ResolutionHistory from "./ResolutionHistory";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export default function ComplaintDetail({
  complaint,
  onBack,
  onVerify,
  onReopen,
  onDelete,
}) {
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const isOwner = user?.uid === complaint.userId;
  const isOverdue =
    !complaint.resolutionTimestamp &&
    isAfter(new Date(), new Date(complaint.slaDeadline));

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete(complaint.id);
    } else {
      setIsConfirmingDelete(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?view=${complaint.id}`;
    const shareData = {
      title: `CivicProof: ${complaint.category}`,
      text: `Check out this civic report on CivicProof: ${complaint.description}`,
      url: shareUrl,
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };
  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {complaint.category}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            ID: {complaint.id}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              isCopied
                ? "bg-success text-white"
                : "bg-paper border border-ink/5 text-secondary hover:bg-ink hover:text-white",
            )}
          >
            {isCopied ? <Check size={16} /> : <Share2 size={16} />}
            {isCopied ? "Copied" : "Share"}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={cn(
          "p-6 rounded-[2rem] flex items-center gap-6 border shadow-premium animate-slam",
          complaint.status === "RESOLVED"
            ? "bg-success/5 border-success/20 text-success"
            : complaint.status === "SUSPICIOUS"
              ? "bg-danger/5 border-danger/20 text-danger"
              : isOverdue
                ? "bg-danger/5 border-danger/20 text-danger"
                : "bg-accent/5 border-accent/20 text-accent",
        )}
      >
        <div
          className={cn(
            "p-4 rounded-2xl",
            complaint.status === "RESOLVED" ? "bg-success/10" : "bg-danger/10",
          )}
        >
          {complaint.status === "RESOLVED" ? (
            <ShieldCheck size={32} />
          ) : (
            <AlertTriangle size={32} />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            {complaint.status}
          </p>
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest leading-relaxed">
            {complaint.status === "RESOLVED"
              ? "Verified by ML Accountability Layer"
              : isOverdue
                ? "SLA Breached: Auto-escalated to Zonal Officer"
                : "Awaiting Municipal Resolution"}
          </p>
        </div>
      </div>

      {/* Resolution Details Section */}
      {complaint.status === "RESOLVED" && (
        <div className="bg-success/5 p-6 rounded-3xl border border-success/20 space-y-4">
          <div className="flex items-center gap-3 text-success">
            <ShieldCheck size={24} />
            <h3 className="font-bold text-lg">Resolution Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="aspect-video rounded-2xl overflow-hidden border border-success/20 shadow-sm">
              <img
                src={complaint.resolutionImageUrl}
                alt="Resolution"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success/60">
                  Resolved On
                </p>
                <p className="text-sm font-bold text-success">
                  {complaint.resolutionTimestamp
                    ? format(
                        new Date(complaint.resolutionTimestamp),
                        "MMMM d, yyyy • h:mm a",
                      )
                    : "N/A"}
                </p>
              </div>

              {complaint.resolvedBy && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-success/60">
                    Verified By
                  </p>
                  <p className="text-sm font-bold text-success uppercase tracking-widest">
                    {complaint.resolvedBy}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success/60">
                  Verification Score
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-success/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-1000"
                      style={{
                        width: `${Math.round((complaint.verificationScore || 0) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-success">
                    {Math.round((complaint.verificationScore || 0) * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white/50 rounded-xl border border-success/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success/60 mb-1">
                  ML Audit Verdict
                </p>
                <p className="text-xs text-success/80 leading-relaxed font-medium">
                  {complaint.verificationLabel === "VERIFIED"
                    ? "The resolution has been cross-verified using visual change detection and GPS proximity checks."
                    : "Resolution flagged for manual review due to low confidence score."}
                </p>
              </div>

              {(complaint.verificationLabel === "UNCHANGED" ||
                complaint.verificationLabel === "UNCERTAIN") &&
                onReopen && (
                  <button
                    onClick={onReopen}
                    className="w-full mt-2 bg-danger text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Reopen Investigation
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison View */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Resolution Verification
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 relative">
              <img
                src={complaint.imageUrl}
                alt="Before"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] font-bold rounded">
                BEFORE
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-medium">
              Filed: {format(new Date(complaint.timestamp), "MMM d, h:mm a")}
            </p>
          </div>

          <div className="space-y-2">
            <div
              className={cn(
                "aspect-[3/4] rounded-xl overflow-hidden border flex flex-col items-center justify-center relative",
                complaint.resolutionImageUrl
                  ? "border-slate-200"
                  : "border-dashed border-slate-300 bg-slate-50",
              )}
            >
              {complaint.resolutionImageUrl ? (
                <>
                  <img
                    src={complaint.resolutionImageUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/80 text-white text-[10px] font-bold rounded">
                    AFTER
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Clock size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight">
                    Awaiting
                    <br />
                    Resolution
                  </p>
                </div>
              )}
            </div>
            {complaint.resolutionTimestamp && (
              <p className="text-[10px] text-center text-slate-400 font-medium">
                Fixed:{" "}
                {format(
                  new Date(complaint.resolutionTimestamp),
                  "MMM d, h:mm a",
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Verification Details */}
      {complaint.verificationLabel && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-ink/5 shadow-premium space-y-6 animate-slam">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  complaint.verificationLabel === "VERIFIED"
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger",
                )}
              >
                {complaint.verificationLabel === "VERIFIED" ? (
                  <ShieldCheck size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <div>
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-secondary/60">
                  ML Audit Verdict
                </h4>
                <p
                  className={cn(
                    "font-black text-sm uppercase tracking-widest",
                    complaint.verificationLabel === "VERIFIED"
                      ? "text-success"
                      : "text-danger",
                  )}
                >
                  {complaint.verificationLabel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-[10px] uppercase tracking-[0.3em] text-secondary/60">
                Confidence
              </p>
              <p className="font-black text-sm text-primary uppercase tracking-widest">
                {Math.round((complaint.verificationScore || 0) * 100)}%
              </p>
            </div>
          </div>
          <div className="h-px bg-ink/5 w-full" />
          <p className="text-xs font-bold text-secondary leading-relaxed uppercase tracking-widest opacity-80 italic">
            "
            {complaint.verificationLabel === "VERIFIED"
              ? "Visual analysis confirms the reported issue has been cleared. Scene geometry matches original complaint."
              : "Suspicious resolution detected. Scene appears unchanged or mismatched with original location."}
            "
          </p>
        </div>
      )}

      {/* Audit Trail */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-ink/5 shadow-premium">
        <ResolutionHistory complaint={complaint} />
      </div>

      {/* Info List */}
      <div className="space-y-1 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <MapPin size={18} />
            </div>
            <span className="text-sm font-medium">Location</span>
          </div>
          <button className="text-primary text-xs font-bold flex items-center gap-1">
            View on Map <ExternalLink size={12} />
          </button>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Calendar size={18} />
            </div>
            <span className="text-sm font-medium">SLA Deadline</span>
          </div>
          <span
            className={cn(
              "text-xs font-bold",
              isOverdue ? "text-danger" : "text-slate-600",
            )}
          >
            {format(new Date(complaint.slaDeadline), "MMM d, h:mm a")}
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <User size={18} />
            </div>
            <span className="text-sm font-medium">Assigned Officer</span>
          </div>
          <span className="text-xs font-bold text-slate-600">
            Zonal Engineer (Ward 42)
          </span>
        </div>
      </div>

      {/* Action Button for Authority (Demo Purpose) */}
      {!complaint.resolutionImageUrl && (
        <div className="space-y-3">
          <button
            onClick={onVerify}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
          >
            <ShieldCheck size={20} />
            Simulate Authority Resolution
          </button>
          <p className="text-[10px] text-center text-slate-400">
            In production, authorities use a separate URL:
            <br />
            <code className="bg-slate-100 px-1 rounded">
              ?resolve={complaint.id}
            </code>
          </p>
        </div>
      )}

      {/* Citizen Delete Option */}
      {isOwner && (complaint.status === "PENDING" || complaint.status === "SUSPICIOUS_CONTENT" || complaint.status === "REOPENED") && (
        <div className="pt-8 border-t border-ink/5">
          <button
            onClick={handleDelete}
            onMouseLeave={() => setIsConfirmingDelete(false)}
            className={cn(
              "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-premium",
              isConfirmingDelete 
                ? "bg-danger text-white animate-pulse" 
                : "bg-paper border border-danger/20 text-danger hover:bg-danger/5"
            )}
          >
            {isConfirmingDelete ? (
              <>
                <AlertOctagon size={18} />
                Click again to Confirm Delete
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete My Report
              </>
            )}
          </button>
          <p className="text-[9px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest opacity-60">
            Deleting will permanently remove this public record
          </p>
        </div>
      )}
    </div>
  );
}
