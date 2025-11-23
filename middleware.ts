// // middleware.ts
// import { NextResponse, type NextRequest } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// export async function middleware(request: NextRequest) {
//   const response = NextResponse.next();
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get: (name) => request.cookies.get(name)?.value,
//         set: (name, value, options) => {
//           request.cookies.set({ name, value, ...options });
//           response.cookies.set({ name, value, ...options });
//         },
//         remove: (name, options) => {
//           request.cookies.set({ name, value: "", ...options });
//           response.cookies.set({ name, value: "", ...options });
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (request.nextUrl.pathname.startsWith("/onboarding") && !user) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/login";
//     url.searchParams.set("redirect", request.nextUrl.pathname);
//     return NextResponse.redirect(url);
//   }

//   return response;
// }

// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Biarkan asset/_next/api lewat tanpa cek
  const { pathname, search } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Siapkan response agar supabase/ssr bisa set cookie refresh
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          // set di req dan res sesuai rekomendasi supabase/ssr
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lindungi halaman onboarding dan dashboard
  const protectedRoutes = ["/onboarding", "/dashboard"];
  const isProtected = protectedRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Jangan redirect kalau sedang di /login untuk menghindari loop
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isProtected && !user && !isLogin) {
    const loginUrl = new URL("/login", req.url);
    // gunakan 'next' sebagai nama param umum
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Batasi ke rute yang perlu middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    // bila ingin jaga halaman root tertentu, tambahkan di sini
  ],
};
