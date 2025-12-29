import type { FC, PropsWithChildren } from "react";

export type NoticeType = "info" | "success" | "error";

export type NoticeOptions = {
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  duration?: number;
  type?: NoticeType;
  testID?: string;
};

export type ToastTheme = {
  pillBackground?: string;
  textColor?: string;
  iconBackground?: string;
  iconColor?: string;
  actionColor?: string;
  closeButtonColor?: string;
};

export type ThemePresetKey =
  | "default"
  | "dark"
  | "light"
  | "cyan"
  | "blue"
  | "purple"
  | "emerald"
  | "sunset"
  | "charcoal"
  | "coral";

export type NotificationsContext = {
  show: (options: NoticeOptions) => string;
  hide: (id: string) => void;
  clearAll: () => void;
};

export function useNotifications(): NotificationsContext;

export declare const themePresets: Record<ThemePresetKey, ToastTheme>;

export const NotificationsProvider: FC<
  PropsWithChildren<{
    preset?: ThemePresetKey;
    theme?: ToastTheme;
  }>
>;
