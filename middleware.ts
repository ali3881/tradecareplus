import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;
      const role = token?.role;

      if (path.startsWith("/api/admin/jobs")) {
        return role === "ADMIN" || role === "STAFF";
      }

      if (path.startsWith("/api/admin")) {
        return role === "ADMIN";
      }

      if (path.startsWith("/admin/jobs")) {
        return role === "ADMIN" || role === "STAFF";
      }

      if (path.startsWith("/admin")) {
        return role === "ADMIN";
      }

      return !!token;
    },
  },
});

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*", "/dashboard/:path*", "/chat/:path*"],
};
