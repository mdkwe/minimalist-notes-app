import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When user arrives from the email link, a session should exist (recovery session).
    // If not, they opened the page directly or the link expired.
    supabase.auth.getSession().then(({ data }) => {
      setReady(true);
      if (!data.session) {
        setMessage("Your reset link is invalid or expired. Please request a new one.");
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");
    setTimeout(() => navigate("/login"), 800);
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Update password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Choose a new password for your account.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

        {/* If no session, show a link back */}
        {ready && message?.includes("expired") ? (
          <p className="text-center text-sm text-gray-500">
            <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Request a new reset link
            </Link>
          </p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                New password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-900">
                Confirm password
              </label>
              <div className="mt-2">
                <input
                  id="confirm"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}