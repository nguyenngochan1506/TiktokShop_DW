import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono } from "@/config/fonts";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/sidebar-context";
import { MainLayout } from "@/components/main-layout";
import clsx from "clsx";
import { auth } from "@/auth"; // Import auth

export const metadata: Metadata = {
  title: "Data Warehouse Admin",
  description: "Manage crawl sources and view data",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lấy session server-side
  const session = await auth();

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
          {!session?.user ? (
             <main className="h-screen w-full">{children}</main>
          ) : (
            <SidebarProvider>
              <div className="flex min-h-screen">
                <Sidebar user={session.user} />
                
                <MainLayout>
                  {children}
                </MainLayout>
              </div>
            </SidebarProvider>
          )}
        </Providers>
      </body>
    </html>
  );
}