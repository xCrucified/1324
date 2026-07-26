export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/checkout/:path*", "/profile/:path*"],
};