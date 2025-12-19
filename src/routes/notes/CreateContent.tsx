import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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

export default function CreateContent() {
  const navigate = useNavigate()

  const titleRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [content, setContent] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const titleMax = 80
  const subtitleMax = 120

  const trimmedTitle = title.trim()
  const trimmedSubtitle = subtitle.trim()
  const trimmedContent = content.trim()

  const hasSomething = useMemo(() => {
    return trimmedTitle.length > 0 || trimmedSubtitle.length > 0 || trimmedContent.length > 0
  }, [trimmedTitle, trimmedSubtitle, trimmedContent])

  // allow empty title (-> Untitled), but prevent fully empty note
  const isValid = hasSomething

  // route guard + autofocus
  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (!data.session) navigate("/login")
      // focus after auth check (more stable)
      requestAnimationFrame(() => titleRef.current?.focus())
    })()

    return () => {
      mounted = false
    }
  }, [navigate])

  // warn user if leaving with unsaved input
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSomething || loading) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [hasSomething, loading])

  const safeGoBack = () => {
    if (!hasSomething || loading) return navigate("/dashboard")
    const ok = window.confirm("You have unsaved changes. Leave anyway?")
    if (ok) navigate("/dashboard")
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
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

      if (error) throw error

      // ✅ your rule: after create => back to list
      navigate("/dashboard")
    } catch (err: any) {
      setMessage(err?.message ?? "Failed to create note.")
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
        <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight">Create note</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Start simple. You can edit later.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={safeGoBack}>
              Back
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
                    {trimmedTitle.length}/{titleMax}
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
                    {trimmedSubtitle.length}/{subtitleMax}
                  </span>
                </div>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value.slice(0, subtitleMax))}
                  placeholder="Short summary (optional)"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <span className="text-xs text-muted-foreground">
                    {trimmedContent.length} chars
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
                <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {message}
                </p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button type="submit" disabled={loading || !isValid}>
                  {loading ? "Creating…" : "Create note"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={safeGoBack}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Tip: leave the title empty — it will be saved as “Untitled”.{" "}
                <span className="hidden sm:inline">Shortcut: Cmd/Ctrl + Enter.</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}