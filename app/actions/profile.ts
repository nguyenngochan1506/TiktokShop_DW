"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { recordActivity } from "./audit";

export async function changePassword(prevState: any, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Vui lòng điền đầy đủ thông tin." };
  }

  if (newPassword.length < 6) {
    return { error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp." };
  }

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Không xác định được người dùng." };
    }

    const user = await prisma.system_users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return { error: "Người dùng không tồn tại." };

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { error: "Mật khẩu hiện tại không chính xác." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.system_users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await recordActivity("UPDATE", "USER", user.id.toString(), "Người dùng tự thay đổi mật khẩu");

    return { success: "Đổi mật khẩu thành công!" };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { error: "Đã xảy ra lỗi hệ thống." };
  }
}