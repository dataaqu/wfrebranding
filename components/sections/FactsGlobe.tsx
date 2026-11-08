"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

/* Scroll-driven WebGL globe for the Facts scene (Emons-style).
   `progress` is the pinned section's scroll progress 0..1:
     0.00–0.70  globe rises from below the panel and shrinks into a full sphere, rotating east
     0.40–0.75  Georgia lights up in phosphor lime
   Texture: NASA Blue Marble + clouds (public domain), recoloured to brand duotone → /assets/earth-brand.jpg */

const R = 1;
const TBILISI: [number, number] = [41.72, 44.79];
// Georgia's border, [lon, lat] (Natural Earth via johan/world.geo.json, public domain)
const GEORGIA: [number, number][] = [[41.554, 41.536], [41.703, 41.963], [41.453, 42.645], [40.875, 43.014], [40.321, 43.129], [39.955, 43.435], [40.077, 43.553], [40.922, 43.382], [42.394, 43.220], [43.756, 42.741], [43.931, 42.555], [44.538, 42.712], [45.470, 42.503], [45.776, 42.092], [46.405, 41.861], [46.145, 41.723], [46.638, 41.182], [46.502, 41.064], [45.963, 41.124], [45.217, 41.411], [44.972, 41.248], [43.583, 41.092], [42.620, 41.583]];

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

    // Performance budget: weak devices (≤4 cores or ≤4 GB) get 1× pixels, a 2K texture and no idle animation.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    const dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5);
    // MSAA only where pixels are coarse; at ≥1.5× the sphere edge is already smooth
    const renderer = new THREE.WebGLRenderer({ antialias: dpr < 1.5, alpha: true, powerPreference: lowEnd ? "low-power" : "default" });
    renderer.setPixelRatio(dpr);
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

    // 4K only when the globe is drawn large on a capable device; otherwise 2K (¼ the GPU memory and decode time)
    const big = !lowEnd && Math.min(host.clientWidth, host.clientHeight * 1.15) * dpr > 1100;
    const tex = new THREE.TextureLoader().load(big ? "/assets/earth-brand.jpg" : "/assets/earth-brand-2k.jpg", () => { needsRender = true; kick(); });
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), new THREE.MeshLambertMaterial({ map: tex }));
    spin.add(earth);

    // Georgia: country shape in phosphor lime, with a soft glow (fades in late)
    const LIME = 0xd5f476;
    const contour = GEORGIA.map(([lon, lat]) => new THREE.Vector2(lon, lat));
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    const shapeGeo = new THREE.BufferGeometry();
    shapeGeo.setAttribute("position", new THREE.Float32BufferAttribute(GEORGIA.flatMap(([lon, lat]) => toVec(lat, lon, R * 1.003).toArray()), 3));
    shapeGeo.setIndex(tris.flat());
    const fillMat = new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const fill = new THREE.Mesh(shapeGeo, fillMat);
    fill.renderOrder = 2; // drawn over the glow
    spin.add(fill);
    const edgeMat = new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0 });
    const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(GEORGIA.map(([lon, lat]) => toVec(lat, lon, R * 1.004))), edgeMat);
    edge.renderOrder = 3;
    spin.add(edge);
    // glow: radial-gradient sprite centred on Georgia
    const gc = document.createElement("canvas");
    gc.width = gc.height = 128;
    const g2 = gc.getContext("2d")!;
    const grad = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(213,244,118,1)");
    grad.addColorStop(0.3, "rgba(213,244,118,0.7)");
    grad.addColorStop(1, "rgba(213,244,118,0)");
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(gc);
    const glowMat = new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, depthTest: false }) // Georgia always faces the camera here;
    const glow = new THREE.Sprite(glowMat);
    glow.position.copy(toVec(42.2, 43.5, R * 1.02));
    glow.scale.setScalar(0.32);
    glow.renderOrder = 1;
    spin.add(glow);

    let w = 0, h = 0, needsRender = true, visible = false, raf = 0, lastDraw = 0;
    const idleAnim = !reduce && !lowEnd; // gentle sway + breathing glow; off on weak devices
    const kick = () => { if (visible && !raf && !document.hidden) raf = requestAnimationFrame(frame); };
    const resize = () => {
      w = host.clientWidth; h = host.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      needsRender = true; kick();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { needsRender = true; kick(); } }, { rootMargin: "100px" });
    io.observe(host);
    const onVis = () => { if (!document.hidden) { needsRender = true; kick(); } };
    document.addEventListener("visibilitychange", onVis);
    const unsub = progress.on("change", () => { needsRender = true; kick(); });

    const endRot = faceLon(TBILISI[1] + 22); // Georgia slightly left of centre
    const startRot = endRot + 1.1;
    const t0 = performance.now();

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;              // loop sleeps until visible again (kick)
      if (needsRender || idleAnim) raf = requestAnimationFrame(frame);
      else return;                                          // nothing changed and nothing to animate: stop
      if (!needsRender && now - lastDraw < 33) return;      // idle sway only needs ~30fps
      lastDraw = now;
      const p = reduce ? 1 : progress.get();
      const tSec = (now - t0) / 1000;

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
      spin.rotation.y = lerp(startRot, endRot, k) + (idleAnim ? Math.sin(tSec * 0.25) * 0.12 : 0); // gentle sway, never drifts away from Georgia

      const f = easeOut(range(p, 0.4, 0.75));
      fillMat.opacity = f;
      edgeMat.opacity = f;
      const breathe = idleAnim ? 0.6 + 0.4 * Math.sin(tSec * 2.2) : 0.75; // phosphor glow
      glowMat.opacity = f * breathe;
      glow.scale.setScalar(0.14 + 0.03 * breathe);

      renderer.render(scene, camera);
      needsRender = false;
    }
    resize();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
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
      glowTex.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [progress, reduce]);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />;
}
