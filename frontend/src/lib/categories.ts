import {
  Droplets,
  Lightbulb,
  MoreHorizontal,
  Trash2,
  TreeDeciduous,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { COMPLAINT_CATEGORIES, type ComplaintCategory } from "@/types/complaint";

export const SLA_HOURS: Record<ComplaintCategory, number> = {
  Pothole: 48,
  Garbage: 24,
  Streetlight: 72,
  "Water Leakage": 24,
  "Fallen Tree": 12,
  Other: 72,
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  Pothole: "#e11d48",
  Garbage: "#d97706",
  Streetlight: "#2563eb",
  "Water Leakage": "#0891b2",
  "Fallen Tree": "#059669",
  Other: "#71717a",
};

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  slaHours: number;
}

export const CATEGORY_META: Record<ComplaintCategory, CategoryMeta> = {
  Pothole: { label: "Pothole", icon: TriangleAlert, slaHours: 48 },
  Garbage: { label: "Garbage", icon: Trash2, slaHours: 24 },
  Streetlight: { label: "Streetlight", icon: Lightbulb, slaHours: 72 },
  "Water Leakage": { label: "Water Leakage", icon: Droplets, slaHours: 24 },
  "Fallen Tree": { label: "Fallen Tree", icon: TreeDeciduous, slaHours: 12 },
  Other: { label: "Other", icon: MoreHorizontal, slaHours: 72 },
};

export function categoryMeta(category: string): CategoryMeta {
  if ((COMPLAINT_CATEGORIES as readonly string[]).includes(category)) {
    return CATEGORY_META[category as ComplaintCategory];
  }
  return CATEGORY_META.Other;
}

export function slaHoursFor(category: string): number {
  return categoryMeta(category).slaHours;
}