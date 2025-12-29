import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DEFAULT_THEME, PRESET_THEMES } from "./theme-presets.js";

const C = createContext(null);

const DEFAULT_THEME = {
  pillBackground: "#9AE6F0",
  textColor: "#0B0F14",
  iconBackground: "#0B0F14",
  iconColor: "#9AE6F0",
  actionColor: "#0B0F14",
  closeButtonColor: "#0B0F14",
};

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

const createStyles = (theme) =>
  StyleSheet.create({
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
      backgroundColor: theme.pillBackground,
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
      backgroundColor: theme.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    iconText: { color: theme.iconColor, fontWeight: "800" },
    msg: {
      flex: 1,
      color: theme.textColor,
      fontSize: 14,
      fontWeight: "600",
    },
    actionWrap: { marginLeft: 12 },
    actionText: {
      color: theme.actionColor,
      fontSize: 13,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    closeWrap: { marginLeft: 10 },
    closeText: {
      color: theme.closeButtonColor,
      fontSize: 16,
      fontWeight: "800",
    },
  });

function icon(type) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "i";
}

export { PRESET_THEMES as themePresets };
