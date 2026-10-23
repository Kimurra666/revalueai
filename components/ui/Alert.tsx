import { AlertTriangle, CircleAlert, Info } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "error" | "warning" | "info";

const tones: Record<Tone, { left: string; icon: string; bg: string; Icon: typeof Info }> = {
  error:   { left: "border-l-danger",   icon: "text-danger",   bg: "bg-white", Icon: CircleAlert    },
  warning: { left: "border-l-warning",  icon: "text-warning",  bg: "bg-white", Icon: AlertTriangle  },
  info:    { left: "border-l-line",     icon: "text-primary",  bg: "bg-surface", Icon: Info          },
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function Alert({ tone = "info", title, children, action }: AlertProps) {
  const t = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-sm border border-line border-l-4 ${t.left} ${t.bg} px-4 py-3`}
    >
      <t.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${t.icon}`} aria-hidden />
      <div className="flex flex-1 flex-col gap-1">
        {title && <p className="text-sm font-medium text-ink">{title}</p>}
        {children && <div className="text-xs text-muted">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

/** After a failed submit, lists validation errors as jump links. */
export function ErrorSummary({
  errors,
  idFor,
}: {
  errors: Record<string, string>;
  /** Maps an error key to the element id to jump to. */
  idFor: (key: string) => string;
}) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  return (
    <Alert
      tone="error"
      title={`${entries.length} ${entries.length === 1 ? "answer needs" : "answers need"} attention`}
    >
      <ul className="mt-1 flex flex-col gap-0.5">
        {entries.map(([key, msg]) => (
          <li key={key}>
            <a
              href={`#${idFor(key)}`}
              className="underline underline-offset-2 hover:text-ink"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(idFor(key));
                el?.focus({ preventScroll: true });
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </Alert>
  );
}
