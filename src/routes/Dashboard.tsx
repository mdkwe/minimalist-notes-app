import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const navigate = useNavigate()

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error(error)
      return
    }
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You’re logged in. Welcome back 👋
            </p>
          </div>

          <Button variant="destructive" onClick={signOut} className="sm:w-auto">
            Sign out
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Placeholder: Notes workspace */}
        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Your notes</CardTitle>
            <CardDescription>
              This is the space where your notes list + editor will live.
            </CardDescription>
          </CardHeader>

          <CardContent className="overflow-hidden">
            <div className="w-full max-w-full overflow-hidden rounded-xl border bg-background p-4">
              {/* Top controls */}
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                  <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  <Skeleton className="h-4 w-44 max-w-full sm:w-64" />
                </div>

                <div className="flex shrink-0 gap-2">
                  <Skeleton className="h-9 w-28 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>

              {/* Selected note header */}
              <div className="mt-5 space-y-2">
                <Skeleton className="h-6 w-56 max-w-full" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>

              <div className="my-5 h-px w-full bg-border" />

              {/* Editor lines */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
                <Skeleton className="h-4 w-9/12" />
                <Skeleton className="h-4 w-8/12" />
              </div>

              {/* Bottom actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}