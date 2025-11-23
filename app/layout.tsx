import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/fonts";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-context"; // Import 1
import { MainLayout } from "@/components/main-layout"; // Import 2
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
          {/* Bọc toàn bộ app trong SidebarProvider */}
          <SidebarProvider>
            <div className="flex min-h-screen">
              
              <Sidebar />
              
              <MainLayout>
                {children}
              </MainLayout>
              
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}