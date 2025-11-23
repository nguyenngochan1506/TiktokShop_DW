"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    HomeIcon,
    DatabaseIcon,
    FileTextIcon,
    SettingsIcon,
    LayersIcon
} from "lucide-react";
import { ThemeSwitch } from "./theme-switch";

const menuItems = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Source Configs", href: "/sources", icon: SettingsIcon },
    { name: "Crawl Logs", href: "/logs", icon: FileTextIcon },
    { name: "Raw Products", href: "/raw-data", icon: DatabaseIcon },
    { name: "Base Products", href: "/products", icon: LayersIcon },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-content1 border-r border-divider flex flex-col fixed left-0 top-0 z-50">
            <div className="h-16 flex items-center px-6 border-b border-divider">
                <span className="text-xl font-bold text-primary">DW Admin</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="flex flex-col gap-2 px-3">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-medium transition-colors ${isActive
                                            ? "bg-primary text-primary-foreground font-medium"
                                            : "text-default-500 hover:bg-default-100 hover:text-foreground"
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-divider">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-default-600">Appearance</span>
                    <div className="bg-default-100 rounded-medium p-3 mt-2">
                        <p className="text-xs text-default-500 font-semibold">DW</p>
                        <p className="text-[10px] text-default-400">Version 1.0.0</p>
                    </div>
                    <ThemeSwitch />
                </div>
            </div>
        </div>
    );
};