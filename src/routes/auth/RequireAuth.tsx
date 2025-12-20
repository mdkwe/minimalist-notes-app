import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSession } from "@/lib/hooks/useSession"

export default function RequireAuth() {
  const { loading, authenticated } = useSession()
  const location = useLocation()

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}