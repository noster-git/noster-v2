import "./globals.css";
import { Inter } from "next/font/google";
import { haffer } from "./fonts/haffer";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Noster Associates | Elevating Workspaces",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${haffer.variable}`}>
      <body>
        <SmoothScroll>
          <Navigation />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
