import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Templates from './pages/Templates'
import Photobooth from './pages/Photobooth'
import Editor from './pages/Editor'

export default function App() {
  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Photobooth</h1>
        <nav>
          <Link to="/">Photobooth</Link>
          <Link to="/templates">Templates</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Photobooth />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </main>
    </div>
  )
}
