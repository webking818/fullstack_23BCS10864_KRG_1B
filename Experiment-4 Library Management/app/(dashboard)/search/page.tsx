"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientSupabaseClient } from "@/lib/supabase"
import { BookOpenText, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState("title")
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const supabase = createClientSupabaseClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      let query = supabase.from("books").select("*")

      if (searchField === "all") {
        query = query.or(
          `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
        )
      } else {
        query = query.ilike(searchField, `%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setBooks(data || [])
    } catch (error) {
      console.error("Error searching books:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Search Books</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Advanced Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger>
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="isbn">ISBN</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Searching...</p>
        </div>
      ) : hasSearched && books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <BookOpenText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No books found</h2>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : hasSearched ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Search Results ({books.length})</h2>
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
                <CardFooter>
                  <Link href={`/books/${book.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Search for books</h2>
          <p className="text-muted-foreground">Enter a search term and select a field to search</p>
        </div>
      )}
    </div>
  )
}
