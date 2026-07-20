import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow the admin login page
  if (pathname === "/admin/login") {
    return response;
  }

  // Protect every other admin route
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    // Only allow your admin account
    if (user.email !== "mausamfes@gmail.com") {
      await supabase.auth.signOut();

      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};