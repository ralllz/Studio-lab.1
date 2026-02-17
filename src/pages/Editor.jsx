import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Stage, Layer, Image as KImage, Text, Group } from 'react-konva'
import useImage from 'use-image'

function KonvaImage({ src, x=0, y=0, width, height, filters=[] , opacity=1, onClick}){
  const [image] = useImage(src)
  return <KImage image={image} x={x} y={y} width={width} height={height} opacity={opacity} onClick={onClick} filters={filters} />
}

function Sticker({ src, x, y, onClick }){
  const [image] = useImage(src)
  return <KImage image={image} x={x} y={y} width={120} height={120} draggable onClick={onClick} />
}

export default function Editor(){
  const loc = useLocation()
  const state = loc.state || {}
  const photo = state.photo
  const template = state.template
  const stageRef = useRef()
  const [stickers, setStickers] = useState([])
  const [texts, setTexts] = useState([])
  const [selectedTool, setSelectedTool] = useState('sticker')
  const [filter, setFilter] = useState({brightness:0, blur:0, grayscale:0})
  const [downloadRes, setDownloadRes] = useState(1)

  useEffect(()=>{
    if (!photo) {
      // nothing
    }
  }, [photo])

  function addSticker(url){
    setStickers(s => [...s, { id: Date.now(), url, x:100, y:100 }])
  }

  function addText(){
    setTexts(t => [...t, { id: Date.now(), text: 'Text', x: 150, y: 120, fontSize: 32, fontFamily: 'Inter' }])
  }

  async function handleDownload(){
    const uri = stageRef.current.toDataURL({ pixelRatio: downloadRes })
    const a = document.createElement('a')
    a.href = uri
    a.download = `photobooth_${Date.now()}.png`
    a.click()
  }

  return (
    <div className="page editor-page">
      <h2>Editor</h2>
      <div className="editor-grid">
        <div className="left-panel">
          <div className="controls">
            <button onClick={()=>setSelectedTool('sticker')}>Stiker</button>
            <button onClick={()=>setSelectedTool('text')}>Teks</button>
            <button onClick={addText}>Tambah teks</button>
            <div>
              <label>Brightness</label>
              <input type="range" min="-1" max="1" step="0.01" value={filter.brightness} onChange={e => setFilter(f => ({...f, brightness: Number(e.target.value)}))} />
            </div>
            <div>
              <label>Blur</label>
              <input type="range" min="0" max="20" step="1" value={filter.blur} onChange={e => setFilter(f => ({...f, blur: Number(e.target.value)}))} />
            </div>
            <div>
              <label>Grayscale</label>
              <input type="range" min="0" max="1" step="0.01" value={filter.grayscale} onChange={e => setFilter(f => ({...f, grayscale: Number(e.target.value)}))} />
            </div>
            <div>
              <label>Resolusi download</label>
              <select value={downloadRes} onChange={e=>setDownloadRes(Number(e.target.value))}>
                <option value={1}>Normal</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
              </select>
              <button onClick={handleDownload}>Simpan & Download</button>
            </div>
          </div>

          <div className="stickers">
            <h4>Stiker</h4>
            <div className="sticker-list">
              <img src="/stickers/star.svg" onClick={()=>addSticker('/stickers/star.svg')} />
              <img src="/stickers/heart.svg" onClick={()=>addSticker('/stickers/heart.svg')} />
              <img src="/stickers/smile.svg" onClick={()=>addSticker('/stickers/smile.svg')} />
            </div>
          </div>
        </div>

        <div className="canvas-wrap">
          <Stage width={800} height={600} ref={stageRef} className="stage">
            <Layer>
              {photo && <KonvaImage src={photo} x={0} y={0} width={800} height={600} />}
              {template && <KonvaImage src={template.template_data || template.template} x={0} y={0} width={800} height={600} opacity={1} />}
              {stickers.map(s => (
                <Sticker key={s.id} src={s.url} x={s.x} y={s.y} />
              ))}
              {texts.map(t => (
                <Text key={t.id} text={t.text} x={t.x} y={t.y} fontSize={t.fontSize} fontFamily={t.fontFamily} draggable/>
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  )
}
