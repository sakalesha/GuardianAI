import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { cn } from "../lib/utils";

export default function AuthorityDashboardPage({ complaints = [], onResolveSuccess }) {
  // Only show complaints that need review or are tentatively verified
  const pendingReviews = complaints.filter(
    (c) =>
      c.status === "NEEDS_HUMAN_REVIEW" || c.status === "VERIFIED_TENTATIVE"
  );

  if (pendingReviews.length === 0) {
    return (
      <div className="space-y-12 animate-slam pb-32">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-ink">
            Verification Queue
          </h2>
          <p className="text-secondary font-bold uppercase tracking-widest text-xs italic">
            Zero pending reviews
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-16 glass border border-dashed border-white/10 rounded-3xl opacity-50 hover:opacity-100 transition-opacity">
          <Search size={48} className="text-secondary/50 mb-4" />
          <p className="text-secondary font-bold uppercase tracking-widest text-sm text-center">
            All caught up!
          </p>
        </div>
      </div>
    );
  }

  const handleManualAction = (complaint, isApprove) => {
    onResolveSuccess({
      ...complaint,
      status: isApprove ? "RESOLVED" : "REJECTED_MANUAL",
      verificationLabel: isApprove ? "MANUALLY_APPROVED" : "MANUALLY_REJECTED",
      history: undefined // Handled by App.js
    }, complaint);
  };

  return (
    <div className="space-y-12 animate-slam pb-32">
      <div className="space-y-2">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none text-ink">
          Verification Queue
        </h2>
        <p className="text-secondary font-bold uppercase tracking-widest text-xs italic">
          {pendingReviews.length} Tickets Awaiting Approval
        </p>
      </div>

      <div className="space-y-8">
        {pendingReviews.map((complaint) => (
          <div
            key={complaint.id}
            className={cn(
               "glass p-8 rounded-[2.5rem] border shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-6 hover:scale-[1.01] transition-transform duration-300",
               complaint.status === "NEEDS_HUMAN_REVIEW" ? "border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]" : "border-success/50 shadow-[0_0_15px_rgba(0,255,136,0.2)]"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                 <span className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.3em] block">
                   Evidence Package #
                 </span>
                 <span className="text-lg font-black uppercase tracking-widest text-ink block">
                   {complaint.id}
                 </span>
              </div>
              <div className="text-right">
                 <span className={cn("text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest block",
                    complaint.status === "NEEDS_HUMAN_REVIEW" ? "bg-amber-100 text-amber-700" : "bg-success/10 text-success"
                 )}>
                   {complaint.status.replace(/_/g, " ")}
                 </span>
                 <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">
                   ML Score: {Math.round((complaint.verificationScore || 0) * 100)}%
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.3em]">Original Complaint</span>
                 <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 relative">
                   <img src={complaint.imageUrl} alt="Before" className="w-full h-full object-cover" />
                 </div>
              </div>
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-success uppercase tracking-[0.3em]">Worker Evidence</span>
                 <div className="aspect-square rounded-3xl overflow-hidden border border-success/50 shadow-[0_0_15px_rgba(0,255,136,0.2)] relative">
                   <img src={complaint.resolutionImageUrl} alt="After" className="w-full h-full object-cover" />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
               <button onClick={() => handleManualAction(complaint, false)} className="p-4 bg-danger/5 text-danger rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-danger hover:text-white border border-danger/20 transition-all">
                  <XCircle size={18} />
                  Reject Fraud
               </button>
               <button onClick={() => handleManualAction(complaint, true)} className="p-4 bg-success text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-[0_15px_30px_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-95 transition-all">
                  <CheckCircle2 size={18} />
                  Approve Fix
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
