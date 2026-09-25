import { STATUS_META } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  const meta = STATUS_META[status] ?? { label: status, color: "text-zinc-500", dot: "bg-zinc-400" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.color, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", meta.dot)} />
      {meta.label}
    </span>
  );
}
