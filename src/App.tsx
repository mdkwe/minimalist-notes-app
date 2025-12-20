import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Home from "./routes/Home"
import Register from "./routes/auth/Register"
import Login from "./routes/auth/Login"
import ForgotPassword from "./routes/auth/ForgotPassword"
import UpdatePassword from "./routes/auth/UpdatePassword"

import Dashboard from "./routes/Dashboard"
import CreateContent from "./routes/notes/CreateContent"
import Content from "./routes/notes/Content"
import RequireAuth from "./routes/auth/RequireAuth"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* protected */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateContent />} />
          <Route path="/notes/:id" element={<Content />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}