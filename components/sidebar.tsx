"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  HomeIcon,
  DatabaseIcon,
  FileTextIcon,
  SettingsIcon,
  LayersIcon,
  BarChart3Icon,
  StoreIcon,
  ServerIcon,
  PackageSearchIcon,
  ActivityIcon,
  MessageSquareIcon,
  TerminalIcon,
  ShieldCheckIcon,
  BookOpenIcon
} from "lucide-react";
import { ThemeSwitch } from "./theme-switch";

// Định nghĩa cấu trúc Menu
const menuGroups = [
  {
    key: "monitoring",
    title: "Monitoring",
    icon: ActivityIcon,
    items: [
      { name: "Dashboard", href: "/", icon: HomeIcon },
      { name: "Crawl Logs", href: "/logs", icon: FileTextIcon },
    ]
  },
  {
    key: "controller",
    title: "Controller",
    icon: SettingsIcon,
    items: [
      { name: "Source Configs", href: "/sources", icon: ServerIcon },
    ]
  },
  {
    key: "staging",
    title: "Staging Data",
    icon: DatabaseIcon,
    items: [
      { name: "Raw Data", href: "/raw-data", icon: DatabaseIcon },
      { name: "Cleaned Products", href: "/products", icon: PackageSearchIcon },
      { name: "Shops Directory", href: "/shops", icon: StoreIcon },
    ]
  },
  {
    key: "warehouse",
    title: "Warehouse",
    icon: LayersIcon,
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3Icon },
      { name: "Reviews", href: "/reviews", icon: MessageSquareIcon }
    ]
  },{
    key: "tools",
    title: "Engineering Tools",
    icon: SettingsIcon, 
    items: [
      { name: "SQL Playground", href: "/playground", icon: TerminalIcon },
      { name: "Data Quality", href: "/data-quality", icon: ShieldCheckIcon },
      { name: "System Health", href: "/system-health", icon: ActivityIcon },
      { name: "Dictionary", href: "/dictionary", icon: BookOpenIcon }
    ]
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  // Logic để xác định Group nào đang Active dựa trên URL hiện tại
  // Để tự động mở Dropdown khi reload trang
  const defaultExpandedKeys = menuGroups
    .filter(group => group.items.some(item => item.href === pathname))
    .map(group => group.key);

  // Nếu đang ở trang chủ /, mặc định mở nhóm Monitoring
  if (pathname === "/" && !defaultExpandedKeys.includes("monitoring")) {
    defaultExpandedKeys.push("monitoring");
  }

  return (
    <div className="w-64 h-screen bg-content1 border-r border-divider flex flex-col fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-divider gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
        </div>
        <span className="text-xl font-bold text-foreground">DW Admin</span>
      </div>

      {/* Navigation (Scrollable) */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <Accordion 
          selectionMode="multiple" 
          defaultExpandedKeys={defaultExpandedKeys}
          itemClasses={{
            base: "px-0",
            title: "font-semibold text-default-600",
            trigger: "px-2 py-0 data-[hover=true]:bg-default-100 rounded-lg h-12 flex items-center",
            indicator: "text-medium",
            content: "text-small px-2",
          }}
          showDivider={false}
        >
          {menuGroups.map((group) => (
            <AccordionItem 
              key={group.key} 
              aria-label={group.title} 
              title={group.title}
              startContent={<group.icon size={20} className="text-default-500" />}
            >
              <ul className="flex flex-col gap-1 pb-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-default-500 hover:bg-default-100 hover:text-foreground"
                        }`}
                      >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>

      {/* Footer (Theme Switch) */}
      <div className="p-4 border-t border-divider">
        <div className="flex items-center justify-between bg-default-50 p-3 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">Betodemy DW</span>
            <span className="text-[10px] text-default-500">v1.2.0 (Pro)</span>
          </div>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
};