import {
  BarChart3,
  ClipboardList,
  Map as MapIcon,
  PlusCircle,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: readonly Role[];
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Map", to: "/map", icon: MapIcon, roles: ["CITIZEN", "WORKER", "AUTHORITY"] },
  { label: "My Reports", to: "/reports", icon: ClipboardList, roles: ["CITIZEN"] },
  { label: "Job Queue", to: "/reports", icon: ClipboardList, roles: ["WORKER"] },
  { label: "New Report", to: "/report", icon: PlusCircle, roles: ["CITIZEN"] },
  { label: "Authority", to: "/authority", icon: ShieldCheck, roles: ["AUTHORITY"] },
  { label: "Analytics", to: "/analytics", icon: BarChart3, roles: ["WORKER", "AUTHORITY"] },
  { label: "Profile", to: "/profile", icon: UserRound, roles: ["CITIZEN", "WORKER", "AUTHORITY"] },
];

export function itemsForRole(role: Role | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}