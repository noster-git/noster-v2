import "./globals.css";
import { haffer } from "./fonts/haffer";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata = {
  title: "Noster Associates | Elevating Workspaces",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={haffer.variable}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
