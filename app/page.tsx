import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Zoa
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button render={<Link href="/signup" />}>Get started</Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24 pt-10">
        <p className="mb-4 text-sm font-medium tracking-wide text-primary uppercase">
          Corporate filings, simplified
        </p>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          Zoa
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Guided questionnaires for CAC companies, incorporated trustees, and
          SCUML registration — multi-person capture and document uploads in one
          place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/signup" />}>
            Open your dashboard
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            I already have an account
          </Button>
        </div>
      </main>
    </div>
  );
}
