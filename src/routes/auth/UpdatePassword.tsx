import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Check, X } from "lucide-react"

type Status = "checking" | "ready" | "expired" | "invalid" | "success"

function parseHashParams() {
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash
  const sp = new URLSearchParams(raw)
  const fix = (v: string | null) => (v ? decodeURIComponent(v.replace(/\+/g, " ")) : null)

  return {
    type: sp.get("type"),
    accessToken: sp.get("access_token"),
    refreshToken: sp.get("refresh_token"),
    errorDescription: fix(sp.get("error_description")),
  }
}

export default function UpdatePassword() {
  const navigate = useNavigate()

  const [status, setStatus] = useState<Status>("checking")
  const [message, setMessage] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordsMatch = useMemo(() => {
    if (!confirm) return true
    return password === confirm
  }, [password, confirm])

  const passwordOk = password.length >= 6

  const canSubmit = useMemo(() => {
    return status === "ready" && !loading && passwordOk && passwordsMatch
  }, [status, loading, passwordOk, passwordsMatch])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      setStatus("checking")
      setMessage(null)

      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")

      const { type, accessToken, refreshToken, errorDescription } = parseHashParams()

      if (errorDescription) {
        const lower = errorDescription.toLowerCase()
        if (lower.includes("expired")) {
          setStatus("expired")
          setMessage("This reset link has expired. Please request a new one.")
        } else {
          setStatus("invalid")
          setMessage(errorDescription || "Invalid reset link.")
        }
        return
      }

      // PKCE: /update-password?code=...
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!mounted) return

        if (error) {
          const lower = (error.message || "").toLowerCase()
          if (lower.includes("expired")) {
            setStatus("expired")
            setMessage("This reset link has expired. Please request a new one.")
          } else {
            setStatus("invalid")
            setMessage(error.message)
          }
          return
        }

        // Clean URL
        url.searchParams.delete("code")
        window.history.replaceState({}, document.title, url.pathname)

        const { data } = await supabase.auth.getSession()
        if (!mounted) return

        if (!data.session) {
          setStatus("expired")
          setMessage("Invalid or expired reset link. Please request a new one.")
          return
        }

        setStatus("ready")
        return
      }

      // Hash token flow: #type=recovery&access_token=...&refresh_token=...
      if (type === "recovery" && accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      }

      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      if (!data.session || type !== "recovery") {
        setStatus("invalid")
        setMessage("This page is only accessible from a password reset link.")
        return
      }

      setStatus("ready")
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setStatus("success")
    setMessage("Password updated. You can now login with your new password.")

    await supabase.auth.signOut()
    window.setTimeout(() => navigate("/login"), 900)
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="mx-auto w-full max-w-md px-4 py-6 sm:px-6">
       
      <div className="mb-6 space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Update password
          </h1>
          <p className="text-sm text-muted-foreground">
            For security, reset links expire after 15 minutes.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base">Choose a new password </CardTitle>
            <CardDescription className="text-sm">
              Use at least 6 characters.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "checking" && (
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                Checking reset link…
              </div>
            )}

            {(status === "invalid" || status === "expired") && (
              <>
                {message && (
                  <Alert variant="destructive">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link to="/forgot-password">Request a new link</Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">Back to login</Link>
                  </Button>
                </div>
              </>
            )}

            {(status === "ready" || status === "success") && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || status === "success"}
                    required
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {passwordOk ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>At least 6 characters</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5" />
                        <span>At least 6 characters</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={loading || status === "success"}
                    required
                  />
                  {!passwordsMatch && (
                    <p className="text-xs text-destructive">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {message && (
                  <Alert variant={status === "success" ? "default" : "destructive"}>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                {/* Stable CTA area */}
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={!canSubmit}>
                    {loading ? "Updating…" : "Update password"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}