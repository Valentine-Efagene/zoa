"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DocumentUploader } from "@/components/document-uploader";
import type {
  ApplicationDocument,
  PersonRecord,
  WorkflowField,
  WorkflowGroup,
  WorkflowSingular,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function emptyPerson(fields: WorkflowField[]): PersonRecord {
  return Object.fromEntries(fields.map((f) => [f.id, ""]));
}

export function FieldControl({
  field,
  value,
  onChange,
  optionsOverride,
}: {
  field: WorkflowField;
  value: string;
  onChange: (v: string) => void;
  optionsOverride?: string[];
}) {
  const options = optionsOverride ?? field.options ?? [];

  if (field.type === "textarea") {
    return (
      <Textarea
        id={field.id}
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select
        value={value || null}
        onValueChange={(v) => onChange(v == null ? "" : String(v))}
      >
        <SelectTrigger className="w-full" id={field.id}>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <SelectItem value="__empty" disabled>
              Add people above first
            </SelectItem>
          ) : (
            options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      id={field.id}
      type={field.type}
      value={value}
      placeholder={field.placeholder}
      required={field.required}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function FieldsGrid({
  fields,
  values,
  onChange,
  idPrefix,
  selectOptions,
}: {
  fields: WorkflowField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  idPrefix?: string;
  selectOptions?: Record<string, string[]>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <Field
          key={`${idPrefix ?? ""}${field.id}`}
          className={cn(field.colSpan === 2 && "sm:col-span-2")}
        >
          <FieldLabel htmlFor={`${idPrefix ?? ""}${field.id}`}>
            {field.label}
            {field.required ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </FieldLabel>
          <FieldControl
            field={{ ...field, id: `${idPrefix ?? ""}${field.id}` }}
            value={values[field.id] ?? ""}
            onChange={(v) => onChange(field.id, v)}
            optionsOverride={selectOptions?.[field.id]}
          />
          {field.helperText ? (
            <FieldDescription>{field.helperText}</FieldDescription>
          ) : null}
        </Field>
      ))}
    </div>
  );
}

export function RepeatableGroupEditor({
  group,
  items,
  onChange,
  applicationId,
  documents,
  onDocumentUploaded,
}: {
  group: WorkflowGroup;
  items: PersonRecord[];
  onChange: (items: PersonRecord[]) => void;
  applicationId: string;
  documents: ApplicationDocument[];
  onDocumentUploaded: (doc: ApplicationDocument) => void;
}) {
  function updateItem(index: number, fieldId: string, value: string) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [fieldId]: value } : item,
    );
    onChange(next);
  }

  function addItem() {
    if (items.length >= group.maxItems) return;
    onChange([...items, emptyPerson(group.fields)]);
  }

  function removeItem(index: number) {
    if (items.length <= group.minItems) return;
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            {group.label}
          </h2>
          {group.helperText ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {group.helperText}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          disabled={items.length >= group.maxItems}
        >
          <PlusIcon className="size-3.5" />
          {group.addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/50 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No {group.itemLabel.toLowerCase()}s yet.
          </p>
          <Button
            type="button"
            className="mt-3"
            size="sm"
            onClick={addItem}
          >
            <PlusIcon className="size-3.5" />
            {group.addLabel}
          </Button>
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item, index) => (
          <article
            key={index}
            className="rounded-xl border border-border/80 bg-background p-4 sm:p-5 shadow-[0_1px_0_oklch(0_0_0/0.03)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">
                {group.itemLabel} {index + 1}
                {item.firstName || item.surname ? (
                  <span className="ml-2 font-normal text-muted-foreground">
                    — {[item.firstName, item.surname].filter(Boolean).join(" ")}
                  </span>
                ) : null}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:text-destructive"
                disabled={items.length <= group.minItems}
                onClick={() => removeItem(index)}
              >
                <Trash2Icon className="size-3.5" />
                Remove
              </Button>
            </div>

            <FieldsGrid
              fields={group.fields}
              values={item}
              idPrefix={`${group.id}-${index}-`}
              onChange={(fieldId, value) => updateItem(index, fieldId, value)}
            />

            {group.documents && group.documents.length > 0 ? (
              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="mb-3 text-sm font-medium">
                  Documents for this {group.itemLabel.toLowerCase()}
                </p>
                <DocumentUploader
                  applicationId={applicationId}
                  docs={group.documents}
                  uploaded={documents}
                  ownerKey={`${group.id}:${index}`}
                  onUploaded={onDocumentUploaded}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function SingularEditor({
  singular,
  value,
  enabled,
  onEnabledChange,
  onChange,
  applicationId,
  documents,
  onDocumentUploaded,
}: {
  singular: WorkflowSingular;
  value: PersonRecord | null;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onChange: (value: PersonRecord | null) => void;
  applicationId: string;
  documents: ApplicationDocument[];
  onDocumentUploaded: (doc: ApplicationDocument) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
          {singular.label}
        </h2>
        {singular.helperText ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {singular.helperText}
          </p>
        ) : null}
      </div>

      {singular.optional ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-border accent-[var(--zoa-accent)]"
            checked={enabled}
            onChange={(e) => {
              const next = e.target.checked;
              onEnabledChange(next);
              onChange(next ? emptyPerson(singular.fields) : null);
            }}
          />
          {singular.toggleLabel ?? `Include ${singular.label.toLowerCase()}`}
        </label>
      ) : null}

      {enabled && value ? (
        <div className="rounded-xl border border-border/80 bg-background p-4 sm:p-5">
          <FieldsGrid
            fields={singular.fields}
            values={value}
            idPrefix={`${singular.id}-`}
            onChange={(fieldId, v) =>
              onChange({ ...value, [fieldId]: v })
            }
          />
          {singular.documents && singular.documents.length > 0 ? (
            <div className="mt-5 border-t border-border/70 pt-4">
              <DocumentUploader
                applicationId={applicationId}
                docs={singular.documents}
                uploaded={documents}
                ownerKey={singular.id}
                onUploaded={onDocumentUploaded}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { emptyPerson, FieldGroup };
