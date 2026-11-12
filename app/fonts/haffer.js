import localFont from "next/font/local";

export const haffer = localFont({
  src: [
    { path: "./Haffer-Thin.woff2", weight: "100", style: "normal" },
    { path: "./Haffer-Light.woff2", weight: "300", style: "normal" },
    { path: "./Haffer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./Haffer-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "./Haffer-Medium.woff2", weight: "500", style: "normal" },
    { path: "./Haffer-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./Haffer-Bold.woff2", weight: "700", style: "normal" },
    { path: "./Haffer-Heavy.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-haffer-face",
  display: "swap",
});
