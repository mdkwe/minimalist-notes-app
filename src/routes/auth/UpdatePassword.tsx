import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UpdatePassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      // Checks whether reset link established a session
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        setMessage(error.message)
        return
      }

      if (!data.session) {
        setMessage("Invalid or expired reset link. Please request a new one.")
        return
      }

      setReady(true)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Password updated. Redirecting to login…")
    window.setTimeout(() => navigate("/login"), 900)
  }

  const disabled = loading || password.length < 8 || !ready

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Choose a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Set a new password for your account.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Update password</CardTitle>
            <CardDescription>
              Use at least 8 characters (recommended).
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!ready ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {password.length < 8
                      ? "Password must be at least 8 characters."
                      : "Looks good."}
                  </p>
                </div>

                {message && (
                  <Alert variant={message.toLowerCase().includes("invalid") ? "destructive" : "default"}>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={disabled}>
                  {loading ? "Updating…" : "Update password"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Back to{" "}
                  <Link
                    to="/login"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    Login
                  </Link>
                </p>
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
      </div>
    </div>
  )
}