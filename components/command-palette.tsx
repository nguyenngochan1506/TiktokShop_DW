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
  // 1. Monitoring
  { id: "home", title: "Dashboard", href: "/", icon: HomeIcon, section: "Monitoring" },
  { id: "logs", title: "Crawl Logs", href: "/logs", icon: FileTextIcon, section: "Monitoring" },

  // 2. Controller
  { id: "sources", title: "Source Configs", href: "/sources", icon: ServerIcon, section: "Controller" },

  // 3. Staging Data
  { id: "raw", title: "Raw Data", href: "/raw-data", icon: DatabaseIcon, section: "Staging Data" },
  { id: "products", title: "Cleaned Products", href: "/products", icon: PackageSearchIcon, section: "Staging Data" },
  { id: "shops", title: "Shops Directory", href: "/shops", icon: StoreIcon, section: "Staging Data" },

  // 4. Warehouse
  { id: "analytics", title: "Analytics", href: "/analytics", icon: BarChart3Icon, section: "Warehouse" },
  { id: "reviews", title: "Reviews", href: "/reviews", icon: MessageSquareIcon, section: "Warehouse" },

  // 5. Engineering Tools
  { id: "playground", title: "SQL Playground", href: "/playground", icon: TerminalIcon, section: "Engineering Tools" },
  { id: "quality", title: "Data Quality", href: "/data-quality", icon: ShieldCheckIcon, section: "Engineering Tools" },
  { id: "health", title: "System Health", href: "/system-health", icon: ActivityIcon, section: "Engineering Tools" },
  { id: "dictionary", title: "Dictionary", href: "/dictionary", icon: BookOpenIcon, section: "Engineering Tools" },
  { id: "settings", title: "System Settings", href: "/settings", icon: SettingsIcon, section: "Engineering Tools" },
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
        className="hidden md:flex items-center gap-2 cursor-pointer bg-default-100 hover:bg-default-200 px-3 py-1.5 rounded-lg transition-colors border border-default-200 mb-2"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon size={14} className="text-default-500"/>
        <span className="text-small text-default-500 flex-1">Search...</span>
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
        <ModalContent>
          <ModalBody>
            {/* Input Search */}
            <Input
              autoFocus
              placeholder="Type to search pages..."
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
                        No results found for "{query}"
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
                <span>Select to navigate</span>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1"><Kbd >↑</Kbd><Kbd >↓</Kbd></span>
                    <span className="flex items-center gap-1"><Kbd >esc</Kbd> close</span>
                </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};