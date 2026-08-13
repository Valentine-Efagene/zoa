import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  variant?: "mark" | "wordmark" | "horizontal";
  showTagline?: boolean;
  onDark?: boolean;
};

/**
 * Z.O.A mark — thick O ring with Z-inspired wings (style guide).
 */
function ZoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M6 14.5 29.5 27.2c.85.45 1.15 1.5.6 2.25l-3.3 4.45c-.4.55-1.15.7-1.75.35L6.8 21.8c-1.05-.6-1.1-2.1-.1-2.8L6 14.5Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M36 16c12.15 0 22 9.85 22 22s-9.85 22-22 22S14 50.15 14 38s9.85-22 22-22Zm0 12c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10Z"
      />
      <path
        fill="currentColor"
        d="M49 48.5 64.5 63.2c.85.8.25 2.2-.9 2.2h-7.2c-.7 0-1.3-.45-1.5-1.1L46.5 50.8c-.4-1.15.45-2.35 1.65-2.35.3 0 .6.05.85.2Z"
      />
      <rect
        x="30"
        y="64"
        width="30"
        height="3.5"
        rx="1.5"
        fill="currentColor"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  variant = "horizontal",
  showTagline = false,
  onDark = false,
}: BrandLogoProps) {
  const wordColor = "text-[var(--zoa-orange)]";
  const tagColor = onDark ? "text-white/80" : "text-[var(--zoa-blue)]";
  const markColor = onDark ? "text-white" : "text-[var(--zoa-blue)]";

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <ZoMark className={cn("size-8", markColor)} />
        <span className="sr-only">Z.O.A</span>
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        className={cn(
          "inline-flex flex-col font-[family-name:var(--font-display)] tracking-tight",
          className,
        )}
      >
        <span className={cn("text-xl font-medium leading-none", wordColor)}>
          Z.O.A
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 text-[0.55rem] font-medium tracking-[0.14em] uppercase",
              tagColor,
            )}
          >
            Corporate Service Limited
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ZoMark className={cn("size-9", markColor)} />
      <span className="inline-flex flex-col font-[family-name:var(--font-display)] tracking-tight">
        <span
          className={cn(
            "text-lg font-medium leading-none sm:text-xl",
            wordColor,
          )}
        >
          Z.O.A
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 text-[0.55rem] font-medium tracking-[0.12em] uppercase",
              tagColor,
            )}
          >
            Corporate Service Limited
          </span>
        ) : null}
      </span>
    </span>
  );
}

export { ZoMark };
