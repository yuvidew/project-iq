import type { Theme } from "@blocknote/mantine";

// Light theme matching shadcn
export const lightTheme = {
    colors: {
        editor: {
            text: "oklch(0.141 0.005 285.823)",        // --foreground
            background: "oklch(1 0 0)",                 // --background
        },
        menu: {
            text: "oklch(0.141 0.005 285.823)",        // --foreground
            background: "oklch(1 0 0)",                 // --popover
        },
        tooltip: {
            text: "oklch(0.141 0.005 285.823)",        // --foreground
            background: "oklch(0.967 0.001 286.375)",  // --muted
        },
        hovered: {
            text: "oklch(0.141 0.005 285.823)",        // --foreground
            background: "oklch(0.967 0.001 286.375)",  // --accent
        },
        selected: {
            text: "oklch(0.97 0.014 254.604)",         // --primary-foreground
            background: "oklch(0.488 0.243 264.376)", // --primary
        },
        disabled: {
            text: "oklch(0.552 0.016 285.938)",        // --muted-foreground
            background: "oklch(0.967 0.001 286.375)",  // --muted
        },
        shadow: "oklch(0.92 0.004 286.32)",            // --border
        border: "oklch(0.92 0.004 286.32)",            // --border
        sideMenu: "oklch(0.552 0.016 285.938)",        // --muted-foreground
        highlights: {
            gray: { text: "#9b9a97", background: "#ebeced" },
            brown: { text: "#64473a", background: "#e9e5e3" },
            red: { text: "#e03e3e", background: "#fbe4e4" },
            orange: { text: "#d9730d", background: "#faebdd" },
            yellow: { text: "#dfab01", background: "#fbf3db" },
            green: { text: "#4d6461", background: "#ddedea" },
            blue: { text: "#0b6e99", background: "#ddebf1" },
            purple: { text: "#6940a5", background: "#eae4f2" },
            pink: { text: "#ad1a72", background: "#f4dfeb" },
        },
    },
    borderRadius: 6,
    fontFamily: "inherit",
} satisfies Theme;

// Dark theme matching shadcn
export const darkTheme = {
    colors: {
        editor: {
            text: "oklch(0.985 0 0)",                   // --foreground (dark)
            background: "oklch(0.141 0.005 285.823)",  // --background (dark)
        },
        menu: {
            text: "oklch(0.985 0 0)",                   // --foreground (dark)
            background: "oklch(0.21 0.006 285.885)",   // --popover (dark)
        },
        tooltip: {
            text: "oklch(0.985 0 0)",                   // --foreground (dark)
            background: "oklch(0.274 0.006 286.033)",  // --muted (dark)
        },
        hovered: {
            text: "oklch(0.985 0 0)",                   // --foreground (dark)
            background: "oklch(0.274 0.006 286.033)",  // --accent (dark)
        },
        selected: {
            text: "oklch(0.97 0.014 254.604)",         // --primary-foreground
            background: "oklch(0.488 0.243 264.376)", // --primary
        },
        disabled: {
            text: "oklch(0.705 0.015 286.067)",        // --muted-foreground (dark)
            background: "oklch(0.274 0.006 286.033)",  // --muted (dark)
        },
        shadow: "oklch(1 0 0 / 10%)",                  // --border (dark)
        border: "oklch(1 0 0 / 10%)",                  // --border (dark)
        sideMenu: "oklch(0.705 0.015 286.067)",        // --muted-foreground (dark)
        highlights: {
            gray: { text: "#9b9a97", background: "#3f3f3f" },
            brown: { text: "#96705b", background: "#3e3228" },
            red: { text: "#e06b6b", background: "#4e2c2c" },
            orange: { text: "#e69d4c", background: "#4a3520" },
            yellow: { text: "#e6c84c", background: "#4a4220" },
            green: { text: "#6b9b8d", background: "#283d38" },
            blue: { text: "#4c9bbe", background: "#203545" },
            purple: { text: "#9b75cf", background: "#352a45" },
            pink: { text: "#d15b9d", background: "#452a38" },
        },
    },
    borderRadius: 6,
    fontFamily: "inherit",
} satisfies Theme;