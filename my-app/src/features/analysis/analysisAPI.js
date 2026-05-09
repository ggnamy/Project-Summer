/**
 * Rule-based skin tone & personal color analyzer
 * Ported from skin_tone_analyzer.py — no ML model needed.
 * Uses Color Theory: CIE Lab + YCbCr + Kovac RGB skin detection.
 */

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

  // linear RGB → XYZ (D65 illuminant)
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
  const z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041

  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116

  const fx = f(x / 0.95047), fy = f(y / 1.00000), fz = f(z / 1.08883)

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),          // +a = warm/red   −a = cool/green
    b: 200 * (fy - fz),          // +b = warm/yellow −b = cool/blue
  }
}

// ── 2. SKIN PIXEL DETECTION ───────────────────────────────────────────────────

function isSkinPixel(r, g, b) {
  if (r === 0 && g === 0 && b === 0) return false

  const { h, s, v } = rgbToHsv(r, g, b)

  // HSV range (covers Fitzpatrick I–VI)
  const hsvSkin = (h <= 50 || h >= 340) && s >= 0.10 && s <= 0.90 && v >= 0.20

  // Kovac RGB rule
  const rgbSkin = (
    r > 95 && g > 40 && b > 20 &&
    r > g  && r > b  &&
    Math.abs(r - g) > 15 &&
    (r - b) > 15
  )

  // YCbCr rule
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

  // Warmth score: weighted a (red-green) + b (yellow-blue)
  const warmthScore = avgA * 0.6 + avgB * 0.4

  // Std dev of lightness — measures how even/smooth the skin tone is
  const varL = labs.reduce((s, p) => s + Math.pow(p.L - avgL, 2), 0) / labs.length
  const stdL = Math.sqrt(varL)

  let undertone
  if      (warmthScore >  4) undertone = 'Warm'
  else if (warmthScore < -2) undertone = 'Cool'
  else                       undertone = 'Neutral'

  // Fitzpatrick scale from L (lightness)
  let fitzpatrick
  if      (avgL > 70) fitzpatrick = 'I–II (Very Light)'
  else if (avgL > 58) fitzpatrick = 'III (Light–Medium)'
  else if (avgL > 46) fitzpatrick = 'IV (Medium–Dark)'
  else if (avgL > 35) fitzpatrick = 'V (Dark)'
  else                fitzpatrick = 'VI (Very Dark)'

  return { undertone, fitzpatrick, avgL, avgA, avgB, warmthScore, stdL, pixelCount: skinPixels.length }
}

// ── 4. SEASON CLASSIFICATION ──────────────────────────────────────────────────

function classifySeason(undertoneData) {
  const { undertone, avgL, warmthScore } = undertoneData
  const isLight = avgL > 55

  if (undertone === 'Warm')    return isLight ? 'Spring' : 'Autumn'
  if (undertone === 'Cool')    return isLight ? 'Summer' : 'Winter'
  // Neutral — use warmth_score as tiebreaker
  if (warmthScore > 1) return isLight ? 'Spring' : 'Autumn'
  return isLight ? 'Summer' : 'Winter'
}

// ── 5. AURA SCORE ─────────────────────────────────────────────────────────────

function computeAuraScore(undertoneData) {
  // Skin evenness: low stdL = smooth, uniform skin (0–1, worth 40 pts)
  // stdL ~8 = very even, ~22+ = blotchy/uneven/heavy coverage
  const uniformity = Math.max(0, 1 - undertoneData.stdL / 22)

  // Face coverage: skin pixels as % of total image (0–1, worth 30 pts)
  // A well-framed selfie typically has 20–35% skin pixels
  const coverageRatio = undertoneData.pixelCount / (undertoneData.totalPixels || 10000)
  const coverage = Math.min(coverageRatio / 0.30, 1.0)

  // Undertone clarity: how definitively warm or cool (0–1, worth 20 pts)
  const clarity = Math.min(Math.abs(undertoneData.warmthScore) / 8.0, 1.0)

  // Skin luminosity: brightness closest to L≈62 scores best (0–1, worth 10 pts)
  const luminosity = Math.max(0, 1 - Math.abs(undertoneData.avgL - 62) / 35)

  const raw = uniformity * 40 + coverage * 30 + clarity * 20 + luminosity * 10
  return Math.round(Math.min(Math.max(raw, 5), 95))
}

// ── 6. SKIN TONE LABEL (Fitzpatrick description) ──────────────────────────────

function skinToneLabel(fitzpatrick) {
  const map = {
    'I–II (Very Light)':    'Fair, very light complexion',
    'III (Light–Medium)':   'Light-to-medium complexion',
    'IV (Medium–Dark)':     'Medium-to-dark complexion',
    'V (Dark)':             'Dark complexion',
    'VI (Very Dark)':       'Very deep, rich complexion',
  }
  return map[fitzpatrick] ?? 'Medium complexion'
}

