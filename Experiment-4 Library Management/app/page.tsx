import { Button } from "@/components/ui/button"
import { BookOpenText } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center">
        <div className="flex items-center space-x-2">
          <BookOpenText className="h-6 w-6" />
          <span className="font-bold">Library MS</span>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to the Library Management System
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover, borrow, and manage books with ease. Our library management system provides a seamless
                  experience for both readers and administrators.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-lg bg-muted p-4 shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpenText className="h-32 w-32 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our library management system offers a comprehensive set of features for both readers and
                  administrators.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-background p-4">
                    <BookOpenText className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Browse Books</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore our extensive collection of books across various genres and categories.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-background p-4">
                    <BookOpenText className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Borrow & Return</h3>
                  <p className="text-sm text-muted-foreground">
                    Easily borrow books and return them with our streamlined process.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="rounded-full bg-background p-4">
                    <BookOpenText className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Track History</h3>
                  <p className="text-sm text-muted-foreground">Keep track of your borrowing history and due dates.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between md:py-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2023 Library Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
