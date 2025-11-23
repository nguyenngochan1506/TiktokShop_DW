"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Kbd } from "@heroui/kbd";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { 
  SearchIcon, 
  HomeIcon,
  ActivityIcon,
  FileTextIcon,
  ServerIcon,
  DatabaseIcon,
  PackageSearchIcon,
  StoreIcon,
  BarChart3Icon,
  MessageSquareIcon,
  TerminalIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  SettingsIcon
} from "lucide-react";

// Định nghĩa danh sách các trang khớp với Sidebar
const APP_ROUTES = [
  // 1. Monitoring (Giám sát)
  { id: "home", title: "Tổng Quan Dashboard", href: "/", icon: HomeIcon, section: "Giám sát (Monitoring)" },
  { id: "logs", title: "Lịch Sử Crawl", href: "/logs", icon: FileTextIcon, section: "Giám sát (Monitoring)" },

  // 2. Controller (Điều khiển)
  { id: "sources", title: "Cấu Hình Nguồn Dữ Liệu", href: "/sources", icon: ServerIcon, section: "Điều khiển (Controller)" },

  // 3. Staging Data (Dữ liệu Tạm)
  { id: "raw", title: "Dữ Liệu Thô (Raw Data)", href: "/raw-data", icon: DatabaseIcon, section: "Dữ liệu Tạm (Staging)" },
  { id: "products", title: "Sản Phẩm Đã Làm Sạch", href: "/products", icon: PackageSearchIcon, section: "Dữ liệu Tạm (Staging)" },
  { id: "shops", title: "Danh Mục Cửa Hàng", href: "/shops", icon: StoreIcon, section: "Dữ liệu Tạm (Staging)" },

  // 4. Warehouse (Kho Dữ Liệu)
  { id: "analytics", title: "Phân Tích Bán Hàng", href: "/analytics", icon: BarChart3Icon, section: "Kho Dữ Liệu (Warehouse)" },
  { id: "reviews", title: "Đánh Giá Khách Hàng", href: "/reviews", icon: MessageSquareIcon, section: "Kho Dữ Liệu (Warehouse)" },

  // 5. Engineering Tools (Công cụ Kỹ thuật)
  { id: "playground", title: "SQL Sandbox", href: "/playground", icon: TerminalIcon, section: "Công cụ Kỹ thuật" },
  { id: "quality", title: "Chất Lượng Dữ Liệu (DQ)", href: "/data-quality", icon: ShieldCheckIcon, section: "Công cụ Kỹ thuật" },
  { id: "health", title: "Sức Khỏe Hệ Thống", href: "/system-health", icon: ActivityIcon, section: "Công cụ Kỹ thuật" },
  { id: "dictionary", title: "Từ Điển Dữ Liệu", href: "/dictionary", icon: BookOpenIcon, section: "Công cụ Kỹ thuật" },
  { id: "settings", title: "Cấu Hình Hệ Thống", href: "/settings", icon: SettingsIcon, section: "Công cụ Kỹ thuật" },
];

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // 1. Lắng nghe sự kiện Ctrl+K hoặc Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 2. Filter danh sách dựa trên từ khóa
  const filteredItems = APP_ROUTES.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.section.toLowerCase().includes(query.toLowerCase())
  );

  // 3. Xử lý chọn menu
  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* Nút Trigger trên Sidebar */}
      <div 
        className="hidden md:flex items-center gap-2 cursor-pointer bg-default-100 hover:bg-default-200 px-3 py-1.5 rounded-lg transition-colors border border-default-200 mb-2 font-sans"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon size={14} className="text-default-500"/>
        <span className="text-small text-default-500 flex-1">Tìm kiếm...</span>
        <Kbd keys={["command"]}>K</Kbd>
      </div>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        placement="top"
        hideCloseButton
        backdrop="blur"
        classNames={{
            base: "bg-content1 dark:bg-content1 border border-default-200 shadow-xl mt-20",
            body: "p-0",
        }}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent className="font-sans">
          <ModalBody>
            {/* Input Search */}
            <Input
              autoFocus
              placeholder="Gõ để tìm kiếm trang..."
              value={query}
              onValueChange={setQuery}
              startContent={<SearchIcon size={18} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-14 shadow-none border-b border-default-100 bg-transparent rounded-none",
                input: "text-medium",
              }}
            />

            {/* Result List */}
            <div className="max-h-[300px] overflow-y-auto px-2 pb-2">
                {filteredItems.length === 0 ? (
                    <div className="py-8 text-center text-default-500 text-sm">
                        Không tìm thấy kết quả nào cho "{query}"
                    </div>
                ) : (
                    <Listbox 
                        aria-label="Navigation" 
                        onAction={(key) => handleSelect(key as string)}
                        variant="flat"
                    >
                        {filteredItems.map((item) => (
                            <ListboxItem
                                key={item.href}
                                startContent={<item.icon size={18} className="text-default-400" />}
                                description={item.section}
                                classNames={{
                                    base: "py-3 rounded-lg data-[hover=true]:bg-default-100",
                                    title: "font-semibold",
                                    description: "text-tiny text-primary"
                                }}
                            >
                                {item.title}
                            </ListboxItem>
                        ))}
                    </Listbox>
                )}
            </div>
            
            {/* Footer hint */}
            <div className="bg-default-50 px-4 py-2 text-tiny text-default-400 flex justify-between border-t border-default-100 items-center">
                <span>Chọn để điều hướng</span>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><Kbd >↑</Kbd><Kbd >↓</Kbd></span>
                    <span className="flex items-center gap-1"><Kbd >esc</Kbd> đóng</span>
                </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};