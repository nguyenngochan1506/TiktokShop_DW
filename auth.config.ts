import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Redirect về đây nếu chưa login
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");
      const isPublicFile = /\.(.*)$/.test(nextUrl.pathname); // Cho phép file tĩnh (ảnh, css)

      if (isPublicFile) return true;

      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) return false; // Redirect về login page
      return true;
    },
  },
  providers: [], // Để trống ở đây, sẽ thêm ở auth.ts
} satisfies NextAuthConfig;