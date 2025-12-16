import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset email sent! Check your inbox.");
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Reset password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Type in your email and we'll send you a link to reset your password
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email}
             className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
            >
            {loading ? "Sending..." : "Send reset email"}
          </button>
        </form>


        {/* Message */}
        {message && (
          <p className="text-sm text-gray-700">{message}</p>
        )}

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}