export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsl {
  h: number
  s: number
  l: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function normalizeHex(input: string): string | null {
  let value = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('')
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) return null
  return `#${value.toUpperCase()}`
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex)
  if (!normalized) return { r: 0, g: 0, b: 0 }
  const value = normalized.slice(1)
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const part = (value: number) =>
    Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase()
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / delta + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / delta + 2
        break
      default:
        h = (rn - gn) / delta + 4
        break
    }
    h *= 60
  }

  return { h, s: s * 100, l: l * 100 }
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp(s, 0, 100) / 100
  const light = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2
  let rp = 0
  let gp = 0
  let bp = 0

  if (hue < 60) {
    rp = c
    gp = x
  } else if (hue < 120) {
    rp = x
    gp = c
  } else if (hue < 180) {
    gp = c
    bp = x
  } else if (hue < 240) {
    gp = x
    bp = c
  } else if (hue < 300) {
    rp = x
    bp = c
  } else {
    rp = c
    bp = x
  }

  return rgbToHex((rp + m) * 255, (gp + m) * 255, (bp + m) * 255)
}

export function adjustLightness(hex: string, delta: number): string {
  const { h, s, l } = hexToHsl(hex)
  return hslToHex(h, s, clamp(l + delta, 0, 100))
}

export function mixColors(a: string, b: string, amount: number): string {
  const t = clamp(amount, 0, 1)
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex(
    ca.r + (cb.r - ca.r) * t,
    ca.g + (cb.g - ca.g) * t,
    ca.b + (cb.b - ca.b) * t,
  )
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (value: number) => {
    const s = value / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function isDark(hex: string): boolean {
  return relativeLuminance(hex) < 0.42
}

export function describeColor(hex: string): string {
  const { h, s, l } = hexToHsl(hex)
  if (l >= 89) return '奶白'
  if (l <= 12) return '墨黑'
  if (s < 10) return l > 55 ? '灰米' : '炭灰'

  const names = [
    '绯红',
    '陶土',
    '橙',
    '琥珀',
    '金',
    '黄',
    '黄绿',
    '草绿',
    '绿',
    '松绿',
    '青',
    '湖蓝',
    '蓝',
    '靛',
    '紫',
    '品红',
  ]
  const index = Math.round((((h % 360) + 360) % 360) / 22.5) % names.length
  const tone = l < 30 ? '深' : l > 72 ? '浅' : ''
  return `${tone}${names[index]}`
}
