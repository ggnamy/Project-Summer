import { SEASON_PALETTES } from '../../data/seasons'

// ── 1. COLOR SPACE UTILITIES ──────────────────────────────────────────────────

function rgbToHsv(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const mx = Math.max(rn, gn, bn)
  const mn = Math.min(rn, gn, bn)
  const diff = mx - mn
  const v = mx
  const s = mx === 0 ? 0 : diff / mx
  let h = 0
  if (diff !== 0) {
    if      (mx === rn) h = (60 * ((gn - bn) / diff) + 360) % 360
    else if (mx === gn) h = (60 * ((bn - rn) / diff) + 120) % 360
    else                h = (60 * ((rn - gn) / diff) + 240) % 360
  }
  return { h, s, v }
}

function rgbToLab(r, g, b) {
  const lin = (c) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const rl = lin(r), gl = lin(g), bl = lin(b)

  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041

  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  const fx = f(x / 0.95047), fy = f(y / 1.00000), fz = f(z / 1.08883)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

// ── 2. SKIN PIXEL DETECTION ───────────────────────────────────────────────────

function isSkinPixel(r, g, b) {
  if (r === 0 && g === 0 && b === 0) return false

  const { h, s, v } = rgbToHsv(r, g, b)
  const hsvSkin = (h <= 50 || h >= 340) && s >= 0.10 && s <= 0.90 && v >= 0.20

  const rgbSkin = (
    r > 95 && g > 40 && b > 20 &&
    r > g  && r > b  &&
    Math.abs(r - g) > 15 &&
    (r - b) > 15
  )

  const Y  =  0.299 * r + 0.587 * g + 0.114 * b
  const Cb = -0.169 * r - 0.331 * g + 0.500 * b + 128
  const Cr =  0.500 * r - 0.419 * g - 0.081 * b + 128
  const ycbcrSkin = Y >= 77 && Y <= 230 && Cb >= 138 && Cb <= 180 && Cr >= 135 && Cr <= 175

  return (hsvSkin && rgbSkin) || ycbcrSkin
}

// ── 3. UNDERTONE ANALYSIS ─────────────────────────────────────────────────────

function analyzeUndertone(skinPixels) {
  const labs = skinPixels.map(([r, g, b]) => rgbToLab(r, g, b))

  const avgL = labs.reduce((s, p) => s + p.L, 0) / labs.length
  const avgA = labs.reduce((s, p) => s + p.a, 0) / labs.length
  const avgB = labs.reduce((s, p) => s + p.b, 0) / labs.length

  const warmthScore = avgA * 0.6 + avgB * 0.4

  let undertone
  if      (warmthScore >  4) undertone = 'Warm'
  else if (warmthScore < -2) undertone = 'Cool'
  else                       undertone = 'Neutral'

  let fitzpatrick
  if      (avgL > 70) fitzpatrick = 'I–II (Very Light)'
  else if (avgL > 58) fitzpatrick = 'III (Light–Medium)'
  else if (avgL > 46) fitzpatrick = 'IV (Medium–Dark)'
  else if (avgL > 35) fitzpatrick = 'V (Dark)'
  else                fitzpatrick = 'VI (Very Dark)'

  return { undertone, fitzpatrick, avgL, avgA, avgB, warmthScore, pixelCount: skinPixels.length }
}

// ── 4. SEASON CLASSIFICATION ──────────────────────────────────────────────────

function classifySeason(undertoneData) {
  const { undertone, avgL, warmthScore } = undertoneData
  const isLight = avgL > 55

  if (undertone === 'Warm') return isLight ? 'Spring' : 'Autumn'
  if (undertone === 'Cool') return isLight ? 'Summer' : 'Winter'
  if (warmthScore > 1)      return isLight ? 'Spring' : 'Autumn'
  return isLight ? 'Summer' : 'Winter'
}

// ── 5. SKIN TONE LABEL ────────────────────────────────────────────────────────

function skinToneLabel(fitzpatrick) {
  const map = {
    'I–II (Very Light)':  'Fair, very light complexion',
    'III (Light–Medium)': 'Light-to-medium complexion',
    'IV (Medium–Dark)':   'Medium-to-dark complexion',
    'V (Dark)':           'Dark complexion',
    'VI (Very Dark)':     'Very deep, rich complexion',
  }
  return map[fitzpatrick] ?? 'Medium complexion'
}

// ── 6. COLOR RECOMMENDATIONS ──────────────────────────────────────────────────

const SEASON_DESCRIPTIONS = {
  Spring: 'Your warm, luminous skin glows in clear, bright hues. Reach for corals, warm pinks, and golden yellows. Avoid muted or cool-toned shades that dull your natural radiance.',
  Summer: 'Your cool, soft complexion is flattered by muted pastels and dusty tones. Lavenders, soft roses, and powder blues enhance your gentle harmony. Steer clear of strong warm shades.',
  Autumn: 'Your warm, earthy depth shines in rich, muted tones. Terracotta, olive, and golden browns mirror your natural warmth. Avoid icy or neon shades that clash with your palette.',
  Winter: 'Your cool, high-contrast features command bold, clear colours. Deep burgundy, navy, and icy pinks make you look striking. Avoid muddy or warm-muted tones.',
}

const AVOID_COLORS = {
  Spring: ['#000080', '#800080', '#708090'],
  Summer: ['#FF4500', '#FF8C00', '#8B4513'],
  Autumn: ['#FF69B4', '#00BFFF', '#E0E0E0'],
  Winter: ['#FF8C00', '#DAA520', '#8FBC8F'],
}

function buildRecommendations(season) {
  const p = SEASON_PALETTES[season]
  return {
    colors: [
      p.lipColors[0].hex,  p.lipColors[2].hex,
      p.blushColors[0].hex, p.blushColors[2].hex,
      p.eyeShadows[0].hex,  p.hairColors[0].hex,
    ],
    description: SEASON_DESCRIPTIONS[season],
  }
}

// ── 7. MAIN EXPORT ────────────────────────────────────────────────────────────

export async function callClaudeAnalysis(base64Image, mediaType = 'image/jpeg') {
  const img = await new Promise((resolve, reject) => {
    const el = new Image()
    el.onload  = () => resolve(el)
    el.onerror = () => reject(new Error('Failed to load image.'))
    el.src = `data:${mediaType};base64,${base64Image}`
  })

  const MAX   = 400
  const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1)
  const W     = Math.max(1, Math.round(img.naturalWidth  * scale))
  const H     = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, W, H)

  const { data } = ctx.getImageData(0, 0, W, H)

  const skinPixels = []
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (isSkinPixel(r, g, b)) skinPixels.push([r, g, b])
  }

  if (skinPixels.length < 50) {
    throw new Error(
      'Not enough skin tones detected. Please use a clear, well-lit selfie with your face centred.'
    )
  }

  const undertoneData = analyzeUndertone(skinPixels)
  const season        = classifySeason(undertoneData)

  return {
    undertone:       undertoneData.undertone,
    season,
    skinTone:        skinToneLabel(undertoneData.fitzpatrick),
    recommendations: buildRecommendations(season),
    avoidColors:     AVOID_COLORS[season],
  }
}
