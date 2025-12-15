import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase env vars are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          try {
            return request.cookies.getAll()
          } catch {
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          } catch (error) {
            // Silently fail cookie operations
          }
        },
      },
    })

    // Refresh session if expired (don't block on errors)
    try {
      await supabase.auth.getUser()
    } catch {
      // Continue even if auth check fails
    }

    // Protect portal routes (but allow /portal itself for login)
    if (request.nextUrl.pathname.startsWith("/portal") && request.nextUrl.pathname !== "/portal") {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          // Redirect to portal login page if not authenticated
          const url = request.nextUrl.clone()
          url.pathname = "/portal"
          return NextResponse.redirect(url)
        }
      } catch {
        // If auth check fails, allow through (will be handled by client-side)
      }
    }
  } catch (error) {
    // If there's any error, just continue with the request
    // This ensures the app doesn't break if middleware has issues
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

