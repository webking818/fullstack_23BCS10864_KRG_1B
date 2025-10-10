"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Plus } from "lucide-react"
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
  cover_image_url: string | null
  total_copies: number
  available_copies: number
}

export default function AdminBooksPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    cover_image_url: "",
    total_copies: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const checkAdminAndFetchBooks = async () => {
      if (!user) return

      try {
        setIsAdmin(true)

        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("title")

        if (error) throw error

        setBooks(data || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch books. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) checkAdminAndFetchBooks()
    else if (!authLoading && !user) setIsLoading(false)
  }, [user, authLoading, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 1 }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "",
      description: "",
      cover_image_url: "",
      total_copies: 1,
    })
  }

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("books")
        .insert({
          ...formData,
          cover_image_url: formData.cover_image_url || null,
          available_copies: formData.total_copies,
        })
        .select()
        .single()

      if (error) throw error

      setBooks((prev) => [...prev, data])
      setIsAddDialogOpen(false)
      resetForm()

      toast({
        title: "Book added",
        description: "The book has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBook) return
    setIsSubmitting(true)

    try {
      const copiesDifference = formData.total_copies - selectedBook.total_copies
      const newAvailableCopies = selectedBook.available_copies + copiesDifference

      const { data, error } = await supabase
        .from("books")
        .update({
          ...formData,
          cover_image_url: formData.cover_image_url || null,
          available_copies: newAvailableCopies >= 0 ? newAvailableCopies : 0,
        })
        .eq("id", selectedBook.id)
        .select()
        .single()

      if (error) throw error

      setBooks((prev) => prev.map((book) => (book.id === selectedBook.id ? data : book)))
      setIsEditDialogOpen(false)
      setSelectedBook(null)

      toast({
        title: "Book updated",
        description: "The book has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBook = async () => {
    if (!selectedBook) return
    setIsSubmitting(true)

    try {
      const { count, error: countError } = await supabase
        .from("borrowings")
        .select("*", { count: "exact", head: true })
        .eq("book_id", selectedBook.id)
        .eq("status", "borrowed")

      if (countError) throw countError

      if (count && count > 0) {
        toast({
          title: "Cannot delete book",
          description: "This book has active borrowings and cannot be deleted.",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        setSelectedBook(null)
        return
      }

      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", selectedBook.id)

      if (error) throw error

      setBooks((prev) => prev.filter((book) => book.id !== selectedBook.id))
      setIsDeleteDialogOpen(false)
      setSelectedBook(null)

      toast({
        title: "Book deleted",
        description: "The book has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>Enter the details of the new book</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input id="author" name="author" value={formData.author} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input id="cover_image_url" name="cover_image_url" value={formData.cover_image_url} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="total_copies">Total Copies</Label>
                <Input id="total_copies" name="total_copies" type="number" value={formData.total_copies} onChange={handleNumberInputChange} min={1} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>Add Book</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
