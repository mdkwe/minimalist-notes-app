import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
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

import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

function getErrorMessage(err: unknown, fallback = "Something went wrong.") {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  return fallback
}

export default function CreateContent() {
  const navigate = useNavigate()
  const titleRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [content, setContent] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [leaveOpen, setLeaveOpen] = useState(false)

  const titleMax = 80
  const subtitleMax = 120

  const trimmedTitle = title.trim()
  const trimmedSubtitle = subtitle.trim()
  const trimmedContent = content.trim()

  const hasSomething = useMemo(() => {
    return (
      trimmedTitle.length > 0 ||
      trimmedSubtitle.length > 0 ||
      trimmedContent.length > 0
    )
  }, [trimmedTitle, trimmedSubtitle, trimmedContent])

  const isValid = hasSomething

  // Route guard + autofocus
  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      // if you already have RequireAuth, this is extra-safe but ok
      if (!data.session) {
        navigate("/login")
        return
      }

      requestAnimationFrame(() => titleRef.current?.focus())
    })()

    return () => {
      mounted = false
    }
  }, [navigate])

  // Warn if leaving browser tab with unsaved text
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSomething || loading) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [hasSomething, loading])

  const requestLeave = () => {
    if (!hasSomething || loading) {
      navigate("/dashboard")
      return
    }
    setLeaveOpen(true)
  }

  const handleCreate = async () => {
    if (loading) return
    setMessage(null)

    if (!isValid) {
      setMessage("Write something before creating the note.")
      return
    }

    setLoading(true)

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const session = sessionData.session

      if (!session) {
        navigate("/login")
        return
      }

      const payload = {
        user_id: session.user.id,
        title: trimmedTitle || "Untitled",
        subtitle: trimmedSubtitle,
        content: trimmedContent,
      }

      const { error } = await supabase.from("notes").insert(payload)
      if (error) throw new Error(error.message)

      toast.success("Note created")
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to create note.")
      setMessage(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleCreate()
  }

  // Cmd/Ctrl + Enter to create
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">


            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight">
                Create note
              </h1>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Start simple. You can edit later.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 gap-2 px-2"
              onClick={requestLeave}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sr-only">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">New note</CardTitle>
            <CardDescription className="text-sm">
              Title, subtitle, and content — keep it minimal.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} onKeyDown={onKeyDown} className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <span className="text-xs text-muted-foreground">
                    {title.length}/{titleMax}
                  </span>
                </div>
                <Input
                  ref={titleRef}
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, titleMax))}
                  placeholder="Untitled"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <span className="text-xs text-muted-foreground">
                    {subtitle.length}/{subtitleMax}
                  </span>
                </div>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) =>
                    setSubtitle(e.target.value.slice(0, subtitleMax))
                  }
                  placeholder="Short summary (optional)"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <span className="text-xs text-muted-foreground">
                    {content.length} chars
                  </span>
                </div>

                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note…"
                  className="min-h-[220px] w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {message && (
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button type="submit" disabled={loading || !isValid}>
                  {loading ? "Creating…" : "Create note"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={requestLeave}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Tip: leave the title empty — it will be saved as “Untitled”.
                <span className="hidden sm:inline"> Shortcut: Cmd/Ctrl + Enter.</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Leave confirmation */}
      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, they’ll be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate("/dashboard")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}