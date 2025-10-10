"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { BookOpenText, Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface Borrowing {
  id: string
  book_id: string
  borrowed_date: string
  due_date: string
  returned_date: string | null
  status: string
  book: {
    id: string
    title: string
    author: string
    cover_image_url: string | null
  }
}

export default function BorrowingHistoryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchBorrowingHistory = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("borrowings")
          .select(`
            id,
            book_id,
            borrowed_date,
            due_date,
            returned_date,
            status,
            book:books (
              id,
              title,
              author,
              cover_image_url
            )
          `)
          .eq("member_id", user.id)
          .order("borrowed_date", { ascending: false })

        if (error) {
          throw error
        }

        setBorrowings(data || [])
      } catch (error) {
        console.error("Error fetching borrowing history:", error)
        toast({
          title: "Error",
          description: "Failed to fetch borrowing history. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchBorrowingHistory()
    } else if (!authLoading && !user) {
      setIsLoading(false)
    }
  }, [user, authLoading, supabase])

  if (authLoading || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading borrowing history...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view your borrowing history</CardDescription>
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
      <Link href="/profile" className="flex items-center text-sm mb-6 hover:underline">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Profile
      </Link>

      <h1 className="text-3xl font-bold mb-6">Borrowing History</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Borrowings</CardTitle>
          <CardDescription>Your complete borrowing history</CardDescription>
        </CardHeader>
        <CardContent>
          {borrowings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpenText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold">No borrowing history</h2>
              <p className="text-muted-foreground mb-4">You haven&apos;t borrowed any books yet</p>
              <Link href="/books">
                <Button>Browse Books</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {borrowings.map((borrowing) => {
                const dueDate = new Date(borrowing.due_date)
                const isOverdue = borrowing.status === "borrowed" && dueDate < new Date()

                return (
                  <div key={borrowing.id} className="flex flex-col md:flex-row gap-4 border-b pb-6">
                    <div className="w-full md:w-24 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {borrowing.book.cover_image_url ? (
                        <img
                          src={borrowing.book.cover_image_url || "/placeholder.svg"}
                          alt={borrowing.book.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <BookOpenText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{borrowing.book.title}</h3>
                      <p className="text-sm text-muted-foreground">by {borrowing.book.author}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Borrowed: {new Date(borrowing.borrowed_date).toLocaleDateString()}</span>
                      </div>
                      <div className={`flex items-center mt-1 text-sm ${isOverdue ? "text-destructive" : ""}`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Due: {dueDate.toLocaleDateString()}</span>
                        {isOverdue && <span className="ml-2 font-semibold">(Overdue)</span>}
                      </div>
                      {borrowing.returned_date && (
                        <div className="flex items-center mt-1 text-sm text-green-600 dark:text-green-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Returned: {new Date(borrowing.returned_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            borrowing.status === "returned"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : isOverdue
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {borrowing.status === "returned" ? "Returned" : isOverdue ? "Overdue" : "Borrowed"}
                        </span>
                      </div>
                      <div className="mt-4">
                        <Link href={`/books/${borrowing.book_id}`}>
                          <Button variant="outline" size="sm">
                            View Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
