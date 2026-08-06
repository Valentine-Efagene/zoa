"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { WorkflowSlug, WorkflowSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

function NewApplicationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preset = searchParams.get("workflow") as WorkflowSlug | null;
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [selected, setSelected] = useState<WorkflowSlug | null>(preset);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    api.listWorkflows().then((res) => {
      setWorkflows(res.workflows);
      if (preset) setSelected(preset);
    });
  }, [preset]);

  function start() {
    if (!selected) return;
    startTransition(async () => {
      try {
        const { application } = await api.createApplication(selected);
        router.push(`/applications/${application.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not start");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
          New application
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a registration workflow. You will fill only the fields that
          apply — add directors, shareholders, or trustees as needed.
        </p>
      </div>

      <div className="space-y-3">
        {workflows.map((wf) => {
          const active = selected === wf.slug;
          return (
            <button
              key={wf.slug}
              type="button"
              onClick={() => setSelected(wf.slug)}
              className={cn(
                "w-full rounded-xl border px-5 py-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
                  : "border-border/70 bg-background hover:border-primary/25",
              )}
            >
              <p className="font-medium">{wf.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {wf.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {wf.estimatedDays}
              </p>
            </button>
          );
        })}
      </div>

      <Button disabled={!selected || pending} onClick={start} size="lg">
        {pending ? "Starting…" : "Continue to form"}
      </Button>
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading workflows…</p>
      }
    >
      <NewApplicationInner />
    </Suspense>
  );
}
