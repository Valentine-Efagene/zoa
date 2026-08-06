"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { confirmSignUp, isCognitoConfigured, signIn, signUp } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "confirm">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [code, setCode] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => signUp({ email, password, givenName, familyName }),
    onSuccess: async (result) => {
      if (result.needsConfirmation) {
        setStep("confirm");
        toast.success("Check your email for a confirmation code");
      } else {
        await signIn(email, password);
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      await confirmSignUp(email, code);
      await signIn(email, password);
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Confirmation failed");
    },
  });

  function onRegister(e: React.FormEvent) {
    e.preventDefault();
    registerMutation.mutate();
  }

  function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    confirmMutation.mutate();
  }

  const pending = registerMutation.isPending || confirmMutation.isPending;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl tracking-tight"
        >
          Zoa
        </Link>
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl tracking-tight">
          {step === "register" ? "Create account" : "Confirm email"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "register"
            ? "Start filing company and trustees registrations."
            : `Enter the code sent to ${email}.`}
          {!isCognitoConfigured() ? (
            <span className="mt-1 block text-amber-800">
              Cognito env vars not set — local mock auth is enabled.
            </span>
          ) : null}
        </p>

        {step === "register" ? (
          <form onSubmit={onRegister} className="mt-8 space-y-5">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="givenName">First name</FieldLabel>
                  <Input
                    id="givenName"
                    required
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="familyName">Surname</FieldLabel>
                  <Input
                    id="familyName"
                    required
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </FieldGroup>
            <Button type="submit" className="w-full" disabled={pending}>
              {registerMutation.isPending ? "Creating…" : "Create account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={onConfirm} className="mt-8 space-y-5">
            <Field>
              <FieldLabel htmlFor="code">Confirmation code</FieldLabel>
              <Input
                id="code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {confirmMutation.isPending
                ? "Confirming…"
                : "Confirm and continue"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
