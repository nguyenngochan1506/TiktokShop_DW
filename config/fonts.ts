import { Inter, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin", "vietnamese"], 
  weight: ["300", "400", "500", "600", "700"], 
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: false
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap",
});