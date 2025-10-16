import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type NoticeType = "info" | "success" | "error";

export type NoticeOptions = {
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  duration?: number; // ms; 0 = persistent
  type?: NoticeType;
  testID?: string;
};

type NoticeItem = Required<NoticeOptions> & { id: string };
type Ctx = {
  show: (o: NoticeOptions) => string;
  hide: (id: string) => void;
  clearAll: () => void;
};

const C = createContext<Ctx | null>(null);

export const useNotifications = () => {
  const ctx = useContext(C);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within <NotificationsProvider>"
    );
  return ctx;
};

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [items, setItems] = useState<NoticeItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const show = useCallback((o: NoticeOptions) => {
    const id = Math.random().toString(36).slice(2);
    const n: NoticeItem = {
      id,
      message: o.message,
      actionLabel: o.actionLabel ?? "",
      onActionPress: o.onActionPress ?? (() => {}),
      duration: typeof o.duration === "number" ? o.duration : 3500,
      type: o.type ?? "info",
      testID: o.testID ?? undefined,
    };
    setItems((p) => [n, ...p]);
    if (n.duration > 0) {
      timers.current[id] = setTimeout(() => hide(id), n.duration);
    }
    return id;
  }, []);

  const hide = useCallback((id: string) => {
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setItems((p) => p.filter((x) => x.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setItems([]);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ show, hide, clearAll }),
    [show, hide, clearAll]
  );

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

const colors = {
  cyan: "#9AE6F0",
  ink: "#0B0F14",
};

const styles: Record<string, React.CSSProperties> = {
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
    background: colors.cyan,
    color: colors.ink,
    boxShadow: "0 4px 10px rgba(0,0,0,.15)",
    fontWeight: 600,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: colors.ink,
    color: colors.cyan,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  msg: { flex: 1, fontSize: 14, lineHeight: "18px" },
  action: {
    fontWeight: 700,
    textDecoration: "underline",
    background: "transparent",
    border: 0,
    cursor: "pointer",
    color: colors.ink,
  },
  closeBtn: {
    marginLeft: 6,
    background: "transparent",
    border: 0,
    cursor: "pointer",
    color: colors.ink,
    fontSize: 16,
    fontWeight: 800,
  },
};

function icon(type: NoticeType) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "i";
}
