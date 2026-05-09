#!/usr/bin/env python3
"""
train.py
────────
Train a makeup beauty classifier from labeled face photos.
Exports a TensorFlow.js model to ../my-app/public/model/

Instructions:
  1. Place BEAUTIFUL makeup photos in  beautiful/     (min 8 photos)
  2. Place NOT BEAUTIFUL photos in     not_beautiful/ (min 8 photos)
  3. Run: python train.py
  4. Model exported to ../my-app/public/model/

Beautiful = natural skin, balanced colors, suits face shape, not cakey
Not Beautiful = wrong foundation shade, cakey skin, clashing colors, harsh style

Dependencies:
  pip install Pillow numpy tensorflow tensorflowjs scikit-learn
"""

import json
import sys
from pathlib import Path
from datetime import datetime

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Please install: pip install Pillow numpy")
    sys.exit(1)

try:
    import tensorflow as tf
    from sklearn.model_selection import train_test_split
except ImportError:
    print("Please install: pip install tensorflow scikit-learn")
    sys.exit(1)

try:
    import tensorflowjs as tfjs
except ImportError:
    print("Please install: pip install tensorflowjs")
    sys.exit(1)


# ── CONFIG ────────────────────────────────────────────────────────────────────

IMG_SIZE      = 224
BATCH_SIZE    = 8
EPOCHS_HEAD   = 20   # phase 1: train classification head (base frozen)
EPOCHS_FINE   = 15   # phase 2: fine-tune top MobileNetV2 layers
MIN_PER_CLASS = 8    # minimum photos per class (augmentation compensates)
OUTPUT_DIR    = Path("../my-app/public/model")
BEAUTIFUL_DIR = Path("beautiful")
NOT_BEAUTIFUL = Path("not_beautiful")
EXTENSIONS    = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


# ── 1. LOAD & PREPROCESS IMAGES ───────────────────────────────────────────────

def load_image(path):
    img = Image.open(path).convert("RGB").resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    return np.array(img, dtype=np.float32) / 127.5 - 1.0  # normalize to [-1, 1]


def load_dataset():
    X, y = [], []
    for label, folder in [(1, BEAUTIFUL_DIR), (0, NOT_BEAUTIFUL)]:
        files = [f for f in folder.iterdir() if f.suffix.lower() in EXTENSIONS]
        if not files:
            print(f"  ⚠️  No images found in {folder}/")
            continue
        print(f"  → {folder.name}: {len(files)} photos (label={label})")
        for f in files:
            try:
                X.append(load_image(f))
                y.append(label)
            except Exception as e:
                print(f"     Skip {f.name}: {e}")
    return np.array(X), np.array(y, dtype=np.float32)


# ── 2. BUILD MODEL ────────────────────────────────────────────────────────────

def build_model():
    """
    MobileNetV2 feature extractor (frozen in phase 1, partially unfrozen in phase 2)
    + data augmentation layers (active only during training)
    + classification head
    """
    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )
    base.trainable = False  # freeze for phase 1

    inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))

    # Data augmentation — runs only during model.fit(), not during inference
    x = tf.keras.layers.RandomFlip("horizontal")(inputs)
    x = tf.keras.layers.RandomRotation(0.08)(x)
    x = tf.keras.layers.RandomBrightness(0.12)(x)
    x = tf.keras.layers.RandomContrast(0.08)(x)

    x = base(x, training=False)
    x = tf.keras.layers.Dense(128, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    x = tf.keras.layers.Dense(64, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(1, activation="sigmoid")(x)

    model = tf.keras.Model(inputs, outputs)
    return model, base


# ── 3. TRAIN ──────────────────────────────────────────────────────────────────

def train():
    print("\n" + "=" * 60)
    print("  Makeup Beauty Classifier — Training")
    print("=" * 60)

    # Load data
    print("\n📂 Loading images...")
    X, y = load_dataset()

    if len(X) == 0:
        print("\n❌ No images found.")
        print("   Add photos to beautiful/ and not_beautiful/ then run again.")
        sys.exit(1)

    n_beautiful = int(y.sum())
    n_not       = len(y) - n_beautiful
    print(f"\n  ✅ Beautiful:     {n_beautiful} photos")
    print(f"  ✅ Not Beautiful: {n_not} photos")
    print(f"  ✅ Total:         {len(X)} photos")

    if n_beautiful < MIN_PER_CLASS or n_not < MIN_PER_CLASS:
        print(f"\n⚠️  Need at least {MIN_PER_CLASS} photos per class.")
        print(f"   Beautiful: {n_beautiful}/{MIN_PER_CLASS}  |  Not Beautiful: {n_not}/{MIN_PER_CLASS}")
        sys.exit(1)

    # Split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"\n  Train: {len(X_train)} | Validation: {len(X_val)}")

    # Build
    print("\n🔧 Building model (MobileNetV2 + augmentation)...")
    model, base = build_model()

    # ── Phase 1: Train classification head only ──────────────────────────────
    print(f"\n🚀 Phase 1 — Training head ({EPOCHS_HEAD} epochs max, stops early if optimal)...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    early1 = tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=6,
        restore_best_weights=True, verbose=1
    )
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS_HEAD,
        batch_size=BATCH_SIZE,
        callbacks=[early1],
        verbose=1,
    )

    # ── Phase 2: Fine-tune top MobileNetV2 layers ────────────────────────────
    print(f"\n🔬 Phase 2 — Fine-tuning top layers ({EPOCHS_FINE} epochs max)...")
    base.trainable = True
    for layer in base.layers[:-30]:   # freeze all except last 30 layers
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),  # lower LR for fine-tuning
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )
    early2 = tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=5,
        restore_best_weights=True, verbose=1
    )
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS_FINE,
        batch_size=BATCH_SIZE,
        callbacks=[early2],
        verbose=1,
    )

    final_acc     = history.history["accuracy"][-1]
    final_val_acc = history.history["val_accuracy"][-1]
    print(f"\n  Train accuracy:      {final_acc:.2%}")
    print(f"  Validation accuracy: {final_val_acc:.2%}")

    # ── Export to TensorFlow.js ──────────────────────────────────────────────
    print(f"\n💾 Exporting to {OUTPUT_DIR}/...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    tfjs.converters.save_keras_model(model, str(OUTPUT_DIR))

    meta = {
        "trainedAt":    datetime.now().isoformat(),
        "trainAcc":     round(final_acc, 4),
        "valAcc":       round(final_val_acc, 4),
        "totalSamples": len(X),
        "beautiful":    n_beautiful,
        "notBeautiful": n_not,
        "imgSize":      IMG_SIZE,
        "scoringMode":  "ai",
    }
    with open(OUTPUT_DIR / "metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print("\n✅ Done! Model files:")
    for p in sorted(OUTPUT_DIR.iterdir()):
        print(f"   {p}")

    print("\n👉 Next steps:")
    print("   1. cd ../my-app && npm run dev")
    print("   2. Open /analyzer and upload a photo")
    print("   3. The AI score now reflects YOUR makeup beauty criteria")
    print(f"\n   Model accuracy: {final_val_acc:.0%} on validation set")


if __name__ == "__main__":
    train()
