import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";


export default function Register() {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [message, setMessage] = useState("");
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setMessage("");
            setLoading(true);

            const { data, error } = await supabase.auth.signUp({
                  email,
                  password,
            });

            setLoading(false);

            if (error) {
                  setMessage(error.message);
                  return;
            }

            // If email confirmation is enabled, user may be null
            if (data.user) {
                  setMessage("Registration successful!");
            } else {
                  setMessage("Check your email for a confirmation link.");
            }

            setEmail("");
            setPassword("");


      };

      return (
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                  <div className="sm:mx-auto sm:w-full sm:max-w-sm">

                        <h1 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                              Sign up
                        </h1>
                        <p>Create a new account</p>
                  </div>

                  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Email */}
                              <div>
                                    <label
                                          htmlFor="email"
                                          className="block text-sm font-medium text-gray-900"
                                    >
                                          Email address
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
                                          />
                                    </div>
                              </div>

                              {/* Password */}
                              <div>
                                    <div className="flex items-center justify-between">
                                          <label
                                                htmlFor="password"
                                                className="block text-sm font-medium text-gray-900"
                                          >
                                                Password
                                          </label>
                                    </div>
                                    <div className="mt-2">
                                          <input
                                                id="password"
                                                type="password"
                                                autoComplete="current-password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                                          />
                                    </div>
                              </div>

                              {/* Error */}
                              {message && (
                                    <p className="text-sm text-red-600">{message}</p>
                              )}

                              {/* Submit */}
                              <div>
                                    <button
                                          type="submit"
                                          disabled={loading}
                                          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
                                    >
                                          {loading ? "Registering..." : "Sign up"}
                                    </button>
                              </div>
                        </form>

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