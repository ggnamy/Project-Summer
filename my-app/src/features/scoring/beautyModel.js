import * as tf from '@tensorflow/tfjs'
import * as mobilenetLib from '@tensorflow-models/mobilenet'

const MODEL_KEY = 'indexeddb://beauty-classifier'

let mobilenet    = null
let classifier   = null

// ── Utilities ─────────────────────────────────────────────────────────────────

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image.'))
    img.src = src
  })
}

// ── MobileNet feature extractor ───────────────────────────────────────────────

export async function ensureMobileNet() {
  if (!mobilenet) {
    mobilenet = await mobilenetLib.load({ version: 2, alpha: 1.0 })
  }
  return mobilenet
}

export async function extractFeatures(dataUrl) {
  const net = await ensureMobileNet()
  const img = await loadImageElement(dataUrl)
  const tensor   = tf.browser.fromPixels(img)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(127.5)
    .sub(1)
    .expandDims(0)
  const embedding = net.infer(tensor, true)   // 1280-dim vector
  const data      = Array.from(await embedding.data())
  tensor.dispose()
  embedding.dispose()
  return data
}

// ── Classifier training ───────────────────────────────────────────────────────

export async function trainClassifier(examples, onProgress) {
  // examples: [{ features: number[], label: 0|1 }, ...]
  const featureTensors = examples.map(e => tf.tensor1d(e.features))
  const xs = tf.stack(featureTensors)
  const ys = tf.tensor2d(examples.map(e => [e.label]), [examples.length, 1])
  featureTensors.forEach(t => t.dispose())

  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [1280],
        units: 64,
        activation: 'relu',
        kernelInitializer: 'glorotNormal',
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ units: 1, activation: 'sigmoid' }),
    ],
  })

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  })

  const EPOCHS = 40
  let finalAccuracy = 0

  await model.fit(xs, ys, {
    epochs: EPOCHS,
    batchSize: Math.min(8, examples.length),
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        finalAccuracy = logs.acc ?? logs.accuracy ?? 0
        onProgress?.({ epoch: epoch + 1, total: EPOCHS, accuracy: finalAccuracy })
      },
    },
  })

  xs.dispose()
  ys.dispose()

  await model.save(MODEL_KEY)
  classifier = model

  return { accuracy: Math.round(finalAccuracy * 100) }
}

// ── Predict ───────────────────────────────────────────────────────────────────

export async function predictBeautyScore(dataUrl) {
  if (!classifier) {
    const loaded = await loadSavedClassifier()
    if (!loaded) throw new Error('No trained model. Go to Train page first.')
  }
  const features = await extractFeatures(dataUrl)
  const input  = tf.tensor2d([features])
  const output = classifier.predict(input)
  const score  = (await output.data())[0]
  input.dispose()
  output.dispose()
  return Math.round(score * 100)
}

// ── Persist ───────────────────────────────────────────────────────────────────

export async function loadSavedClassifier() {
  try {
    classifier = await tf.loadLayersModel(MODEL_KEY)
    return true
  } catch {
    return false
  }
}

export async function deleteSavedClassifier() {
  try {
    await tf.io.removeModel(MODEL_KEY)
    classifier = null
    return true
  } catch {
    return false
  }
}

export async function hasSavedModel() {
  try {
    const models = await tf.io.listModels()
    return MODEL_KEY in models
  } catch {
    return false
  }
}
