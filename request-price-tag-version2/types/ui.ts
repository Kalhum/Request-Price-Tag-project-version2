export type BadgeContext = "success" | "error" | "warning" | "mute";

export type ToastType = "success" | "error" | "info" | "warning";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export type TableSize = "sm" | "md" | "lg";

export type TableAlign = "left" | "center" | "right";

export type ComboboxSize = "sm" | "md" | "lg";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}
