"use client";

/* Intro loader state + critical-asset preloading.
   The intro (design-system Intro) plays its logo animation while preloadCritical() warms the
   browser cache; it only reveals the page when both are done (or after MAX_WAIT on very slow
   networks). Sections start their entrance animations from useIntroDone() instead of fixed delays. */
import { useSyncExternalStore } from "react";

let done = false;
const subs = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  subs.forEach((f) => f());
}
export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => done,
    () => false,
  );
}

const image = (src: string) => () => new Promise<void>((res) => {
  const img = new Image();
  img.onload = img.onerror = () => res();
  img.src = src;
});

/** The hero video that is actually on screen: wait until it can play (buffered enough to start). */
const heroVideo = () => new Promise<void>((res) => {
  const v = Array.from(document.querySelectorAll<HTMLVideoElement>("#hero video")).find((el) => el.offsetParent !== null);
  if (!v || v.readyState >= 3) return res();
  v.preload = "auto";
  v.addEventListener("canplay", () => res(), { once: true });
  v.addEventListener("error", () => res(), { once: true });
});

/** Loads what the first screens need; reports progress 0..1. Never rejects. */
export function preloadCritical(onProgress: (p: number) => void): Promise<void> {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  // On a slow or data-saving connection the hero shows its poster first; the video keeps loading in the background
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; saveData?: boolean } }).connection;
  const slow = !!conn && (conn.saveData || /2g|3g/.test(conn.effectiveType ?? "") || (conn.downlink ?? 10) < 3);
  const tasks: (() => Promise<unknown>)[] = [
    () => document.fonts?.ready ?? Promise.resolve(),
    ...(slow ? [] : [heroVideo]),
    image("/assets/hero-port.webp"),
    image("/assets/earth-brand-2k.jpg"),
    ...(mobile ? [] : ["truck", "ship", "train", "plane"].map((v) => image(`/assets/vehicles/${v}.webp`))),
  ];
  let n = 0;
  onProgress(0);
  return Promise.all(tasks.map((t) => t().catch(() => undefined).then(() => onProgress(++n / tasks.length)))).then(() => undefined);
}
