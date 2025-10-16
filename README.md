# 🧩 nim-react-toastify

> ⚡ One-command global toast notification system for **React**, **Next.js**, and **React Native / Expo**.

`nim-react-toastify` automatically sets up a modern, beautiful notification (toast) system in your project — **with a single command**.  
It detects your stack type (React, Next.js, or React Native), finds your app’s root file, injects a global `<NotificationsProvider>`, and creates a ready-to-use hook.

---

## 🚀 Features

- ✅ **Automatic stack detection** (`react`, `react-native`, or `nextjs`)
- 🔍 **Auto-locates root file** (`App.tsx`, `src/App.tsx`, `app/layout.tsx`, `app/_layout.tsx`, etc.)
- 🧠 **Auto-wires provider & import** (no manual setup)
- 💬 **Beautiful notification design**
  - Matches your screenshot style (cyan pill with dark text)
- ⚙️ **Works with both JSX and TSX**
- 🧱 **No external dependencies**
- 🧵 **Same API for all platforms**

---

## 📦 Installation

```bash
npm i nim-react-toastify
```

## Then run:

```
npx nim-react-toastify
```

## Or using yarn / pnpm:

```
yarn nim-react-toastify
# or
pnpm dlx nim-react-toastify
```

### 🧠 What It Does

When you run npx nim-react-toastify, the CLI:

1. Detects your stack

   If next found → assumes Next.js

   If react-native / expo found → assumes React Native / Expo

   Else → assumes React (Vite/CRA)

2. Finds your root file
   Checks for:
   ```
   app/layout.tsx, app/_layout.tsx, App.tsx, src/App.tsx, index.tsx, etc.
   ```
3. Creates provider
   It generates src/nim-react-toastify/NotificationsProvider.tsx with the proper implementation (web or native).

4. Injects import & wrapper
   It adds:
   ````
   import { NotificationsProvider } from "./src/nim-react-toastify/NotificationsProvider";```
   ````
   ## and wraps your app with:
   ```
   <NotificationsProvider> ... </NotificationsProvider>
   ```
5. ✅ Done! Your app now has a global notification context.

### 🧩 Usage

After running npx nim-react-toastify, you can immediately use the toast system from anywhere in your app.

## React / Next.js Example

```
import { useNotifications } from "src/nim-react-toastify/NotificationsProvider";

export default function Demo() {
  const { show } = useNotifications();

  return (
    <button
      onClick={() =>
        show({
          type: "success",
          message: "Order placed successfully",
          actionLabel: "View Order",
          onActionPress: () => alert("Navigating to Order..."),
        })
      }
    >
      Place Order
    </button>
  );
}
```

## React Native / Expo Example

```
import React from "react";
import { Button, View } from "react-native";
import { useNotifications } from "src/nim-react-toastify/NotificationsProvider";

export default function ExampleScreen() {
  const { show } = useNotifications();

  return (
    <View style={{ padding: 24 }}>
      <Button
        title="Add to Cart"
        onPress={() =>
          show({
            type: "success",
            message: "Product added to cart",
            actionLabel: "View Cart",
            onActionPress: () => console.log("Navigating to cart..."),
          })
        }
      />
    </View>
  );
}
```

## 💬 API Reference

    | Option          | Type                             | Default      | Description                                                |
    | --------------- | -------------------------------- | ------------ | ---------------------------------------------------------- |
    | `message`       | `string`                         | **required** | The text displayed in the toast                            |
    | `type`          | `"info" \| "success" \| "error"` | `"info"`     | Controls icon & color                                      |
    | `actionLabel`   | `string`                         | —            | Optional small button/link text (e.g. “Undo”, “View Cart”) |
    | `onActionPress` | `() => void`                     | —            | Action executed when button pressed                        |
    | `duration`      | `number`                         | `3500`       | Duration (ms). Set `0` for persistent                      |
    | `testID`        | `string`                         | —            | Optional test identifier for E2E/UI tests                  |

## Hook Functions

```
const { show, hide, clearAll } = useNotifications();
```

## 🎨 Design

    Each toast is a pill-shaped cyan bubble with:

    Left icon (✓, ✕, or i)

    Main message text

    Optional action link (like “Undo”)

    Dismiss ✕ button on right

    Smooth stacking (latest appears on top)

    Type Icon Color
    info ℹ️ Cyan background
    success ✓ Cyan background
    error ✕ Cyan background

    Designed to match your provided screenshot style exactly.

## 🛠️ Generated File Structure

After running npx nim-react-toastify, you’ll get:

```
src/
└─ nim-react-toastify/
└─ NotificationsProvider.tsx
```

Your root file (App.tsx, layout.tsx, etc.) will be automatically wrapped.

## 🧩 Example Project Integration

# For React (CRA or Vite)

- Root: src/App.tsx

```
return (
  <NotificationsProvider>
    <YourApp />
  </NotificationsProvider>
);
```

## For Next.js (App Router)

- Root: app/layout.tsx

```
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationsProvider>{children}</NotificationsProvider>
      </body>
    </html>
  );
}
```

## For React Native / Expo

- Root: App.tsx or app/\_layout.tsx

```
export default function App() {
  return (
    <NotificationsProvider>
      <StackNavigator />
    </NotificationsProvider>
  );
}
```

## 🧰 Developer Notes

    Fully ESM (Node 16+)

    No dependencies, no bundler config required

    Safe idempotent injection (runs multiple times without duplication)

    Creates minimal & readable context code

    Designed for instant use without manual wiring

## 🧠 Summary

    | Stack                | Works | Auto-detect | JSX/TSX |

    | -------------------- | ----- | ----------- | ------- |
    | React (Vite, CRA) | ✅ | ✅ | ✅ |
    | Next.js (App Router) | ✅ | ✅ | ✅ |
    | React Native / Expo | ✅ | ✅ | ✅ |

## 📜 License

MIT License

© 2025 NimCloud Systems — Developed by ZaYn Miraj.
