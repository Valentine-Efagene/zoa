"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplicationForm } from "@/components/application-form";
import { api } from "@/lib/api";
import type { Application, WorkflowDefinition } from "@/lib/types";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api
      .getApplication(params.id)
      .then((res) => {
        setApplication(res.application);
        setWorkflow(res.workflow);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, [params.id]);

  if (error) {
    return (
      <p className="text-sm text-destructive">{error}</p>
    );
  }

  if (!application || !workflow) {
    return <p className="text-sm text-muted-foreground">Loading application…</p>;
  }

  return (
    <ApplicationForm application={application} workflow={workflow} />
  );
}
