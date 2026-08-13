import { Spinner } from "@/components/ui/spinner";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Spinner label="Loading" />
    </div>
  );
}