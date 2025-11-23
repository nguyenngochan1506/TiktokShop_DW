"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  // Mặc định là true (Mở) để khớp với Server Side Rendering ban đầu
  const [isOpen, setIsOpen] = useState(true);
  
  // Chúng ta bỏ state isMounted đi, hoặc nếu dùng thì không được return children trần
  
  useEffect(() => {
    // Chỉ chạy ở client: Lấy trạng thái từ localStorage
    const savedState = localStorage.getItem("sidebar_state");
    if (savedState !== null) {
      setIsOpen(savedState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebar_state", String(newState));
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};