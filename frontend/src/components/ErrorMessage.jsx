import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function ErrorMessage({ message, className }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "p-4 bg-danger/5 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger animate-slam",
            className,
          )}
        >
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
