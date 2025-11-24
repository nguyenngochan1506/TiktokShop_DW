"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { recordActivity } from "./audit";
import { auth } from "@/auth";

export async function createUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized: Chỉ Admin mới có quyền tạo người dùng." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!email || !password || !name) return { error: "Thiếu thông tin bắt buộc" };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.system_users.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || "USER"
            }
        });

        await recordActivity("CREATE", "USER", newUser.id.toString(), `Tạo user mới: ${email} (${formData.get("role")})`);

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { error: "Email đã tồn tại hoặc lỗi hệ thống" };
    }
}

export async function getSystemUsers() {
    return await prisma.system_users.findMany({
        orderBy: { created_at: 'desc' },
        select: { id: true, name: true, email: true, role: true, created_at: true }
    });
}