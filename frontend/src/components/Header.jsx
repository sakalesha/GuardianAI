import { ShieldCheck, Bell } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";

export default function Header({ isSidebar, onOpenNotifications = () => {} }) {
  const { unreadCount } = useNotifications();

  if (isSidebar) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-primary/50">
          <ShieldCheck className="text-primary" size={28} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-primary italic leading-none">
            CivicProof
          </h1>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mt-1">
            Premium Edition
          </span>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 glass border-b border-white/10 px-8 py-5 flex justify-between items-center z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-primary/50">
          <ShieldCheck className="text-primary" size={22} />
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-primary italic">
          CivicProof
        </h1>
      </div>
      <button
        onClick={onOpenNotifications}
        className="relative w-12 h-12 rounded-2xl glass flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
      >
        <Bell size={22} className="text-ink" />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-danger rounded-full shadow-[0_0_10px_rgba(255,0,85,0.8)]"></span>
        )}
      </button>
    </header>
  );
}
