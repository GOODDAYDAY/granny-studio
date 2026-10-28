import { ImagePlus, Upload, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { rgbToHex } from '../domain/color'
import { useStudio } from '../store/studio'

const LOUPE_PIXELS = 9
const LOUPE_SCALE = 13
const LOUPE_SIZE = LOUPE_PIXELS * LOUPE_SCALE

interface LoupeState {
  nx: number
  ny: number
  x: number
  y: number
  hex: string
  visible: boolean
}

const EMPTY_LOUPE: LoupeState = {
  nx: 0,
  ny: 0,
  x: 0,
  y: 0,
  hex: '#FFFFFF',
  visible: false,
}

export default function ImagePicker() {
  const close = useStudio((state) => state.closeImagePicker)
  const addPaletteColor = useStudio((state) => state.addPaletteColor)
  const selectColor = useStudio((state) => state.selectColor)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [zoom, setZoom] = useState(1)
  const [baseWidth, setBaseWidth] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [loupe, setLoupe] = useState<LoupeState>(EMPTY_LOUPE)
  const [dragActive, setDragActive] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const imageScrollRef = useRef<HTMLDivElement>(null)
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!imageUrl) return
    return () => URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const fitDisplay = () => {
    const image = imgRef.current
    const scroll = imageScrollRef.current
    if (!image || !scroll) return
    const availableWidth = scroll.clientWidth
    const availableHeight = scroll.clientHeight
    if (availableWidth <= 0 || availableHeight <= 0) return
    const fit = Math.min(
      availableWidth / image.naturalWidth,
      availableHeight / image.naturalHeight,
    )
    if (Number.isFinite(fit) && fit > 0) {
      setBaseWidth(Math.max(120, Math.round(image.naturalWidth * fit)))
    }
  }

  useEffect(() => {
    if (!imageUrl) return
    const handleResize = () => fitDisplay()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // fitDisplay reads refs only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  useEffect(() => {
    const canvas = sampleCanvasRef.current
    const loupeCanvas = loupeCanvasRef.current
    if (!canvas || !loupeCanvas || !loupe.visible) return
    const context = loupeCanvas.getContext('2d')
    if (!context) return

    context.imageSmoothingEnabled = false
    context.fillStyle = '#2A1D13'
    context.fillRect(0, 0, LOUPE_SIZE, LOUPE_SIZE)

    const startX = loupe.nx - Math.floor(LOUPE_PIXELS / 2)
    const startY = loupe.ny - Math.floor(LOUPE_PIXELS / 2)
    const sx = Math.max(0, startX)
    const sy = Math.max(0, startY)
    const ex = Math.min(canvas.width, startX + LOUPE_PIXELS)
    const ey = Math.min(canvas.height, startY + LOUPE_PIXELS)
    const dx = (sx - startX) * LOUPE_SCALE
    const dy = (sy - startY) * LOUPE_SCALE

    context.drawImage(
      canvas,
      sx,
      sy,
      Math.max(1, ex - sx),
      Math.max(1, ey - sy),
      dx,
      dy,
      (ex - sx) * LOUPE_SCALE,
      (ey - sy) * LOUPE_SCALE,
    )

    context.strokeStyle = 'rgba(255,247,236,.16)'
    context.lineWidth = 1
    for (let index = 0; index <= LOUPE_PIXELS; index += 1) {
      const point = index * LOUPE_SCALE
      context.beginPath()
      context.moveTo(point, 0)
      context.lineTo(point, LOUPE_SIZE)
      context.stroke()
      context.beginPath()
      context.moveTo(0, point)
      context.lineTo(LOUPE_SIZE, point)
      context.stroke()
    }

    const centerX = (loupe.nx - startX) * LOUPE_SCALE
    const centerY = (loupe.ny - startY) * LOUPE_SCALE
    context.strokeStyle = 'rgba(0,0,0,.45)'
    context.lineWidth = 3
    context.strokeRect(centerX + 1.5, centerY + 1.5, LOUPE_SCALE - 3, LOUPE_SCALE - 3)
    context.strokeStyle = '#FFF7EC'
    context.lineWidth = 1.5
    context.strokeRect(centerX, centerY, LOUPE_SCALE, LOUPE_SCALE)
  }, [loupe])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const maxSize = 2400
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      sampleCanvasRef.current = canvas
      setImageUrl(objectUrl)
      setFileName(file.name)
      setZoom(1)
      setBaseWidth(0)
      setPicked([])
      setLoupe(EMPTY_LOUPE)
    }
    image.onerror = () => URL.revokeObjectURL(objectUrl)
    image.src = objectUrl
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (file) handleFile(file)
    event.currentTarget.value = ''
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const sampleAt = (clientX: number, clientY: number) => {
    const image = imgRef.current
    const canvas = sampleCanvasRef.current
    if (!image || !canvas) return null
    const rect = image.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const ratioX = (clientX - rect.left) / rect.width
    const ratioY = (clientY - rect.top) / rect.height
    if (ratioX < 0 || ratioX > 1 || ratioY < 0 || ratioY > 1) return null
    const nx = Math.min(canvas.width - 1, Math.max(0, Math.floor(ratioX * canvas.width)))
    const ny = Math.min(canvas.height - 1, Math.max(0, Math.floor(ratioY * canvas.height)))
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null
    const data = context.getImageData(nx, ny, 1, 1).data
    return { nx, ny, hex: rgbToHex(data[0], data[1], data[2]) }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLImageElement>) => {
    const point = sampleAt(event.clientX, event.clientY)
    if (!point) {
      setLoupe((current) => ({ ...current, visible: false }))
      return
    }
    setLoupe({
      ...point,
      x: event.clientX,
      y: event.clientY,
      visible: true,
    })
  }

  const onPick = (event: ReactPointerEvent<HTMLImageElement>) => {
    const point = sampleAt(event.clientX, event.clientY)
    if (!point) return
    addPaletteColor(point.hex, 'image')
    setPicked((current) => [point.hex, ...current.filter((hex) => hex !== point.hex)].slice(0, 8))
  }

  const loupeLeft =
    loupe.x + 24 + LOUPE_SIZE + 26 > window.innerWidth ? loupe.x - LOUPE_SIZE - 30 : loupe.x + 24
  const loupeTop =
    loupe.y + 24 + LOUPE_SIZE + 34 > window.innerHeight
      ? loupe.y - LOUPE_SIZE - 34
      : loupe.y + 24

  return (
    <div className="modal-backdrop picker-backdrop" onPointerDown={close}>
      <div
        className="picker-modal"
        role="dialog"
        aria-modal="true"
        aria-label="从图片取色"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="picker-head">
          <div>
            <span className="eyebrow">EYEDROPPER</span>
            <h2>从图片取色</h2>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="关闭取色">
            <X size={19} />
          </button>
        </div>

        <div className={`picker-body${imageUrl ? ' has-image' : ''}`}>
          <div className="picker-main">
            {!imageUrl ? (
              <div
                className={`drop-zone${dragActive ? ' is-drag' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    inputRef.current?.click()
                  }
                }}
              >
                <span className="drop-icon">
                  <ImagePlus size={30} />
                </span>
                <h3>拖入一张参考图</h3>
                <p>或者点击选择 · JPG / PNG / WebP</p>
                <button type="button" className="btn btn-primary">
                  选择图片
                </button>
                <small>图片只在本机取色，不会上传服务器。</small>
              </div>
            ) : (
              <>
                <div className="picker-toolbar">
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload size={15} />
                    换一张
                  </button>
                  <div className="zoom-controls">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
                      disabled={zoom <= 1}
                      aria-label="缩小"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setZoom((value) => Math.min(4, value + 0.25))}
                      disabled={zoom >= 4}
                      aria-label="放大"
                    >
                      <ZoomIn size={15} />
                    </button>
                  </div>
                  <span className="hex-readout">{loupe.visible ? loupe.hex : '移到图上取色'}</span>
                </div>
                <div className="image-scroll" ref={imageScrollRef}>
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt={`参考图 ${fileName}`}
                    style={{
                      width: baseWidth > 0 ? `${baseWidth * zoom}px` : '100%',
                    }}
                    draggable={false}
                    onLoad={() => requestAnimationFrame(fitDisplay)}
                    onPointerMove={onPointerMove}
                    onPointerLeave={() => setLoupe((current) => ({ ...current, visible: false }))}
                    onPointerDown={onPick}
                  />
                </div>
              </>
            )}
          </div>

          <aside className="picker-side">
            <p className="picker-note">
              在图上任意位置点一下，颜色就会加入调色盘。放大镜按原图像素采样，不会取到缩放后的模糊颜色。
            </p>
            <div className="picked-block">
              <span className="eyebrow">PICKED · {picked.length}</span>
              <div className="picked-grid">
                {picked.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className="picked-chip"
                    onClick={() => selectColor(hex)}
                    title={`使用 ${hex}`}
                  >
                    <i style={{ background: hex }} />
                    <span>{hex}</span>
                  </button>
                ))}
                {picked.length === 0 && <span className="picked-empty">还没取色</span>}
              </div>
            </div>
            <button type="button" className="btn btn-primary picker-done" onClick={close}>
              完成，回去上色
            </button>
            <p className="micro-hint">参考图不会保存；取到的颜色会留在调色盘。</p>
          </aside>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onInputChange}
          aria-label="选择参考图片"
        />
      </div>

      {loupe.visible && (
        <div className="loupe" style={{ left: loupeLeft, top: loupeTop }}>
          <canvas
            ref={loupeCanvasRef}
            width={LOUPE_SIZE}
            height={LOUPE_SIZE}
            aria-hidden="true"
          />
          <span className="loupe-hex">{loupe.hex}</span>
        </div>
      )}
    </div>
  )
}
