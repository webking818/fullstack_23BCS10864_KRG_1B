"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { BookOpen, Clock, History } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DashboardStats {
  totalBooks: number
  booksCurrentlyBorrowed: number
  totalBorrowings: number
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    booksCurrentlyBorrowed: 0,
    totalBorrowings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        // Get total books
        const { count: totalBooks, error: booksError } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true })

        // Get currently borrowed books
        const { count: booksCurrentlyBorrowed, error: borrowedError } = await supabase
          .from("borrowings")
          .select("*", { count: "exact", head: true })
          .eq("member_id", user.id)
          .eq("status", "borrowed")

        // Get total borrowings
        const { count: totalBorrowings, error: historyError } = await supabase
          .from("borrowings")
          .select("*", { count: "exact", head: true })
          .eq("member_id", user.id)

        if (booksError || borrowedError || historyError) {
          console.error("Error fetching stats:", booksError || borrowedError || historyError)
          return
        }

        setStats({
          totalBooks: totalBooks || 0,
          booksCurrentlyBorrowed: booksCurrentlyBorrowed || 0,
          totalBorrowings: totalBorrowings || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchStats()
    }
  }, [user, authLoading, supabase])

  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Books</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">Total books in the library</p>
            <Link href="/books" className="text-sm text-primary hover:underline mt-4 inline-block">
              Browse all books
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.booksCurrentlyBorrowed}</div>
            <p className="text-xs text-muted-foreground">Books you currently have borrowed</p>
            <Link href="/profile" className="text-sm text-primary hover:underline mt-4 inline-block">
              View borrowed books
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Borrowing History</CardTitle>
            <History className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : stats.totalBorrowings}</div>
            <p className="text-xs text-muted-foreground">Total books you have borrowed</p>
            <Link href="/profile/history" className="text-sm text-primary hover:underline mt-4 inline-block">
              View full history
            </Link>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-6">Quick Actions</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Browse Books</CardTitle>
            <CardDescription>Explore our collection of books</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/books">
              <Button>Browse Books</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>Search for specific books</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search">
              <Button>Search Books</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>View your profile and borrowing history</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button>View Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
