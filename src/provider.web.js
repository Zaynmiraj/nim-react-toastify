import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { DEFAULT_THEME, PRESET_THEMES } from "./theme-presets.js";

const createStyles = (theme) => ({
  overlay: {
    position: "fixed",
    top: 12,
    left: 12,
    right: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 99999,
    pointerEvents: "none",
  },
  pill: {
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 999,
    background: theme.pillBackground,
    color: theme.textColor,
    boxShadow: "0 4px 10px rgba(0,0,0,.15)",
    fontWeight: 600,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: theme.iconBackground,
    color: theme.iconColor,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  msg: {
    flex: 1,
    fontSize: 14,
    lineHeight: "18px",
    color: theme.textColor,
  },
  action: {
    fontWeight: 700,
    textDecoration: "underline",
    background: "transparent",
    border: 0,
    cursor: "pointer",
    color: theme.actionColor,
  },
  closeBtn: {
    marginLeft: 6,
    background: "transparent",
    border: 0,
    cursor: "pointer",
    color: theme.closeButtonColor,
    fontSize: 16,
    fontWeight: 800,
  },
});

const C = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(C);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within <NotificationsProvider>"
    );
  return ctx;
};

export const NotificationsProvider = ({
  children,
  preset = "default",
  theme,
}) => {
  const [items, setItems] = useState([]);
  const timers = useRef({});
  const normalizedTheme = useMemo(() => {
    const selectedPreset =
      typeof preset === "string" && PRESET_THEMES[preset]
        ? PRESET_THEMES[preset]
        : DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...selectedPreset, ...(theme ?? {}) };
  }, [preset, theme]);
  const styles = useMemo(() => createStyles(normalizedTheme), [
    normalizedTheme,
  ]);

  const show = useCallback((o) => {
    const id = Math.random().toString(36).slice(2);
    const notice = {
      id,
      message: o.message,
      actionLabel: o.actionLabel ?? "",
      onActionPress: o.onActionPress ?? (() => {}),
      duration: typeof o.duration === "number" ? o.duration : 3500,
      type: o.type ?? "info",
      testID: o.testID ?? undefined,
    };
    setItems((prev) => [notice, ...prev]);
    if (notice.duration > 0) {
      timers.current[id] = setTimeout(() => hide(id), notice.duration);
    }
    return id;
  }, []);

  const hide = useCallback((id) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setItems([]);
  }, []);

  const value = useMemo(() => ({ show, hide, clearAll }), [show, hide, clearAll]);

  return (
    <C.Provider value={value}>
      {children}
      <div style={styles.overlay} aria-live="polite">
        {items.map((n) => (
          <div key={n.id} style={styles.pill} data-testid={n.testID}>
            <span style={styles.iconCircle}>{icon(n.type)}</span>
            <span style={styles.msg}>{n.message}</span>
            {n.actionLabel ? (
              <button
                onClick={() => {
                  try {
                    n.onActionPress();
                  } finally {
                    hide(n.id);
                  }
                }}
                style={styles.action}
              >
                {n.actionLabel}
              </button>
            ) : null}
            <button
              onClick={() => hide(n.id)}
              style={styles.closeBtn}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </C.Provider>
  );
};

function icon(type) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "i";
}
