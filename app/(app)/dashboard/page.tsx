"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Application, WorkflowSummary } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apps, wfs] = await Promise.all([
          api.listApplications(),
          api.listWorkflows(),
        ]);
        if (cancelled) return;
        setApplications(apps.applications);
        setWorkflows(wfs.workflows);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const draftCount = applications.filter((a) => a.status === "draft").length;
  const openCount = applications.filter((a) =>
    ["submitted", "in_review", "needs_info"].includes(a.status),
  ).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
            {session?.name || session?.email || "Your dashboard"}
          </h1>
        </div>
        <Button render={<Link href="/applications/new" />}>
          <Plus className="size-4" />
          New application
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total applications", value: applications.length },
          { label: "Drafts", value: draftCount },
          { label: "In progress", value: openCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/70 bg-background/80 px-4 py-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}. Make sure the API is running and{" "}
          <code className="text-xs">NEXT_PUBLIC_API_URL</code> is set.
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            Recent applications
          </h2>
          <Button variant="ghost" size="sm" render={<Link href="/applications" />}>
            View all
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background/50 px-6 py-12 text-center">
            <FileText className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              No applications yet. Start a company, trustees, or SCUML filing.
            </p>
            <Button className="mt-4" render={<Link href="/applications/new" />}>
              Choose a workflow
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-background">
            {applications.slice(0, 5).map((app) => (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {workflows.find((w) => w.slug === app.workflowSlug)
                        ?.name ?? app.workflowSlug}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(app.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {STATUS_LABELS[app.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          Available workflows
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {workflows.map((wf) => (
            <Link
              key={wf.slug}
              href={`/applications/new?workflow=${wf.slug}`}
              className="group rounded-xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
            >
              <h3 className="font-medium group-hover:text-primary">
                {wf.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {wf.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Typical turnaround: {wf.estimatedDays}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