// ── 7. COLOR RECOMMENDATIONS ──────────────────────────────────────────────────

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

// ── 8. GEMINI VISION MAKEUP SCORER ───────────────────────────────────────────

const MAKEUP_PROMPT = `You are a professional makeup artist evaluating makeup quality in a face photo.
Rate the makeup on a scale of 0 to 100 based on these criteria:

BEAUTIFUL MAKEUP (70–100 points):
• Natural skin: smooth, radiant, looks like great skin not a mask
• Balanced colors: blush, lips, and eye makeup blend harmoniously
• Concealer is subtle — dark circles or blemishes covered without looking thick or cakey
• Foundation shade matches the neck/chest perfectly
• Makeup style suits the face shape — bold for strong features, soft for gentle features
• Fresh, long-lasting appearance (no melting or patchiness)

BAD MAKEUP (0–40 points):
• Wrong foundation shade — noticeable difference between face and neck
• Cakey, rough, or heavy skin texture — foundation visible in pores or creases
• Clashing colors — lip, blush, or eyeshadow do not work together
• Eyebrows too dark, too thick, or wrong shape for the hair color and face
• Style mismatch — harsh dramatic look on a gentle soft face, or vice versa
• Heavy eyeliner, very dark lip liner, or wrong blush making the face look older

MODERATE MAKEUP (40–70 points):
• Decent overall but has some visible flaws or minor mismatches

Respond ONLY with this exact JSON (no markdown, no text outside the JSON):
{"score": <integer 0-100>, "reason": "<one sentence about the most notable aspect>"}`

async function getGeminiMakeupScore(base64Image, mediaType) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return null

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const payload = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mediaType, data: base64Image } },
        { text: MAKEUP_PROMPT },
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error?.message || `Gemini HTTP ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const match = text.match(/\{[\s\S]*?\}/)
  if (!match) throw new Error('Gemini returned unexpected format')
  const parsed = JSON.parse(match[0])
  return {
    score: Math.round(Math.min(Math.max(parsed.score, 0), 100)),
    reason: parsed.reason,
  }
}

// ── 9. BEAUTY MODEL (TF.js — loads trained model if available) ────────────────

let _modelCache = null
let _modelAttempted = false

async function loadBeautyModel() {
  if (_modelAttempted) return _modelCache
  _modelAttempted = true
  try {
    const tf = await import('@tensorflow/tfjs')
    const model = await tf.loadLayersModel('/model/model.json')
    _modelCache = { model, tf }
  } catch {
    // Model not trained yet — rule-based scoring will be used instead
  }
  return _modelCache
}

async function predictBeautyScore(imgElement) {
  const loaded = await loadBeautyModel()
  if (!loaded) return null
  const { model, tf } = loaded
  return tf.tidy(() => {
    const tensor = tf.browser
      .fromPixels(imgElement)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(127.5)
      .sub(1.0)
      .expandDims(0)
    const prob = model.predict(tensor).dataSync()[0]
    return Math.round(prob * 100)
  })
}

// ── 9. MAIN EXPORT ────────────────────────────────────────────────────────────

export async function callClaudeAnalysis(base64Image, mediaType = 'image/jpeg', { skipScoring = false } = {}) {
  // Load image onto a canvas
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
  const totalPixels = W * H

  // Collect skin pixels
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

  // Run the color-science pipeline (ported from skin_tone_analyzer.py)
  const undertoneData = analyzeUndertone(skinPixels)
  const season        = classifySeason(undertoneData)

  // Scoring priority: Gemini Vision → trained ML model → rule-based
  let auraScore, scoringMode, makeupReason
  if (!skipScoring) {
    let geminiError = null
    const gemini = await getGeminiMakeupScore(base64Image, mediaType).catch((e) => { geminiError = e.message; return null })
    if (geminiError) console.warn('[Gemini] failed:', geminiError)
    if (gemini !== null) {
      auraScore    = gemini.score
      makeupReason = gemini.reason
      scoringMode  = 'gemini'
    } else {
      const mlScore = await predictBeautyScore(img)
      if (mlScore !== null) {
        auraScore   = mlScore
        scoringMode = 'ai'
      } else {
        auraScore   = computeAuraScore({ ...undertoneData, totalPixels })
        scoringMode = 'rule'
      }
    }
  }

  return {
    undertone:       undertoneData.undertone,
    season,
    auraScore,
    scoringMode,
    makeupReason:    makeupReason ?? null,
    skinTone:        skinToneLabel(undertoneData.fitzpatrick),
    recommendations: buildRecommendations(season),
    avoidColors:     AVOID_COLORS[season],
  }
}
