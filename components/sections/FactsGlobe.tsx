"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

/* Scroll-driven WebGL globe for the Facts scene (Emons-style).
   `progress` is the pinned section's scroll progress 0..1:
     0.00–0.70  globe rises from below the panel and shrinks into a full sphere, rotating east
     0.40–0.75  logistics-hub dots and the Tbilisi marker fade in
   Texture: NASA Blue Marble + clouds (public domain), recoloured to brand duotone → /assets/earth-brand.jpg */

const R = 1;
const TBILISI: [number, number] = [41.72, 44.79];
// Major world logistics hubs (sea ports, air cargo and rail/land gateways), [lat, lon]
const HUBS: [number, number][] = [
  // East & South-East Asia
  [31.23, 121.47], [29.87, 121.55], [23.13, 113.26], [22.54, 114.06], [22.32, 114.17], [36.07, 120.38], [39.08, 117.2],
  [29.3, 120.07], [22.62, 120.3], [35.1, 129.04], [35.68, 139.69], [1.29, 103.85], [3.0, 101.39], [10.82, 106.63],
  [13.08, 100.88],
  // South & Central Asia, Middle East
  [18.95, 72.95], [6.93, 79.85], [25.01, 55.06], [17.02, 54.09], [21.49, 39.19], [44.2, 80.4], [43.24, 76.89],
  [43.65, 51.17], [40.41, 49.87],
  // Europe & Black Sea
  [51.92, 4.48], [51.22, 4.4], [52.37, 4.9], [53.55, 9.99], [53.55, 8.58], [51.96, 1.35], [49.49, 0.11], [39.47, -0.38],
  [36.13, -5.45], [37.94, 23.65], [44.41, 8.93], [54.35, 18.65], [51.43, 6.76], [50.11, 8.68], [41.0, 28.97],
  [36.8, 34.63], [44.17, 28.65], [42.15, 41.67], [55.75, 37.62],
  // Africa
  [31.26, 32.3], [31.2, 29.92], [35.89, -5.5], [33.57, -7.59], [14.69, -17.44], [5.32, -4.02], [5.63, 0.02],
  [6.45, 3.39], [11.59, 43.15], [-4.04, 39.67], [-6.79, 39.21], [-29.86, 31.02], [-33.92, 18.42],
  // Americas
  [33.74, -118.27], [47.6, -122.33], [49.28, -123.12], [40.67, -74.04], [32.08, -81.09], [29.76, -95.37],
  [25.77, -80.19], [41.88, -87.63], [35.15, -90.05], [45.5, -73.57], [9.36, -79.9], [19.05, -104.31],
  [10.39, -75.51], [-12.05, -77.15], [-23.96, -46.33], [-34.6, -58.38],
  // Oceania
  [-33.87, 151.21], [-37.81, 144.96], [-36.85, 174.76],
];

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
    HUBS.forEach(([lat, lon]) => {
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
