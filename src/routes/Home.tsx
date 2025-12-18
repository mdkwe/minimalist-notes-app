import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
      Card,
      CardHeader,
      CardTitle,
      CardDescription,
      CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export default function Home() {
      return (
            <div className="min-h-screen bg-background">
                  {/* Top bar */}
                  <header className="border-b bg-white/50 backdrop-blur-sm">
                        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                              <div className="min-w-0">
                                    <h1 className="truncate text-base font-semibold tracking-tight">
                                          Minimalist Notes
                                    </h1>
                                    <p className="truncate text-xs text-muted-foreground">
                                          Simple, private, fast.
                                    </p>
                              </div>


                              {/* Mobile nav */}
                              <Sheet>
                                    <SheetTrigger asChild>
                                          <Button variant="ghost" className="sm:hidden" size="icon">
                                                <Menu className="h-5 w-5" />
                                                <span className="sr-only">Open menu</span>
                                          </Button>
                                    </SheetTrigger>

                                    <SheetContent side="right" className="w-[280px] p-0">
                                          <div className="flex h-full flex-col">
                                                {/* Header */}
                                                <SheetHeader className="px-5 pt-5">
                                                      <SheetTitle className="text-base">Menu</SheetTitle>
                                                </SheetHeader>

                                                {/* Body (centered vertically) */}
                                                <div className="flex-1 px-5">
                                                      <div className="grid h-full place-content-center">
                                                            <nav className="w-full space-y-2">
                                                                  <Button asChild className="w-full">
                                                                        <Link to="/register">Create account</Link>
                                                                  </Button>

                                                                  <Button asChild variant="outline" className="w-full">
                                                                        <Link to="/login">Login</Link>
                                                                  </Button>
                                                            </nav>

                                                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                                                  Your notes stay private to your account.
                                                            </p>
                                                      </div>
                                                </div>
                                          </div>
                                    </SheetContent>
                              </Sheet>

                              {/* Desktop nav */}
                              <nav className="hidden gap-2 sm:flex">
                                    <Button asChild variant={"default"}>
                                          <Link to="/register">Sign up</Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                          <Link to="/login">Login</Link>
                                    </Button>
                              </nav>
                        </div>
                  </header>

                  {/* Main */}
                  <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
                        {/* Hero */}
                        <section className="grid gap-6 md:grid-cols-2 md:items-center">
                              <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                          <Badge variant="secondary">Minimal</Badge>
                                          <Badge variant="secondary">Private</Badge>
                                          <Badge variant="secondary">No distractions</Badge>
                                    </div>

                                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                          Notes that stay out of your way.
                                    </h2>

                                    <p className="text-sm text-muted-foreground sm:text-base">
                                          Capture ideas, plan your week, or journal—without clutter.
                                          Your notes are personal: one account, one private space.
                                    </p>

                                    {/* Keep hero CTAs stable too (no breakpoint toggles) */}
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                          <Button asChild variant={"default"} className="w-full sm:w-auto">
                                                <Link to="/register">Get started</Link>
                                          </Button>
                                          <Button asChild variant="outline" className="w-full sm:w-auto">
                                                <Link to="/login">Login</Link>
                                          </Button>
                                    </div>
                              </div>

                              {/* Preview card */}
                              <CardContent className="overflow-hidden">
                                    {/* ONE block placeholder (never exceeds the card) */}
                                    <div className="w-full max-w-full overflow-hidden rounded-xl border bg-background p-4">
                                          {/* Top row */}
                                          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                {/* Search */}
                                                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                                      <Skeleton className="h-4 w-4 shrink-0 rounded" />
                                                      <Skeleton className="h-4 w-40 max-w-full" />
                                                </div>

                                                {/* Actions */}
                                                <div className="flex shrink-0 gap-2">
                                                      <Skeleton className="h-9 w-24 rounded-md" />
                                                      <Skeleton className="h-9 w-9 rounded-md" />
                                                </div>
                                          </div>

                                          {/* Note header */}
                                          <div className="mt-5 w-full space-y-2">
                                                <Skeleton className="h-6 w-56 max-w-full" />
                                                <div className="flex w-full flex-wrap items-center gap-2 overflow-hidden">
                                                      <Skeleton className="h-4 w-20" />
                                                      <Skeleton className="h-4 w-16" />
                                                      <Skeleton className="h-4 w-14" />
                                                </div>
                                          </div>

                                          {/* Divider */}
                                          <div className="my-5 h-px w-full bg-border" />

                                          {/* Editor */}
                                          <div className="w-full space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-11/12" />
                                                <Skeleton className="h-4 w-10/12" />
                                                <Skeleton className="h-4 w-9/12" />
                                                <Skeleton className="h-4 w-8/12" />
                                          </div>

                                          {/* Bottom actions */}
                                          <div className="mt-6 flex w-full flex-wrap gap-2">
                                                <Skeleton className="h-9 w-24 rounded-md" />
                                                <Skeleton className="h-9 w-28 rounded-md" />
                                          </div>
                                    </div>
                              </CardContent>
                        </section>

                        <Separator className="my-8" />

                        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                              <Card className="shadow-sm">
                                    <CardHeader className="space-y-1">
                                          <CardTitle className="text-base">Fast capture</CardTitle>
                                          <CardDescription>Open → write → done. No friction.</CardDescription>
                                    </CardHeader>
                              </Card>

                              <Card className="shadow-sm">
                                    <CardHeader className="space-y-1">
                                          <CardTitle className="text-base">Private by design</CardTitle>
                                          <CardDescription>Your notes are tied to your account.</CardDescription>
                                    </CardHeader>
                              </Card>

                              <Card className="shadow-sm sm:col-span-2 md:col-span-1">
                                    <CardHeader className="space-y-1">
                                          <CardTitle className="text-base">Minimal UI</CardTitle>
                                          <CardDescription>A calm interface that helps you think.</CardDescription>
                                    </CardHeader>
                              </Card>
                        </section>

                        <footer className="mt-10 pb-6 text-xs text-muted-foreground">
                              <p>© {new Date().getFullYear()} Minimalist Notes</p>
                        </footer>
                  </main>
            </div>
      )
}