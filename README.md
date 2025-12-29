# nim-react-toastify Instructions

## Purpose
`nim-react-toastify` is a one-command CLI that detects your React/Next.js/Expo stack, injects a `NotificationsProvider`, and wires you up to a ready-made toast system that ships across platforms.

## Getting Started
1. Install the package:
   ```bash
   npm install nim-react-toastify
   # or yarn add nim-react-toastify
   ```
2. Run the CLI from your project root:
   ```bash
   npx nim-react-toastify
   ```
   It will detect the stack, locate your root (App.tsx, src/App.tsx, app/layout.tsx, etc.), insert the provider import from `nim-react-toastify`, and wrap your root JSX so the toast context is available globally.

## Theme Selection
`NotificationsProvider` accepts two props:
- `preset`: one of `default`, `dark`, `light`, `cyan`, `blue`, `purple`, `emerald`, `sunset`, `charcoal`, `coral`. Each preset applies a curated palette to the toast pill, icon, action link, and close control.
- `theme`: optional overrides for any palette keys (pillBackground, textColor, iconBackground, iconColor, actionColor, closeButtonColor). Custom values merge on top of the selected preset or the default palette.

Example:
```tsx
import { NotificationsProvider } from "nim-react-toastify";

<NotificationsProvider preset="sunset" theme={{ actionColor: "#38BDF8" }}>
  <App />
</NotificationsProvider>
```
Use `import { themePresets } from "nim-react-toastify";` if you need to reuse preset objects elsewhere.

## Runtime API
Inside any component:
```tsx
import { useNotifications } from "nim-react-toastify";

const { show, hide, clearAll } = useNotifications();

show({
  type: "success",
  message: "Order placed!",
  actionLabel: "View order",
  onActionPress: () => console.log("Action"),
});
```

`show` returns an ID that you can pass to `hide` later, and `clearAll` dismisses every active toast.

## Publishing / Distribution
- `package.json` entries expose `main`, `types`, `exports`, and a `react-native` entry so consumers import from `"nim-react-toastify"`.
- The CLI entry remains `cli.js` under `bin` so `npx nim-react-toastify` works unchanged.
- GitHub tags (e.g., `v1.0.3`) trigger your CI/CD workflow to publish to npm.

For more details, refer to the full `README.md` in the repository.
