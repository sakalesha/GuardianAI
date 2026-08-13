import type { Role } from "@/types/auth";

export function roleHomePath(role: Role): string {
  switch (role) {
    case "WORKER":
      return "/reports";
    case "AUTHORITY":
      return "/analytics";
    default:
      return "/map";
  }
}