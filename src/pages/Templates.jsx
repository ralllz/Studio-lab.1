import React, { useEffect, useState } from 'react'
import { supabase, fileToDataURL } from '../lib/supabase'

function TemplateCard({ t, onDelete }) {
  return (
    <div className="template-card">
      <img src={t.thumbnail || t.thumbnail_data} alt={t.name} />
      <div className="meta">
        <strong>{t.name}</strong>
        <div>Frames: {t.frames || 1}</div>
        <div className="actions">
          <button onClick={() => onDelete(t.id)}>Hapus</button>
        </div>
      </div>
    </div>
  )
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [name, setName] = useState('')
  const [frames, setFrames] = useState(1)
  const [templateFile, setTemplateFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    const { data, error } = await supabase.from('Photobox').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('fetch templates error', error)
      return
    }
    setTemplates(data || [])
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!name || !templateFile || !thumbnailFile) return alert('Isi semua field')
    setLoading(true)
    try {
      const templateData = await fileToDataURL(templateFile)
      const thumbnailData = await fileToDataURL(thumbnailFile)
      const payload = { name, frames: Number(frames) || 1, template_data: templateData, thumbnail: thumbnailData }
      const { error } = await supabase.from('Photobox').insert([payload])
      if (error) throw error
      setName('')
      setFrames(1)
      setTemplateFile(null)
      setThumbnailFile(null)
      fetchTemplates()
    } catch (err) {
      console.error(err)
      alert('Gagal tambah template')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus template ini?')) return
    const { error } = await supabase.from('Photobox').delete().eq('id', id)
    if (error) return alert('Gagal hapus')
    fetchTemplates()
  }

  return (
    <div className="page templates-page">
      <h2>Kelola Template</h2>
      <form className="form" onSubmit={handleAdd}>
        <input placeholder="Nama template" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" min="1" value={frames} onChange={e => setFrames(e.target.value)} />
        <label>
          Pilih file template (PNG/SVG)
          <input type="file" accept="image/*" onChange={e => setTemplateFile(e.target.files[0])} />
        </label>
        <label>
          Pilih thumbnail
          <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Tambah Template'}</button>
      </form>

      <div className="templates-grid">
        {templates.map(t => (
          <TemplateCard key={t.id} t={t} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}
