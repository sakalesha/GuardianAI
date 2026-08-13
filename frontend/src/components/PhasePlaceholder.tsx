import { Hammer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";

interface PhasePlaceholderProps {
  title: string;
  description: string;
  phase: string;
}

export function PhasePlaceholder({ title, description, phase }: PhasePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Hammer className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            This view is implemented in <span className="font-semibold">Phase {phase}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}