import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";

type NoticeType = "info" | "success" | "error";

export type NoticeOptions = {
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  duration?: number;
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
    if (n.duration > 0)
      timers.current[id] = setTimeout(() => hide(id), n.duration);
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
      <View pointerEvents="box-none" style={styles.overlay}>
        {items.map((n) => (
          <View key={n.id} style={styles.pill} accessibilityRole="alert">
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{icon(n.type)}</Text>
            </View>
            <Text style={styles.msg} numberOfLines={2}>
              {n.message}
            </Text>
            {n.actionLabel ? (
              <TouchableOpacity
                onPress={() => {
                  try {
                    n.onActionPress();
                  } finally {
                    hide(n.id);
                  }
                }}
                style={styles.actionWrap}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.actionText}>{n.actionLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => hide(n.id)}
              style={styles.closeWrap}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </C.Provider>
  );
};

const COLORS = { cyan: "#9AE6F0", ink: "#0B0F14" };

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: Platform.select({ ios: 54, android: 24 }),
    left: 12,
    right: 12,
    zIndex: 99999,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: COLORS.cyan,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: { color: COLORS.cyan, fontWeight: "800" },
  msg: { flex: 1, color: COLORS.ink, fontSize: 14, fontWeight: "600" },
  actionWrap: { marginLeft: 12 },
  actionText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  closeWrap: { marginLeft: 10 },
  closeText: { color: COLORS.ink, fontSize: 16, fontWeight: "800" },
});

function icon(type: NoticeType) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "i";
}
