import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Jika Supabase belum dikonfigurasi atau masih mode placeholder demo, biarkan akses lanjut
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('placeholder.supabase.co') ||
    supabaseAnonKey.includes('placeholder-anon-key')
  ) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isDemoAllowed =
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_ACCOUNTS === 'true';

    const rawDemoRole = request.cookies.get('permifest_demo_role')?.value;
    const demoRole = isDemoAllowed ? rawDemoRole : undefined;
    const isAuthenticated = Boolean(user || (demoRole && ['peserta', 'juri', 'panitia', 'super_admin'].includes(demoRole)));

    // 1. Redirect kasar jika pengguna belum login namun mengakses area dashboard
    if (!isAuthenticated && pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Redirect jika pengguna yang sudah login mencoba mengakses /login atau /register
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      const targetDashboard =
        demoRole === 'super_admin' || demoRole === 'panitia'
          ? '/dashboard/admin'
          : demoRole === 'juri'
          ? '/dashboard/juri'
          : '/dashboard/peserta';
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
  } catch {
    // Graceful fallback jika terjadi kegagalan jaringan
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
