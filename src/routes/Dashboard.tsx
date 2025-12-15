import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      return;
    }
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          You’re logged in. Welcome back 👋
        </p>

        <div className="mt-6">
          <button
            onClick={signOut}
            className="inline-flex w-full items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}