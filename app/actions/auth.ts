"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Thông tin đăng nhập không chính xác.";
        default:
          return "Đã xảy ra lỗi hệ thống.";
      }
    }
    throw error;
  }
}

export async function handleLogout() {
  await signOut({ redirectTo: "/login" });
}