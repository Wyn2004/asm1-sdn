import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/admin", "/dashboard", "/product-management"]; // các route cần bảo vệ

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Kiểm tra xem route có nằm trong danh sách cần bảo vệ không
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Nếu không có token thì redirect tới /auth
    const loginUrl = new URL("/auth", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
