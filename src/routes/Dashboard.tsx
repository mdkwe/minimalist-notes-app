import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

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

import {
  Plus,
  LogOut,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  X,
} from "lucide-react"

type NoteListItem = {
  id: string
  title: string
  subtitle: string
  content: string
  created_at: string
  updated_at: string
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [notes, setNotes] = useState<NoteListItem[]>([])
  const [count, setCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 6

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const showingText = useMemo(() => {
    if (count === 0) return "Showing 0 of 0 notes"
    const start = from + 1
    const end = Math.min(from + notes.length, count)
    return `Showing ${start}–${end} of ${count} notes`
  }, [count, from, notes.length])

  const noteToDelete = useMemo(() => {
    if (!confirmDeleteId) return null
    return notes.find((n) => n.id === confirmDeleteId) ?? null
  }, [confirmDeleteId, notes])

  useEffect(() => {
    let mounted = true

      ; (async () => {
        setLoading(true)
        setError(null)

        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          navigate("/login")
          return
        }

        let countQuery = supabase
          .from("notes")
          .select("id", { count: "exact", head: true })

        let dataQuery = supabase
          .from("notes")
          .select("id,title,subtitle,content,created_at,updated_at")
          .order("updated_at", { ascending: false })
          .range(from, to)

        const q = search.trim()
        if (q) {
          const filter = `%${q}%`
          countQuery = countQuery.or(
            `title.ilike.${filter},subtitle.ilike.${filter},content.ilike.${filter}`,
          )
          dataQuery = dataQuery.or(
            `title.ilike.${filter},subtitle.ilike.${filter},content.ilike.${filter}`,
          )
        }

        const [{ count: c, error: countErr }, { data, error: dataErr }] =
          await Promise.all([countQuery, dataQuery])

        if (!mounted) return

        if (countErr || dataErr) {
          setError((countErr || dataErr)?.message ?? "Failed to load notes.")
          setNotes([])
          setCount(0)
        } else {
          setCount(c ?? 0)
          setNotes((data ?? []) as NoteListItem[])
        }

        setLoading(false)
      })()

    return () => {
      mounted = false
    }
  }, [navigate, search, page, from, to])

  useEffect(() => {
    setPage(1)
  }, [search])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
      return
    }
    navigate("/login")
  }

  const deleteNote = async (id: string) => {
    setDeletingId(id)
    setError(null)

    // optimistic
    const prev = notes
    setNotes((x) => x.filter((n) => n.id !== id))

    const { error } = await supabase.from("notes").delete().eq("id", id)

    setDeletingId(null)

    if (error) {
      setNotes(prev)
      setError(error.message)
      return
    }

    setCount((c) => Math.max(0, c - 1))
  }

  const clearSearch = () => setSearch("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          {/* Row 1: Title + Sign out aligned on the title line */}
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <div className="min-w-0">
              {/* line 1: title */}
              <h1 className="truncate text-3xl font-semibold tracking-tight sm:text-4xl">
                Minimalist Notes
              </h1>

              {/* line 2: tagline */}
              <p className="mt-1 truncate text-sm text-muted-foreground">
                Simple, private, fast.
              </p>
            </div>

            {/* aligned with title line */}
            <Button
              variant="outline"
              onClick={signOut}
              className="h-10 shrink-0 justify-center items-center gap-2 px-3 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sr-only">Sign Out</span>
            </Button>
          </div>
          {/* Row 2: Search + New note (same line always, no weird gap) */}
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

            {/* Mobile: icon button. Desktop: icon + text. */}
            <Button asChild className="shrink-0">
              <Link
                to="/create"
                aria-label="New note"
                className="inline-flex items-center justify-center"
              >
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
                  <div className="mt-3 flex justify-end gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
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
              <Card key={n.id} className="shadow-sm">
                {/* Whole card is clickable */}
                <Link
                  to={`/notes/${n.id}?mode=view`}
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">
                          {n.title?.trim() || "Untitled"}
                        </CardTitle>
                      </div>

                      {/* Delete top-right */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setConfirmDeleteId(n.id) // <- same state as before
                        }}
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {(n.subtitle?.trim() || n.content?.trim() || "—").slice(0, 140)}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* compact dates */}
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
                </Link>
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
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sr-only">Previous</span>
              </Button>

              <p className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="gap-2"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null)
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmDeleteId) return
                deleteNote(confirmDeleteId)
                setConfirmDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}