import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "tailwindcss";

import Home from './routes/Home';
import Register from './routes/Register';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import Wrapper from './routes/Wrapper';


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

        {/* dashboard */}
        <Route path="/dashboard" element={
          <Wrapper>
            <Dashboard />
          </Wrapper>
        } />

      </Routes>
    </BrowserRouter>
  )
}
