import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function getUser(email: string) {
  try {
    const user = await prisma.system_users.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("--> [LOGIN CHECK] Bắt đầu kiểm tra...");
        
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log(`--> [LOGIN CHECK] Email: ${email}`);
          
          const user = await getUser(email);
          if (!user) {
            console.log("--> [LOGIN CHECK] LỖI: Không tìm thấy User trong DB.");
            return null;
          }

          console.log("--> [LOGIN CHECK] User tìm thấy. Đang so sánh mật khẩu...");
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          if (passwordsMatch) {
            console.log("--> [LOGIN CHECK] Mật khẩu đúng! Đăng nhập thành công.");
            
            // --- SỬA LỖI TYPESCRIPT TẠI ĐÂY ---
            return {
              id: user.id.toString(), // Chuyển id thành string để khớp với NextAuth
              name: user.name,
              email: user.email,
              role: user.role,
            };
          } else {
             console.log("--> [LOGIN CHECK] LỖI: Sai mật khẩu.");
          }
        } else {
            console.log("--> [LOGIN CHECK] LỖI: Validate dữ liệu đầu vào thất bại.");
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id; // Đảm bảo ID là string
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});