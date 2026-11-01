"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface LiquidEmblemSimulationProps {
  imageSrc?: string;
  onFormed?: () => void;
  className?: string;
}

export function LiquidEmblemSimulation({
  imageSrc = "/approval-emblem-platinum.png",
  onFormed,
  className,
}: LiquidEmblemSimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onFormedCalled = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Fullscreen 2D Orthographic Scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent canvas background
    container.appendChild(renderer.domElement);

    // Multi-point expanding water ripple physics across the entire screen
    const MAX_RIPPLES = 12;
    const ripplesArray: THREE.Vector4[] = [];
    for (let i = 0; i < MAX_RIPPLES; i++) {
      ripplesArray.push(new THREE.Vector4(0.5, 0.5, -100, 0)); // x, y, birthTime, strength
    }
    let rippleIdx = 0;

    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const prevMouse = new THREE.Vector2(0.5, 0.5);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec4 uRipples[12];
      uniform float uFormProgress; // 0.0 -> 1.0
      varying vec2 vUv;

      // Simplex 2D noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        // Correct aspect ratio for uniform circular ripples everywhere
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = vUv;
        vec2 screenUvCorrected = uv * aspect;

        // 1. Calculate physical water ripples across the full screen
        vec2 rippleDisp = vec2(0.0);
        float rippleHeight = 0.0;

        for (int i = 0; i < 12; i++) {
          vec4 r = uRipples[i];
          float age = uTime - r.z;
          if (age > 0.0 && age < 3.2) {
            vec2 center = r.xy * aspect;
            float d = distance(screenUvCorrected, center);
            
            float radius = age * 0.44; // Expansion speed
            float distFromRing = d - radius;
            float waveWidth = 0.16;

            if (abs(distFromRing) < waveWidth) {
              float ring = sin(distFromRing * 55.0 - age * 8.0);
              float decay = exp(-age * 1.4) * exp(-d * 1.6) * r.w;
              
              vec2 dir = normalize(screenUvCorrected - center + vec2(0.0001));
              rippleDisp += dir * ring * decay * 0.035;
              rippleHeight += ring * decay;
            }
          }
        }

        // Ambient gentle fluid movement
        float fluidNoise = snoise(uv * 3.5 + vec2(uTime * 0.15, uTime * 0.1));
        vec2 ambientFluid = vec2(fluidNoise) * 0.005;

        // Form progress fluid turbulence (crystallizes over 2.2s)
        float formTurbulence = (1.0 - uFormProgress) * 0.06 * fluidNoise;

        vec2 totalDisp = rippleDisp + ambientFluid + vec2(formTurbulence);

        // 2. Texture UV Mapping: STRICTLY CENTERED on the screen
        vec2 center = vec2(0.5, 0.5);
        
        // Scale emblem to fit cleanly in viewport
        float scaleFactor = min(uResolution.x, uResolution.y) * 0.58;
        vec2 emblemSize = vec2(scaleFactor / uResolution.x, scaleFactor / uResolution.y);

        vec2 texUv = (uv - center) / emblemSize + vec2(0.5);
        vec2 displacedTexUv = texUv + totalDisp;

        // Sample texture only within [0, 1] bounds
        vec4 texCol = vec4(0.0);
        if (displacedTexUv.x > 0.001 && displacedTexUv.x < 0.999 && 
            displacedTexUv.y > 0.001 && displacedTexUv.y < 0.999) {
          texCol = texture2D(uTexture, displacedTexUv);
        }

        // 3. Strictly use the texture's own alpha mask
        float emblemAlpha = texCol.a;

        // Form progress circular reveal around center
        float distFromEmblemCenter = distance(texUv, vec2(0.5));
        float revealRadius = uFormProgress * 1.35;
        float formMask = smoothstep(revealRadius, revealRadius - 0.25, distFromEmblemCenter + fluidNoise * 0.12);

        float visibleEmblemAlpha = emblemAlpha * formMask;

        // 4. Specular reflections on ripple crests (pure silver sheen)
        float specular = pow(max(0.0, rippleHeight * 0.5 + 0.5), 8.0) * 0.95;
        vec3 platinumHighlight = vec3(0.96, 0.98, 1.0);
        vec3 emblemRgb = texCol.rgb + vec3(specular);

        // 5. Water ripple highlights on dark background
        vec3 backgroundRippleSheen = platinumHighlight * max(0.0, rippleHeight * 0.15);

        // Composite:
        // Where emblem is visible -> render emblem
        // Where background has ripples -> render subtle water ripple sheen
        // Everywhere else -> pure transparent / deep black (NO WHITE SQUARE!)
        vec3 finalRgb = mix(backgroundRippleSheen, emblemRgb, visibleEmblemAlpha);
        float finalAlpha = max(visibleEmblemAlpha, max(0.0, abs(rippleHeight) * 0.25));

        gl_FragColor = vec4(finalRgb, finalAlpha);
      }
    `;

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageSrc);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const uniforms = {
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(width, height) },
      uTime: { value: 0 },
      uMouse: { value: mouse },
      uRipples: { value: ripplesArray },
      uFormProgress: { value: 0.0 },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
    });

    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    let lastRippleTime = 0;
    const addRipple = (x: number, y: number, strength: number = 1.0) => {
      const now = (performance.now() - startTime) / 1000;
      if (now - lastRippleTime < 0.035) return;
      lastRippleTime = now;

      const r = ripplesArray[rippleIdx];
      r.set(x, y, now, strength);
      rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight;
      targetMouse.set(x, y);

      const dx = x - prevMouse.x;
      const dy = y - prevMouse.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.005) {
        addRipple(x, y, Math.min(2.0, speed * 30.0));
      }
      prevMouse.set(x, y);
    };

    const handleClick = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight;
      addRipple(x, y, 2.8);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    // Initial ambient ripple drops around center
    setTimeout(() => addRipple(0.50, 0.50, 1.8), 200);
    setTimeout(() => addRipple(0.48, 0.52, 1.2), 700);
    setTimeout(() => addRipple(0.52, 0.48, 1.0), 1400);

    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      const formDuration = 2.2;
      const rawProgress = Math.min(1.0, elapsed / formDuration);
      const easedProgress = 1.0 - Math.pow(1.0 - rawProgress, 3);
      uniforms.uFormProgress.value = easedProgress;

      if (rawProgress >= 0.95 && !onFormedCalled.current) {
        onFormedCalled.current = true;
        if (onFormed) onFormed();
      }

      mouse.lerp(targetMouse, 0.1);
      uniforms.uTime.value = elapsed;
      uniforms.uMouse.value = mouse;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [imageSrc, onFormed]);

  return (
    <div
      ref={mountRef}
      className={className || "fixed inset-0 pointer-events-auto z-0"}
    />
  );
}

export default LiquidEmblemSimulation;
