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
            <div>
                  <h2>Register</h2>

                  {message && <p>{message}</p>}

                  <form onSubmit={handleSubmit}>
                        <input
                              type="email"
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                        />

                        <br />

                        <input
                              type="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                        />

                        <br />

                        <button type="submit" disabled={loading}>
                              {loading ? "Registering..." : "Register"}
                        </button>

                  </form>

                  <span>
                        Already have an account? <Link to="/login">Login</Link>
                  </span>

            </div>
      );
}