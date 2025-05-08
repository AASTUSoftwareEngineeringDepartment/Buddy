import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export function middleware(request: NextRequest) {
	// Get the pathname of the request
	const path = request.nextUrl.pathname;

	// Check if the path is in the admin group
	const isAdminPath = path.startsWith("/dashboard");

	// If not an admin path, allow the request
	if (!isAdminPath) {
		return NextResponse.next();
	}

	// Get the token from the request cookies
	const token = request.cookies.get("token")?.value;
	const role = request.cookies.get("role")?.value;

	// If trying to access admin routes without token or not a parent, redirect to login
	if (!token || role !== "parent") {
		const loginUrl = new URL("/login", request.url);
		// Add the current path as a "from" parameter to redirect back after login
		loginUrl.searchParams.set("from", path);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

// Specify which routes the middleware should run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - login
		 * - signup
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)",
	],
};
