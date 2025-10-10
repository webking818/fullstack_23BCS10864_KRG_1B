"use client"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Home, Library, LogIn, LogOut, Search, Settings, User, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/books",
      label: "Books",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      active: pathname === "/books" || pathname.startsWith("/books/"),
    },
    {
      href: "/search",
      label: "Search",
      icon: <Search className="mr-2 h-4 w-4" />,
      active: pathname === "/search",
    },
  ]

  // Admin routes
  const adminRoutes = [
    {
      href: "/admin/books",
      label: "Manage Books",
      icon: <Library className="mr-2 h-4 w-4" />,
      active: pathname === "/admin/books" || pathname.startsWith("/admin/books/"),
    },
    {
      href: "/admin/members",
      label: "Manage Members",
      icon: <Users className="mr-2 h-4 w-4" />,
      active: pathname === "/admin/members" || pathname.startsWith("/admin/members/"),
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {route.icon}
          {route.label}
        </Link>
      ))}

      {/* Admin routes - only show if user has admin role */}
      {user && (
        <>
          <div className="h-6 w-px bg-muted" />
          {adminRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </>
      )}

      <div className="ml-auto flex items-center space-x-4">
        {user ? (
          <>
            <Link
              href="/profile"
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === "/profile" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
