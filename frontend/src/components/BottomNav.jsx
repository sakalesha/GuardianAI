import { Map, PlusCircle, List, User } from "lucide-react";
import { cn } from "../lib/utils";

export default function BottomNav({ activeTab, onTabChange, userRole = "CITIZEN" }) {
  const tabs = [
    { id: "map", icon: Map, label: "Heatmap", roles: ["CITIZEN", "WORKER", "AUTHORITY"] },
    { id: "report", icon: PlusCircle, label: "Report", roles: ["CITIZEN"] },
    { id: "list", icon: List, label: userRole === "WORKER" ? "Queue" : "Reports", roles: ["CITIZEN", "WORKER"] },
    { id: "dashboard", icon: List, label: "Verify", roles: ["AUTHORITY"] },
    { id: "profile", icon: User, label: "Profile", roles: ["CITIZEN", "WORKER", "AUTHORITY"] },
  ].filter(t => t.roles.includes(userRole));

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-8 py-4 flex justify-between items-center z-50 safe-area-bottom">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all relative group",
            activeTab === id ? "text-primary" : "text-secondary hover:text-ink",
          )}
        >
          <div
            className={cn(
              "p-2 rounded-xl transition-all",
              activeTab === id
                ? "bg-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-primary/30"
                : "group-hover:bg-white/5 border border-transparent",
            )}
          >
            <Icon size={22} strokeWidth={activeTab === id ? 3 : 2} />
          </div>
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === id
                ? "opacity-100 translate-y-0"
                : "opacity-50 translate-y-0.5",
            )}
          >
            {label}
          </span>
          {activeTab === id && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          )}
        </button>
      ))}
    </nav>
  );
}
