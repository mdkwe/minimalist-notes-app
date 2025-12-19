import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "tailwindcss";

import Home from './routes/Home';
import Register from './routes/auth/Register';
import Login from './routes/auth/Login';
import Dashboard from './routes/Dashboard';
import Wrapper from './routes/auth/Wrapper';
import ForgotPassword from './routes/auth/ForgotPassword';
import UpdatePassword from "./routes/auth/UpdatePassword";
import CreateContent from './routes/notes/CreateContent';
import Content from './routes/notes/Content';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* home */}
        <Route path="/" element={<Home />} />

        {/* register */}
        <Route path="/register" element={<Register />} />

        {/* login */}
        <Route path="/login" element={<Login />} />

        {/* forgot password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* update password */}
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* dashboard */}
        <Route path="/dashboard" element={
          <Wrapper>
            <Dashboard />
          </Wrapper>
        } />

        {/* create note */}
        <Route path='/create' element={<CreateContent />} />

        {/* note details */}
        <Route path='/notes/:id' element={<Content />} />

      </Routes>
    </BrowserRouter>
  )
}
