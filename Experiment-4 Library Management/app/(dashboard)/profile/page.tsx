"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { createClientSupabaseClient } from "@/lib/supabase"
import { BookOpenText, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface Member {
  id: string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  membership_type: string
}

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

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [member, setMember] = useState<Member | null>(null)
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  })
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user) return

      try {
        // Get member details
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("*")
          .eq("id", user.id)
          .single()

        if (memberError) {
          throw memberError
        }

        setMember(memberData)
        setFormData({
          full_name: memberData.full_name || "",
          phone: memberData.phone || "",
          address: memberData.address || "",
        })

        // Get current borrowings
        const { data: borrowingsData, error: borrowingsError } = await supabase
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
          .eq("status", "borrowed")
          .order("due_date", { ascending: true })

        if (borrowingsError) {
          throw borrowingsError
        }

        setBorrowings(borrowingsData || [])
      } catch (error) {
        console.error("Error fetching member data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchMemberData()
    } else if (!authLoading && !user) {
      setIsLoading(false)
    }
  }, [user, authLoading, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !member) return

    setIsUpdating(true)

    try {
      const { error } = await supabase
        .from("members")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      // Update member state
      setMember({
        ...member,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReturnBook = async (borrowingId: string, bookId: string) => {
    try {
      // Update borrowing record
      const { error: borrowingError } = await supabase
        .from("borrowings")
        .update({
          returned_date: new Date().toISOString(),
          status: "returned",
        })
        .eq("id", borrowingId)

      if (borrowingError) {
        throw borrowingError
      }

      // Update book available copies
      const { data: book, error: bookError } = await supabase
        .from("books")
        .select("available_copies")
        .eq("id", bookId)
        .single()

      if (bookError) {
        throw bookError
      }

      const { error: updateError } = await supabase
        .from("books")
        .update({ available_copies: book.available_copies + 1 })
        .eq("id", bookId)

      if (updateError) {
        throw updateError
      }

      // Update borrowings state
      setBorrowings((prev) => prev.filter((b) => b.id !== borrowingId))

      toast({
        title: "Book returned",
        description: "The book has been returned successfully.",
      })
    } catch (error) {
      console.error("Error returning book:", error)
      toast({
        title: "Error",
        description: "Failed to return book. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view your profile</CardDescription>
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
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="borrowings">Current Borrowings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={formData.address || ""} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Membership Type</Label>
                  <Input value={member?.membership_type || "standard"} disabled />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="borrowings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Borrowings</CardTitle>
              <CardDescription>Books you currently have borrowed</CardDescription>
            </CardHeader>
            <CardContent>
              {borrowings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <BookOpenText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold">No books borrowed</h2>
                  <p className="text-muted-foreground mb-4">You don&apos;t have any books borrowed at the moment</p>
                  <Link href="/books">
                    <Button>Browse Books</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {borrowings.map((borrowing) => {
                    const dueDate = new Date(borrowing.due_date)
                    const isOverdue = dueDate < new Date()

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
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Due: {dueDate.toLocaleDateString()}</span>
                            {isOverdue && <span className="ml-2 font-semibold">(Overdue)</span>}
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Link href={`/books/${borrowing.book_id}`}>
                              <Button variant="outline" size="sm">
                                View Book
                              </Button>
                            </Link>
                            <Button size="sm" onClick={() => handleReturnBook(borrowing.id, borrowing.book_id)}>
                              Return Book
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
