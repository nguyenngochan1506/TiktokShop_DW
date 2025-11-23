"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "lucide-react";

export const Breadcrumbs = () => {
  const pathname = usePathname();
  
  // Bỏ qua nếu ở trang chủ
  if (pathname === "/") return null;

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <nav className="flex items-center text-sm text-default-500 mb-4">
      <Link href="/" className="hover:text-primary flex items-center gap-1">
        <HomeIcon size={14} />
      </Link>
      
      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        
        // Format text: "raw-data" -> "Raw Data"
        const title = segment.replace(/-/g, " ").replace(/%20/g, " ");

        return (
          <div key={href} className="flex items-center">
            <ChevronRightIcon size={14} className="mx-1 text-default-300" />
            {isLast ? (
              <span className="font-semibold text-foreground capitalize">
                {decodeURIComponent(title)}
              </span>
            ) : (
              <Link href={href} className="hover:text-primary capitalize">
                {decodeURIComponent(title)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};