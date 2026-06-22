import { cn } from "../lib/utils";

export default function ProfilePage({ user, userInitials, logout, complaints }) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-12 text-center space-y-12">
      <div className="relative">
        <div className="w-40 h-40 rounded-full glass flex items-center justify-center border-[8px] border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl font-black text-white italic">
              {userInitials}
            </span>
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
          Active
        </div>
      </div>

      <div className="space-y-3 animate-slam">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)]">
            Citizen Contributor
          </span>
          <span className="px-4 py-1.5 bg-success/10 text-success text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-success/20">
            Verified Profile
          </span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase italic">
          {user.displayName}
        </h2>
        <p className="text-secondary font-bold uppercase tracking-widest text-sm">
          {user.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {[
          {
            label: "Reports Filed",
            value: complaints.length,
            color: "text-ink",
          },
          {
            label: "Issues Fixed",
            value: complaints.filter((c) => c.status === "RESOLVED").length,
            color: "text-success",
          },
          {
            label: "Impact Points",
            value: complaints.length * 50,
            color: "text-accent",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:scale-[1.02] hover:border-primary/30 transition-all duration-500"
          >
            <div className={cn("text-5xl font-black mb-2", stat.color)}>
              {stat.value}
            </div>
            <div className="text-[10px] uppercase font-black text-secondary tracking-[0.2em]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => logout()}
        className="px-12 py-5 rounded-2xl bg-danger/5 text-danger font-black uppercase tracking-[0.3em] text-xs hover:bg-danger/10 transition-all"
      >
        Sign Out of CivicProof
      </button>

      <div className="w-full glass p-12 rounded-[3rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] text-left space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <h3 className="font-black text-2xl uppercase italic tracking-tight">
          Citizen Privileges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="p-6 bg-black/30 rounded-2xl border border-white/10 space-y-2">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">
              Filing Authority
            </p>
            <p className="text-xs font-bold text-secondary leading-relaxed uppercase tracking-widest opacity-80">
              You can file unlimited civic reports with visual evidence and GPS tagging.
            </p>
          </div>
          <div className="p-6 bg-black/30 rounded-2xl border border-white/10 space-y-2">
            <p className="text-[10px] font-black text-success uppercase tracking-widest">
              Audit Rights
            </p>
            <p className="text-xs font-bold text-secondary leading-relaxed uppercase tracking-widest opacity-80">
              You have the right to dispute and reopen resolutions flagged as suspicious by ML.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full glass p-12 rounded-[3rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] text-left space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <h3 className="font-black text-2xl uppercase italic tracking-tight">
          Accountability Statistics
        </h3>
        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-black text-secondary tracking-widest">
                Average Resolution Time
              </p>
              <p className="text-4xl font-black tracking-tighter">
                18.4 <span className="text-lg font-bold text-secondary">Hours</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-black text-success tracking-widest mb-1">
                Efficiency
              </p>
              <p className="text-2xl font-black text-success">85%</p>
            </div>
          </div>
          <div className="w-full bg-black/50 h-4 rounded-full overflow-hidden border border-white/10">
            <div className="bg-success w-[85%] h-full rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)]"></div>
          </div>
          <div className="p-4 bg-black/30 rounded-2xl border border-white/10">
            <p className="text-xs text-secondary font-bold leading-relaxed italic">
              "Your contributions have directly influenced municipal response times
              in the Ward 42 area. You are currently in the top 5% of citizens
              holding authorities accountable in Mysuru."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
