"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { BookOpenText, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  description: string
  cover_image_url: string
  total_copies: number
  available_copies: number
}

export default function BookDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBorrowing, setIsBorrowing] = useState(false)
  const [isAlreadyBorrowed, setIsAlreadyBorrowed] = useState(false)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error } = await supabase.from("books").select("*").eq("id", id).single()

        if (error) {
          throw error
        }

        setBook(data)

        // Check if user has already borrowed this book
        if (user) {
          const { count, error: countError } = await supabase
            .from("borrowings")
            .select("*", { count: "exact", head: true })
            .eq("book_id", id)
            .eq("member_id", user.id)
            .eq("status", "borrowed")

          if (countError) {
            throw countError
          }

          setIsAlreadyBorrowed(count !== null && count > 0)
        }
      } catch (error) {
        console.error("Error fetching book:", error)
        toast({
          title: "Error",
          description: "Failed to fetch book details. Please try again.",
          variant: "destructive",
        })
        router.push("/books")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [id, supabase, user, router])

  const handleBorrow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to borrow books",
        variant: "destructive",
      })
      return
    }

    if (!book) return

    setIsBorrowing(true)

    try {
      if (book.available_copies <= 0) {
        toast({
          title: "Book unavailable",
          description: "This book is currently not available for borrowing",
          variant: "destructive",
        })
        return
      }

      // Calculate due date (2 weeks from now)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)

      // Create borrowing record
      const { error: borrowError } = await supabase.from("borrowings").insert({
        book_id: book.id,
        member_id: user.id,
        due_date: dueDate.toISOString(),
      })

      if (borrowError) {
        throw borrowError
      }

      // Update book available copies
      const { data: updatedBook, error: updateError } = await supabase
        .from("books")
        .update({ available_copies: book.available_copies - 1 })
        .eq("id", book.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setBook(updatedBook)
      setIsAlreadyBorrowed(true)

      toast({
        title: "Success",
        description: "Book borrowed successfully. Due date is in 2 weeks.",
      })
    } catch (error) {
      console.error("Error borrowing book:", error)
      toast({
        title: "Error",
        description: "Failed to borrow book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBorrowing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading book details...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Book Not Found</CardTitle>
            <CardDescription>The book you are looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/books">
              <Button>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Books
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Link href="/books" className="flex items-center text-sm mb-6 hover:underline">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Books
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url || "/placeholder.svg"}
              alt={book.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <BookOpenText className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">by {book.author}</p>

          <div className="grid gap-4 mb-8">
            <div>
              <h3 className="font-semibold">ISBN</h3>
              <p>{book.isbn}</p>
            </div>
            <div>
              <h3 className="font-semibold">Category</h3>
              <p>{book.category}</p>
            </div>
            <div>
              <h3 className="font-semibold">Availability</h3>
              <p>
                {book.available_copies} of {book.total_copies} copies available
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Description</h3>
            <p>{book.description || "No description available."}</p>
          </div>

          <Button
            disabled={book.available_copies <= 0 || isAlreadyBorrowed || isBorrowing}
            onClick={handleBorrow}
            className="w-full md:w-auto"
          >
            {isBorrowing
              ? "Processing..."
              : isAlreadyBorrowed
                ? "Already Borrowed"
                : book.available_copies <= 0
                  ? "Unavailable"
                  : "Borrow Book"}
          </Button>
        </div>
      </div>
    </div>
  )
}
