import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export function RootLayout() {
  return (
    <>
      <Toaster position="top-right" />
      <Outlet />
    </>
  );
}