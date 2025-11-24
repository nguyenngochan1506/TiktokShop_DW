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
  BookOpenIcon,
  PanelLeftClose,
  LogOutIcon,
  UserIcon
} from "lucide-react";
import { ThemeSwitch } from "./theme-switch";
import { CommandPalette } from "./command-palette";
import { useSidebar } from "./sidebar-context";
import clsx from "clsx";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { User } from "@heroui/user";
import { handleLogout } from "@/app/actions/auth";

// Định nghĩa cấu trúc Menu
const menuGroups = [
  {
    key: "monitoring",
    title: "Monitoring",
    icon: ActivityIcon,
    items: [
      { name: "Tổng Quan", href: "/", icon: HomeIcon },
      { name: "Lịch Sử Crawl", href: "/logs", icon: FileTextIcon },
    ]
  },
  {
    key: "controller",
    title: "Controller",
    icon: SettingsIcon,
    items: [
      { name: "Cấu Hình Datasource", href: "/sources", icon: ServerIcon },
    ]
  },
  {
    key: "staging",
    title: "Staging",
    icon: DatabaseIcon,
    items: [
      { name: "Dữ Liệu Thô", href: "/raw-data", icon: DatabaseIcon },
      { name: "Dữ Liệu Đã Xử Lý", href: "/products", icon: PackageSearchIcon },
      { name: "Danh Mục Cửa Hàng", href: "/shops", icon: StoreIcon },
    ]
  },
  {
    key: "warehouse",
    title: "Warehouse",
    icon: LayersIcon,
    items: [
      { name: "Phân Tích Bán Hàng", href: "/analytics", icon: BarChart3Icon },
      { name: "Đánh Giá Khách Hàng", href: "/reviews", icon: MessageSquareIcon }
    ]
  }, {
    key: "tools",
    title: "Tools",
    icon: SettingsIcon,
    items: [
      { name: "SQL Sandbox", href: "/playground", icon: TerminalIcon },
      { name: "Chất Lượng Dữ Liệu", href: "/data-quality", icon: ShieldCheckIcon },
      { name: "Sức Khỏe Hệ Thống", href: "/system-health", icon: ActivityIcon },
      { name: "Từ Điển Dữ Liệu", href: "/dictionary", icon: BookOpenIcon },
      { name: "Cấu Hình Hệ Thống", href: "/settings", icon: SettingsIcon },
    ]
  },
  {
    key: "admin",
    title: "Administration",
    icon: ShieldCheckIcon,
    items: [
      { name: "Quản Lý Thành Viên", href: "/admin/users", icon: UserIcon },
      { name: "Nhật Ký Hoạt Động", href: "/admin/activity", icon: FileTextIcon },
    ]
},
];

interface SidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
    }
}


export const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();

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
    <aside
      className={clsx(
        "h-screen bg-content1 border-r border-divider flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out",
        // Logic ẩn hiện: Nếu đóng thì dịch sang trái (-translate-x-full)
        isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-divider gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold text-foreground">DW Admin</span>
        </div>
        <Tooltip content="Thu gọn Menu">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={toggleSidebar}
            className="text-default-500 hover:text-foreground"
          >
            <PanelLeftClose size={24} />
          </Button>
        </Tooltip>
      </div>
      <div className="px-4 py-4">
        <CommandPalette />
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
                        className={`flex items-center gap-3 px-3 py-2 rounded-medium transition-colors ${isActive
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
      <div className="p-4 border-t border-divider flex flex-col gap-4">
        {/* Theme Switch */}
        <div className="flex items-center justify-between bg-default-50 p-3 rounded-xl">
            <span className="text-xs text-default-500">Giao diện</span>
            <ThemeSwitch />
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center justify-between gap-2">
            <User   
                name={user?.name || "Admin"}
                description={user?.email}
                avatarProps={{
                    src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                    size: "sm"
                }}
                classNames={{
                    name: "text-sm font-semibold truncate w-[120px]",
                    description: "text-[10px] truncate w-[120px]"
                }}
            />
            <Tooltip content="Đăng xuất">
                <Button 
                    isIconOnly 
                    size="sm" 
                    color="danger" 
                    variant="light" 
                    onPress={() => handleLogout()}
                >
                    <LogOutIcon size={18} />
                </Button>
            </Tooltip>
        </div>
      </div>
    </aside>
  );
};