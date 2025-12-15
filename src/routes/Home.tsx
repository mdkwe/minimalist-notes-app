import { Link } from "react-router-dom";

export default function Home() {
      return (
            <div className="flex min-h-screen flex-col">
                  {/* Header */}
                  <header className="bg-violet-600 px-6 py-4">
                        <h1 className="text-center text-xl font-semibold text-white">
                              Minimalist Notes App
                        </h1>
                  </header>

                  {/* Main */}
                  <main className="flex flex-1 items-center justify-center bg-muted p-6">
                        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">

                              {/* Create Account Card */}
                              <div className="rounded-xl border bg-background p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold">Create an account</h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                          Start capturing your ideas in a clean and minimalist space.
                                    </p>

                                    <Link
                                          to="/register"
                                          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
                                    >
                                          Create account
                                    </Link>
                              </div>

                              {/* Login Card */}
                              <div className="rounded-xl border bg-background p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold">Login</h2>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                          Welcome back. Continue where you left off.
                                    </p>

                                    <Link
                                          to="/login"
                                          className="mt-6 inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                          Login
                                    </Link>
                              </div>

                        </div>
                  </main>
            </div>
      );
}