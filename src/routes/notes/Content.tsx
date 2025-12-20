import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

import { Trash2, Pencil, Save, X, LayoutDashboard } from "lucide-react"

type Note = {
  id: string
  user_id: string
  title: string
  subtitle: string
  content: string
  created_at: string
  updated_at: string
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function Content() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const cameAsView = searchParams.get("mode") === "view"

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [content, setContent] = useState("")

  const [isEditing, setIsEditing] = useState(!cameAsView)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // typing-in-view: capture first char then inject after switching to edit
  const [pendingChar, setPendingChar] = useState("")
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setIsEditing(!cameAsView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameAsView])

  const dirty = useMemo(() => {
    if (!note) return false
    return (
      title !== (note.title ?? "") ||
      subtitle !== (note.subtitle ?? "") ||
      content !== (note.content ?? "")
    )
  }, [note, title, subtitle, content])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setMessage(null)
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        navigate("/login")
        return
      }

      if (!id) {
        setMessage("Missing note id.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from("notes").select("*").eq("id", id).single()

      if (!mounted) return

      if (error) {
        setMessage(error.message)
        setNote(null)
      } else {
        const n = data as Note
        setNote(n)
        setTitle(n.title ?? "")
        setSubtitle(n.subtitle ?? "")
        setContent(n.content ?? "")
      }

      setLoading(false)
    })()

    return () => {
      mounted = false
    }
  }, [id, navigate])

  const setViewModeInUrl = () => {
    const sp = new URLSearchParams(searchParams)
    sp.set("mode", "view")
    setSearchParams(sp, { replace: true })
  }

  const clearModeParam = () => {
    const sp = new URLSearchParams(searchParams)
    sp.delete("mode")
    setSearchParams(sp, { replace: true })
  }

  const enableEditing = () => {
    setIsEditing(true)
    clearModeParam()

    requestAnimationFrame(() => {
      editorRef.current?.focus()
      if (pendingChar) {
        setContent((c) => (c ?? "") + pendingChar)
        setPendingChar("")
      }
    })
  }

  const cancelEditing = () => {
    if (!note) return

    setTitle(note.title ?? "")
    setSubtitle(note.subtitle ?? "")
    setContent(note.content ?? "")
    setPendingChar("")
    setMessage(null)

    setIsEditing(false)
    setViewModeInUrl()
  }

  const handleSave = async () => {
    if (!id || !note) return
    setMessage(null)
    setSaving(true)

    const { data, error } = await supabase
      .from("notes")
      .update({
        title: title.trim() || "Untitled",
        subtitle: subtitle.trim(),
        content,
      })
      .eq("id", id)
      .select("*")
      .single()

    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    const updated = data as Note
    setNote(updated)
    setTitle(updated.title ?? "")
    setSubtitle(updated.subtitle ?? "")
    setContent(updated.content ?? "")

    // stay here, return to view mode
    setIsEditing(false)
    setViewModeInUrl()

    setMessage("Saved.")
    window.setTimeout(() => setMessage(null), 900)
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    setMessage(null)

    const { error } = await supabase.from("notes").delete().eq("id", id)

    setDeleting(false)

    if (error) {
      setMessage(error.message)
      return
    }

    navigate("/dashboard")
  }

  const headerTitle =
    note?.title?.trim() ? note.title : title?.trim() ? title : "Untitled"

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight">
                {headerTitle}
              </h1>
              {note && (
                <p className="text-xs text-muted-foreground">
                  Updated {formatDateTime(note.updated_at)}
                </p>
              )}
            </div>

            {/* Delete top-right */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDeleteOpen(true)}
              aria-label="Delete note"
              disabled={!note || saving || deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {!note ? (
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Note not found</CardTitle>
              <CardDescription>It may have been deleted or you don’t have access.</CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {isEditing ? "Editing" : "Note"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Make changes, then save."
                    : "Read-only. Start typing to edit (or click Edit)."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled"
                    readOnly={!isEditing}
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Short summary (optional)"
                    readOnly={!isEditing}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>

                  {!isEditing ? (
                    <div
                      tabIndex={0}
                      role="textbox"
                      aria-label="Note content (read-only)"
                      className="min-h-[260px] cursor-text whitespace-pre-wrap rounded-md border bg-muted/10 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onKeyDown={(e) => {
                        const isChar =
                          e.key.length === 1 &&
                          !e.metaKey &&
                          !e.ctrlKey &&
                          !e.altKey
                        if (!isChar) return
                        e.preventDefault()
                        setPendingChar(e.key)
                        enableEditing()
                      }}
                      onDoubleClick={() => {
                        setPendingChar("")
                        enableEditing()
                      }}
                    >
                      {content?.trim() ? content : "—"}
                    </div>
                  ) : (
                    <textarea
                      ref={editorRef}
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your note…"
                      className="min-h-[260px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  )}
                </div>

                {message && (
                  <Alert variant={message === "Saved." ? "default" : "destructive"}>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* Footer */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Created {formatDateTime(note.created_at)}
                  </p>

                  <div className="flex items-center justify-end gap-2">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={enableEditing}
                        className="gap-2"
                        disabled={saving || deleting}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditing}
                          className="gap-2"
                          disabled={saving || deleting}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>

                        <Button
                          type="button"
                          onClick={handleSave}
                          className="gap-2"
                          disabled={!dirty || saving || deleting}
                        >
                          <Save className="h-4 w-4" />
                          {saving ? "Saving…" : "Save"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Big Go to dashboard (aligned & responsive) */}
            <div className="mt-4">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full justify-center gap-2"
              >
                <Link to="/dashboard" aria-label="Go to dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="hidden sm:inline">Go to dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}