import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Admin routes require authentication
        if (pathname.startsWith("/admin")) {
          return !!token
        }

        // Dashboard and other protected routes require authentication
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/settings/:path*"],
}
