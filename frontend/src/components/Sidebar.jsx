import { Map, PlusCircle, List, User, LogOut, Bell } from "lucide-react";
import Header from "./Header";
import { cn } from "../lib/utils";

export default function Sidebar({
  user,
  userInitials,
  activeTab,
  setActiveTab,
  selectedComplaint,
  setSelectedComplaint,
  unreadCount,
  setIsNotificationsOpen,
  logout
}) {
  return (
    <aside className="hidden md:flex w-72 glass border-r border-white/10 flex-col sticky top-0 h-screen z-50">
      <div className="p-8 border-b border-white/10">
        <Header isSidebar />
      </div>
      <nav className="flex-1 p-6 space-y-3">
        {[
          { id: "map", icon: Map, label: "Heatmap", roles: ["CITIZEN", "WORKER", "AUTHORITY"] },
          { id: "report", icon: PlusCircle, label: "Report Issue", roles: ["CITIZEN"] },
          { id: "list", icon: List, label: user.role === "WORKER" ? "Job Queue" : "My Reports", roles: ["CITIZEN", "WORKER"] },
          { id: "dashboard", icon: List, label: "Verification Queue", roles: ["AUTHORITY"] },
          { id: "profile", icon: User, label: "My Profile", roles: ["CITIZEN", "WORKER", "AUTHORITY"] },
        ].filter(t => t.roles.includes(user.role)).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setSelectedComplaint(null);
            }}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300",
              activeTab === id && !selectedComplaint
                ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-[1.02]"
                : "text-secondary hover:bg-white/5 hover:text-ink",
            )}
          >
            <Icon size={22} />
            <span className="text-sm tracking-tight">{label}</span>
          </button>
        ))}

        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="w-full flex md:hidden items-center gap-4 px-5 py-4 rounded-2xl font-bold text-secondary hover:bg-white/5 hover:text-ink transition-all duration-300 relative"
        >
          <Bell size={22} />
          <span className="text-sm tracking-tight">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </nav>
      <div className="p-8 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-white/10">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || ""}
              className="w-10 h-10 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm italic border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              {userInitials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold truncate uppercase tracking-wider">
              {user.displayName}
            </p>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
              {user.role || "CITIZEN"} Account
            </p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-danger hover:bg-danger/5 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
