"use client";

import { useSidebar } from "@/components/sidebar-context";
import { Button } from "@heroui/button";
import { PanelLeftOpen } from "lucide-react";
import clsx from "clsx";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div 
        className={clsx(
            "flex-1 min-h-screen bg-background transition-all duration-300 ease-in-out flex flex-col",
            isOpen ? "ml-64" : "ml-0" // Điều chỉnh lề trái
        )}
    >
        {!isOpen && (
            <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-divider px-4 h-14 flex items-center">
                <Button isIconOnly variant="light" size="sm" onPress={toggleSidebar}>
                    <PanelLeftOpen size={24} />
                </Button>
                <span className="ml-2 font-semibold text-default-600">DW Admin</span>
            </div>
        )}

        <main className="flex-1 p-8">
            <Breadcrumbs />
            {children}
        </main>
    </div>
  );
};