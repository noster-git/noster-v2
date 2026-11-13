import "./globals.css";
import { Inter } from "next/font/google";
import { haffer, hafferRegular } from "./fonts/haffer";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Noster Associates | Elevating Workspaces",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${haffer.variable} ${hafferRegular.variable}`}>
      <body>
        <SmoothScroll>
          <Navigation />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
