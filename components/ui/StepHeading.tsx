"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The single <h1> for each step. Receives focus on mount so screen readers announce the new step. */
export function StepHeading({ title, children }: { title: string; children?: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h1 ref={ref} tabIndex={-1} className="text-3xl font-semibold leading-tight">
        {title}
      </h1>
      {children && <p className="text-md text-muted leading-normal">{children}</p>}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold leading-snug">{title}</h2>
        {description && (
          <p className="text-sm text-muted leading-normal">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
