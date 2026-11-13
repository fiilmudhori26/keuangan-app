import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  as: Tag = "section",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={cn("rounded-[14px] border border-border bg-card p-4", className)}>
      {children}
    </Tag>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h2 className="text-[18px] font-semibold text-foreground">{title}</h2>
      {action}
    </div>
  );
}
