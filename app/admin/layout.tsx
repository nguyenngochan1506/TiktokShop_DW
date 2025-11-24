import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-4xl font-bold text-danger">403 - Forbidden</h1>
        <p className="text-default-500">Bạn không có quyền truy cập vào khu vực quản trị.</p>
        <a href="/" className="text-primary hover:underline">Quay về Trang chủ</a>
      </div>
    );
  }

  // Nếu ok thì cho hiển thị nội dung
  return <>{children}</>;
}