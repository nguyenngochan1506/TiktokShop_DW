import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/fonts";
import { Sidebar } from "@/components/sidebar";
import clsx from "clsx";

export const metadata: Metadata = {
  title: "Data Warehouse Admin",
  description: "Manage crawl sources and view data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="flex min-h-screen">
            {/* Sidebar cố định */}
            <Sidebar />
            
            {/* Nội dung chính bên phải */}
            <main className="flex-1 ml-64 p-8 bg-background">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}