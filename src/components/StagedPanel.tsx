import type { LucideIcon } from "lucide-react";

export function StagedPanel({
  icon: Icon,
  title,
  subtitle,
  note,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  note: string;
}) {
  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

      <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold">Coming up next</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}
