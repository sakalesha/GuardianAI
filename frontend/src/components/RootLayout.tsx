import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AmbientBackground } from "@/components/AmbientBackground";

export function RootLayout() {
  return (
    <>
      <AmbientBackground />
      <Toaster position="top-right" />
      <Outlet />
    </>
  );
}