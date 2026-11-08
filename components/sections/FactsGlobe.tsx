"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

/* Scroll-driven WebGL globe for the Facts scene (Emons-style).
   `progress` is the pinned section's scroll progress 0..1:
     0.00–0.70  globe rises from below the panel and shrinks into a full sphere, rotating east
     0.40–0.75  locations and routes into Tbilisi fade in
   Texture: NASA Blue Marble + clouds (public domain), recoloured to brand duotone → /assets/earth-brand.jpg */

const R = 1;
const TBILISI: [number, number] = [41.72, 44.79];
const ORIGINS: [number, number][] = [
  [29.3, 120.07], // Yiwu
  [31.23, 121.47], // Shanghai
  [44.2, 80.4], // Khorgos
  [43.65, 51.17], // Aktau
  [41.0, 28.97], // Istanbul
  [53.55, 9.99], // Hamburg
  [45.46, 9.19], // Milan
];
const EXTRA_DOTS: [number, number][] = [[42.15, 41.67], [40.41, 49.87], [39.9, 116.4], [52.52, 13.4], [55.75, 37.62]];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function toVec(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** rotation.y that brings longitude `lon` to face the camera (+z) */
const faceLon = (lon: number) => Math.PI / 2 - ((lon + 180) * Math.PI) / 180;

function arc(from: THREE.Vector3, to: THREE.Vector3, lift = 0.22, segments = 64) {
  const pts: THREE.Vector3[] = [];
  const a = from.clone().normalize(), b = to.clone().normalize();
  const angle = a.angleTo(b);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const v = new THREE.Vector3().copy(a).multiplyScalar(Math.sin((1 - t) * angle)).add(b.clone().multiplyScalar(Math.sin(t * angle))).divideScalar(Math.sin(angle));
    v.multiplyScalar(R + Math.sin(Math.PI * t) * lift * angle);
    pts.push(v);
  }
  return pts;
}

/** Dashed line as real geometry (WebGL ignores line width): short tubes along the polyline. */
function dashedTube(points: THREE.Vector3[], radius: number, dash: number, gap: number, mat: THREE.Material) {
  const group = new THREE.Group();
  // cumulative length along the polyline
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + points[i - 1].distanceTo(points[i]));
  const total = cum[cum.length - 1];
  const at = (d: number) => {
    let i = 1;
    for (; i < cum.length - 1 && cum[i] < d; i++);
    const t = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return points[i - 1].clone().lerp(points[i], Math.min(1, Math.max(0, t)));
  };
  for (let start = 0; start < total; start += dash + gap) {
    const end = Math.min(total, start + dash);
    const pts = [0, 0.25, 0.5, 0.75, 1].map((u) => at(start + (end - start) * u));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, radius, 6, false), mat));
  }
  return group;
}

export default function FactsGlobe({ progress, reduce }: { progress: MotionValue<number>; reduce: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    scene.add(new THREE.AmbientLight(0xffffff, 2.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.7);
    sun.position.set(-3, 4, 5);
    scene.add(sun);

    const globe = new THREE.Group();
    scene.add(globe);
    const spin = new THREE.Group(); // rotates with scroll; markers live on it
    globe.add(spin);

    const tex = new THREE.TextureLoader().load("/assets/earth-brand.jpg", () => { needsRender = true; });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), new THREE.MeshLambertMaterial({ map: tex }));
    spin.add(earth);

    // overlays (fade in late)
    const dotGeo = new THREE.SphereGeometry(0.016, 16, 16);
    const purple = new THREE.MeshBasicMaterial({ color: 0x644ff2, transparent: true, opacity: 0 });
    [...ORIGINS, ...EXTRA_DOTS].forEach(([lat, lon]) => {
      const m = new THREE.Mesh(dotGeo, purple);
      m.position.copy(toVec(lat, lon, R * 1.004));
      spin.add(m);
    });
    const lime = new THREE.MeshBasicMaterial({ color: 0xd5f476, transparent: true, opacity: 0 });
    const tb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 24), lime);
    tb.position.copy(toVec(...TBILISI, R * 1.006));
    spin.add(tb);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x04042b, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const tbRing = new THREE.Mesh(new THREE.RingGeometry(0.034, 0.042, 40), ringMat);
    tbRing.position.copy(toVec(...TBILISI, R * 1.007));
    tbRing.lookAt(toVec(...TBILISI, 2));
    spin.add(tbRing);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xd5f476, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.05, 40), pulseMat);
    pulse.position.copy(tbRing.position);
    pulse.lookAt(toVec(...TBILISI, 2));
    spin.add(pulse);

    const routeMat = new THREE.MeshBasicMaterial({ color: 0x463dc1, transparent: true, opacity: 0 });
    const tbV = toVec(...TBILISI);
    ORIGINS.forEach(([lat, lon]) => {
      spin.add(dashedTube(arc(toVec(lat, lon), tbV, 0.32, 96), 0.0032, 0.026, 0.016, routeMat));
    });

    let w = 0, h = 0, needsRender = true, visible = true, raf = 0;
    const resize = () => {
      w = host.clientWidth; h = host.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      needsRender = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
    io.observe(host);
    const unsub = progress.on("change", () => { needsRender = true; });

    const endRot = faceLon(TBILISI[1] + 22); // Tbilisi slightly left of centre so China routes show
    const startRot = endRot + 1.1;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const p = reduce ? 1 : progress.get();
      const tSec = (now - t0) / 1000;
      if (!needsRender && reduce) return;

      // fit: radius in screen ~ 0.36 of min(w,h) at the end, ~1.1 of width at the start
      const k = easeOut(range(p, 0.05, 0.7)); // rotates and shrinks into a full sphere
      const fitEnd = 0.29 * Math.min(w, h * 1.15);
      const fitStart = Math.min((w < 768 ? 0.55 : 0.32) * w, 0.7 * h); // Emons-like start: moderate globe under the figures
      const pxRadius = lerp(fitStart, fitEnd, k);
      const dist = (R * h) / (2 * Math.tan((camera.fov * Math.PI) / 360) * pxRadius);
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      // vertical: globe centre starts ~1 radius below the panel bottom, ends just below centre
      const worldPerPx = (2 * Math.tan((camera.fov * Math.PI) / 360) * dist) / h;
      // keep the globe's top touching the WEFORWARD wordmark (Facts.tsx: top 8vh, width 60vw / 82vw, viewBox 992×100)
      const wordmarkH = ((w < 768 ? 0.72 : 0.5) * window.innerWidth * 100) / 992;
      const wordmarkBottom = h * 0.08 + wordmarkH;
      const lift = wordmarkH * 0.2; // tucks slightly under the letters
      const touchPx = h / 2 - wordmarkBottom - pxRadius + lift; // centre offset from panel middle (up = +)
      globe.position.y = touchPx * worldPerPx;

      globe.rotation.x = 0.42; // show the northern hemisphere
      spin.rotation.y = lerp(startRot, endRot, k) + (reduce ? 0 : Math.sin(tSec * 0.25) * 0.12); // gentle sway, never drifts away from Tbilisi

      const f = easeOut(range(p, 0.4, 0.75));
      purple.opacity = f;
      lime.opacity = f;
      ringMat.opacity = f;
      routeMat.opacity = f;
      const pp = (tSec % 2) / 2;
      pulse.scale.setScalar(1 + pp * 1.8);
      pulseMat.opacity = reduce ? 0 : f * (1 - pp) * 0.9;

      renderer.render(scene, camera);
      needsRender = false;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      unsub();
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose?.();
      });
      tex.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [progress, reduce]);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />;
}
