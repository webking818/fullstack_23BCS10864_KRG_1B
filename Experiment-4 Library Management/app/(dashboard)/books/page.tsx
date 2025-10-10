"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { BookOpenText } from "lucide-react"
import Link from "next/link"
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

export default function BooksPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let query = supabase.from("books").select("*")

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%`)
        }

        if (categoryFilter) {
          query = query.eq("category", categoryFilter)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setBooks(data || [])

        // Get unique categories
        const uniqueCategories = Array.from(new Set((data || []).map((book) => book.category)))
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching books:", error)
        toast({
          title: "Error",
          description: "Failed to fetch books. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [supabase, searchQuery, categoryFilter])

  const handleBorrow = async (bookId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to borrow books",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if book is available
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("available_copies")
        .eq("id", bookId)
        .single()

      if (bookError || !book) {
        throw bookError || new Error("Book not found")
      }

      if (book.available_copies <= 0) {
        toast({
          title: "Book unavailable",
          description: "This book is currently not available for borrowing",
          variant: "destructive",
        })
        return
      }

      // Check if user already has this book borrowed
      const { count, error: countError } = await supabase
        .from("borrowings")
        .select("*", { count: "exact", head: true })
        .eq("book_id", bookId)
        .eq("member_id", user.id)
        .eq("status", "borrowed")

      if (countError) {
        throw countError
      }

      if (count && count > 0) {
        toast({
          title: "Already borrowed",
          description: "You have already borrowed this book",
          variant: "destructive",
        })
        return
      }

      // Calculate due date (2 weeks from now)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14)

      // Create borrowing record
      const { error: borrowError } = await supabase.from("borrowings").insert({
        book_id: bookId,
        member_id: user.id,
        due_date: dueDate.toISOString(),
      })

      if (borrowError) {
        throw borrowError
      }

      // Update book available copies
      const { error: updateError } = await supabase
        .from("books")
        .update({ available_copies: book.available_copies - 1 })
        .eq("id", bookId)

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Success",
        description: "Book borrowed successfully. Due date is in 2 weeks.",
      })

      // Refresh books list
      const { data: updatedBooks, error: refreshError } = await supabase.from("books").select("*")

      if (refreshError) {
        throw refreshError
      }

      setBooks(updatedBooks || [])
    } catch (error) {
      console.error("Error borrowing book:", error)
      toast({
        title: "Error",
        description: "Failed to borrow book. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Books Collection</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <BookOpenText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No books found</h2>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[3/4] relative bg-muted">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url || "/placeholder.svg"}
                    alt={book.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <BookOpenText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">by {book.author}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Category:</span> {book.category}
                </p>
                <p className="text-sm mb-4">
                  <span className="font-semibold">Available:</span> {book.available_copies} of {book.total_copies}
                </p>
                <p className="text-sm line-clamp-3">{book.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/books/${book.id}`}>
                  <Button variant="outline">Details</Button>
                </Link>
                <Button disabled={book.available_copies <= 0} onClick={() => handleBorrow(book.id)}>
                  {book.available_copies <= 0 ? "Unavailable" : "Borrow"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
