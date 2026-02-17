import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Photobooth() {
  const videoRef = useRef()
  const [templates, setTemplates] = useState([])
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    startCamera()
    fetchTemplates()
    return () => stopCamera()
  }, [])

  async function fetchTemplates() {
    const { data } = await supabase.from('Photobox').select('*').order('created_at', { ascending: false })
    setTemplates(data || [])
    if (!selected && data && data.length) setSelected(data[0])
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      console.error('camera error', err)
    }
  }

  function stopCamera() {
    const s = videoRef.current?.srcObject
    if (s && s.getTracks) s.getTracks().forEach(t => t.stop())
  }

  function handleCapture() {
    const video = videoRef.current
    if (!video) return
    const w = video.videoWidth
    const h = video.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/png')
    // pass data and selected template to editor via history state
    navigate('/editor', { state: { photo: dataUrl, template: selected } })
  }

  return (
    <div className="page photobooth-page">
      <h2>Photobooth</h2>
      <div className="photobooth-area">
        <div className="camera">
          <video ref={videoRef} autoPlay playsInline muted />
        </div>
        <div className="controls">
          <label>Template:</label>
          <select value={selected?.id || ''} onChange={e => setSelected(templates.find(t => String(t.id) === e.target.value))}>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={handleCapture}>Ambil Foto</button>
        </div>
      </div>
    </div>
  )
}
