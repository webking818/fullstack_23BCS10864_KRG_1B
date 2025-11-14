"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { useState } from "react"

export function FacultyNav({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    { href: "/faculty-dashboard", label: "Overview", icon: "📊" },
    { href: "/faculty-dashboard/students", label: "Manage Students", icon: "👥" },
    { href: "/faculty-dashboard/marks", label: "Upload Marks", icon: "📝" },
    { href: "/faculty-dashboard/assignments", label: "Assignments", icon: "📋" },
    { href: "/faculty-dashboard/attendance", label: "Attendance", icon: "✓" },
    { href: "/faculty-dashboard/profile", label: "Profile", icon: "⚙️" },
  ]

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-3 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Faculty Portal</h2>
        <p className="text-xs text-gray-600 mt-1">Management System</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">Faculty</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-600 truncate">{user?.department}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {loading ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    </div>
  )
}
