import { CircleCheck, CircleX, ClockArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import type { BadgeContext } from "@/types/ui";

type Props = {
  label: string;
  status: BadgeContext;
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
};

const statusClasses: Record<BadgeContext, string> = {
  success: "border border-success/20 bg-success/10 text-success",
  error: "border border-danger/20 bg-danger/10 text-danger",
  warning: "border border-warning/20 bg-warning/10 text-warning",
  mute: "border border-slate-200 bg-surface text-gray",
};

const statusIcons: Record<BadgeContext, ReactNode> = {
  success: <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />,
  error: <CircleX aria-hidden="true" className="h-4 w-4 shrink-0" />,
  warning: <ClockArrowDown aria-hidden="true" className="h-4 w-4 shrink-0" />,
  mute: null,
};

const sizeClasses = {
  sm: "gap-1 rounded-full px-2 py-0.5 text-[10px]",
  md: "gap-1.5 rounded-2xl px-4 py-2 text-sm md:px-7 md:py-3 md:text-xl",
} as const;

export default function StatusTag({
  label,
  status,
  onClick,
  size = "md",
  className = "",
}: Props) {
  const classes = `inline-flex items-center font-semibold ${sizeClasses[size]} ${statusClasses[status]} ${className}`;
  const content = (
    <>
      {statusIcons[status]}
      {label}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <span className={classes}>{content}</span>;
}
