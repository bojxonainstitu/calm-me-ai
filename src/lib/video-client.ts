'use client';

/**
 * Brauzer ichidagi video qayta ishlash (Privacy Shield).
 * Kadrlar serverga yuborilishidan OLDIN anonimlashtiriladi:
 *  - FaceDetector / TextDetector (Shape Detection API) mavjud boʻlsa — yuzlar va matn/raqam
 *    zonalari mozaikalanadi;
 *  - mavjud boʻlmasa — butun kadr kuchli mozaika bilan niqoblanadi (sahna tuzilishi saqlanadi,
 *    shaxsni aniqlab boʻlmaydi).
 */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExtractedFrames {
  frames: string[];
  times: number[];
  durationSec: number;
  faces: number;
  plates: number;
  method: 'face-detector' | 'heuristic';
}

function seek(v: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      v.removeEventListener('seeked', done);
      resolve();
    };
    v.addEventListener('seeked', done);
    v.currentTime = t;
    setTimeout(done, 2500); // baʼzi kodeklarda «seeked» kelmasligi mumkin
  });
}

function pixelate(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, r: Rect, block: number) {
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(1, Math.round(r.w / block));
  tmp.height = Math.max(1, Math.round(r.h / block));
  const t = tmp.getContext('2d');
  if (!t) return;
  t.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, tmp.width, tmp.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, r.x, r.y, r.w, r.h);
  ctx.imageSmoothingEnabled = true;
}

function pad(r: Rect, W: number, H: number, k = 0.2): Rect {
  const px = r.w * k;
  const py = r.h * k;
  const x = Math.max(0, r.x - px);
  const y = Math.max(0, r.y - py);
  return { x, y, w: Math.min(W - x, r.w + 2 * px), h: Math.min(H - y, r.h + 2 * py) };
}

type Detector = { detect: (src: CanvasImageSource) => Promise<{ boundingBox: DOMRectReadOnly }[]> };

export async function extractFrames(file: File, n = 6): Promise<ExtractedFrames> {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.src = url;
  v.muted = true;
  v.playsInline = true;
  v.preload = 'auto';
  try {
    await new Promise<void>((resolve, reject) => {
      v.onloadeddata = () => resolve();
      v.onerror = () => reject(new Error('Video faylni oʻqib boʻlmadi (format qoʻllab-quvvatlanmaydi)'));
    });
    const durationSec = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 30;
    const W = 480;
    const H = Math.max(160, Math.round((W * (v.videoHeight || 270)) / (v.videoWidth || 480)));
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas mavjud emas');

    const w = window as unknown as { FaceDetector?: new (o?: object) => Detector; TextDetector?: new () => Detector };
    const face: Detector | null = w.FaceDetector ? new w.FaceDetector({ fastMode: true, maxDetectedFaces: 12 }) : null;
    const text: Detector | null = w.TextDetector ? new w.TextDetector() : null;

    let faces = 0;
    let plates = 0;
    const frames: string[] = [];
    const times: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = (durationSec * (i + 1)) / (n + 1);
      await seek(v, t);
      ctx.drawImage(v, 0, 0, W, H);
      if (face) {
        let rects: Rect[] = [];
        try {
          rects = (await face.detect(cv)).map((d) => ({ x: d.boundingBox.x, y: d.boundingBox.y, w: d.boundingBox.width, h: d.boundingBox.height }));
        } catch {
          rects = [];
        }
        faces += rects.length;
        rects.forEach((r) => pixelate(ctx, cv, pad(r, W, H), 10));
        if (text) {
          try {
            const tr = (await text.detect(cv)).map((d) => ({ x: d.boundingBox.x, y: d.boundingBox.y, w: d.boundingBox.width, h: d.boundingBox.height }));
            plates += tr.length;
            tr.forEach((r) => pixelate(ctx, cv, pad(r, W, H, 0.15), 8));
          } catch {
            /* matn detektori ishlamadi */
          }
        }
        // Qoʻshimcha himoya: yengil umumiy mozaika
        pixelate(ctx, cv, { x: 0, y: 0, w: W, h: H }, 2);
      } else {
        // Yuz aniqlash API yoʻq — butun kadrni kuchli mozaika bilan niqoblaymiz
        pixelate(ctx, cv, { x: 0, y: 0, w: W, h: H }, 6);
      }
      frames.push(cv.toDataURL('image/jpeg', 0.72));
      times.push(Math.round(t * 10) / 10);
    }
    return { frames, times, durationSec, faces, plates, method: face ? 'face-detector' : 'heuristic' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
