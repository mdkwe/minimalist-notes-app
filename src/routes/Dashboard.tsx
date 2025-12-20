import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useNotes } from "@/lib/hooks/useNotes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { toast } from "sonner"
import { Plus, LogOut, Search, Trash2, Clock, Calendar, X } from "lucide-react"

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getErrorMessage(err: unknown, fallback = "Something went wrong.") {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  return fallback
}

export default function Dashboard() {
  const navigate = useNavigate()

  const {
    notes,
    count,
    loading,
    error,
    search,
    setSearch,
    clearSearch,
    page,
    setPage,
    pageSize,
    totalPages,
    showingText,
    deletingId,
    deleteNote,
  } = useNotes({ pageSize: 6 })

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const noteToDelete = useMemo(() => {
    if (!confirmDeleteId) return null
    return notes.find((n) => n.id === confirmDeleteId) ?? null
  }, [confirmDeleteId, notes])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message || "Failed to sign out")
      return
    }
    toast.success("Signed out")
    navigate("/login")
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return
    setConfirmLoading(true)

    try {
      await deleteNote(confirmDeleteId) // make sure your hook throws on error (patch below)
      toast.success("Note deleted")
      setConfirmDeleteId(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete note"))
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          {/* Title row with SignOut aligned to H1 line */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-tight sm:text-4xl">
                  Minimalist Notes
                </h1>

                <Button
                  variant="outline"
                  onClick={signOut}
                  className="h-10 shrink-0 items-center justify-center gap-2 px-3 sm:px-4"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sr-only">Sign Out</span>
                </Button>
              </div>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                Simple, private, fast.
              </p>
            </div>
          </div>

          {/* Search + New note */}
          <div className="mt-6 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-9"
              />

              {search.trim().length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <Button asChild className="shrink-0">
              <Link to="/create" aria-label="New note" className="inline-flex items-center justify-center">
                <span className="inline-flex h-10 w-10 items-center justify-center sm:hidden">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New note
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="space-y-2 pb-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && notes.length === 0 && (
          <div className="rounded-xl border bg-muted/20 p-8">
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                {search.trim() ? "No results." : "No notes yet."}
              </p>

              <Button asChild variant="outline" className="gap-2">
                <Link to="/create">
                  <Plus className="h-4 w-4" />
                  Create your first note
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        {!loading && notes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <Card
                key={n.id}
                className="relative overflow-hidden rounded-xl shadow-sm transition hover:bg-muted/20 focus-within:ring-2 focus-within:ring-ring"
              >
                {/* Full-card click overlay */}
                <Link
                  to={`/notes/${n.id}?mode=view`}
                  aria-label={`Open note ${n.title?.trim() || "Untitled"}`}
                  className="absolute inset-0"
                />

                <CardHeader className="relative pb-2">
                  <div className="flex items-start justify-between gap-3">
                    {/* IMPORTANT: flex-1 prevents icon from being squeezed */}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="line-clamp-2 text-base leading-snug">
                        {n.title?.trim() || "Untitled"}
                      </CardTitle>
                    </div>

                    {/* Delete (always visible) */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="relative z-10 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmDeleteId(n.id)}
                      aria-label="Delete note"
                      disabled={deletingId === n.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {(n.subtitle?.trim() || n.content?.trim() || "—").slice(0, 140)}
                  </p>
                </CardHeader>

                <CardContent className="relative pt-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatShortDate(n.updated_at)}
                    </span>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatShortDate(n.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && count > 0 && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">{showingText}</p>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>

              <p className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Confirm delete */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open && !confirmLoading) setConfirmDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              {noteToDelete?.title?.trim()
                ? `This will permanently delete “${noteToDelete.title}”.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={confirmLoading}>
              {confirmLoading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}