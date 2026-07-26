export { auth as middleware } from "@/app/api/auth/[...nextauth]/route";

export const config = {
  matcher: ["/checkout/:path*", "/profile/:path*"],
};