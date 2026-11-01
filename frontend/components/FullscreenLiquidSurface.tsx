"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface FullscreenLiquidSurfaceProps {
  onFormed?: () => void;
  className?: string;
}

export function FullscreenLiquidSurface({
  onFormed,
  className,
}: FullscreenLiquidSurfaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onFormedCalled = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Simulation resolution (half resolution for performance and fluid spread)
    const simW = Math.floor(width / 2);
    const simH = Math.floor(height / 2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Pure transparent
    container.appendChild(renderer.domElement);

    // 2D Orthographic camera & quad
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simScene = new THREE.Scene();
    const displayScene = new THREE.Scene();
    const planeGeo = new THREE.PlaneGeometry(2, 2);

    // Floating-point ping-pong render targets for wave equation
    const targetOptions: THREE.RenderTargetOptions = {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    let targetA = new THREE.WebGLRenderTarget(simW, simH, targetOptions);
    let targetB = new THREE.WebGLRenderTarget(simW, simH, targetOptions);
    let targetPrev = new THREE.WebGLRenderTarget(simW, simH, targetOptions);

    // Mouse tracking
    const mouse = new THREE.Vector2(-10, -10);
    const prevMouse = new THREE.Vector2(-10, -10);
    let mouseMoved = false;

    // ── 1. Wave Equation Simulation Shader ──
    // Computes discrete 2D wave propagation:
    // u(t+1) = 2*u(t) - u(t-1) + c^2 * [u_left + u_right + u_up + u_down - 4*u(t)]
    const simVertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const simFragment = `
      uniform sampler2D uCurrent;
      uniform sampler2D uPrev;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec2 uPrevMouse;
      uniform float uMouseStrength;
      varying vec2 vUv;

      void main() {
        vec2 dx = vec2(1.0 / uResolution.x, 0.0);
        vec2 dy = vec2(0.0, 1.0 / uResolution.y);

        float current = texture2D(uCurrent, vUv).r;
        float prev = texture2D(uPrev, vUv).r;

        // Laplacian neighbor sampling
        float left  = texture2D(uCurrent, vUv - dx).r;
        float right = texture2D(uCurrent, vUv + dx).r;
        float down  = texture2D(uCurrent, vUv - dy).r;
        float up    = texture2D(uCurrent, vUv + dy).r;

        // Wave propagation calculation
        float next = (left + right + down + up) * 0.5 - prev;

        // Natural viscosity damping (98.2% retention per frame)
        next *= 0.982;

        // Mouse displacement line injection
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 p = vUv * aspect;
        vec2 m = uMouse * aspect;
        vec2 pm = uPrevMouse * aspect;

        // Segment distance from mouse line
        vec2 pa = p - pm, ba = m - pm;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
        float dist = length(pa - ba * h);

        if (uMouseStrength > 0.001) {
          float drop = smoothstep(0.035, 0.0, dist) * uMouseStrength;
          next -= drop * 0.45;
        }

        gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
      }
    `;

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVertex,
      fragmentShader: simFragment,
      uniforms: {
        uCurrent: { value: null },
        uPrev: { value: null },
        uResolution: { value: new THREE.Vector2(simW, simH) },
        uMouse: { value: mouse },
        uPrevMouse: { value: prevMouse },
        uMouseStrength: { value: 0.0 },
      },
    });

    const simQuad = new THREE.Mesh(planeGeo, simMaterial);
    simScene.add(simQuad);

    // ── 2. Display Shader (Vercel Liquid Refraction & Chrome Caustics) ──
    const displayVertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const displayFragment = `
      uniform sampler2D uWave;
      uniform vec2 uResolution;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 dx = vec2(1.0 / uResolution.x, 0.0);
        vec2 dy = vec2(0.0, 1.0 / uResolution.y);

        // Sample water heightfield
        float hL = texture2D(uWave, vUv - dx).r;
        float hR = texture2D(uWave, vUv + dx).r;
        float hD = texture2D(uWave, vUv - dy).r;
        float hU = texture2D(uWave, vUv + dy).r;
        float height = texture2D(uWave, vUv).r;

        // Calculate surface normal gradient
        vec3 normal = normalize(vec3((hL - hR) * 2.8, (hD - hU) * 2.8, 1.0));

        // Light reflection (Studio directional sheen)
        vec3 light = normalize(vec3(0.5, 0.8, 0.6));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);

        // Specular chrome reflection
        vec3 r = reflect(-light, normal);
        float spec = pow(max(0.0, dot(r, viewDir)), 32.0);
        float specSharp = pow(max(0.0, dot(r, viewDir)), 90.0);

        // Caustic edge ring
        float edge = length(normal.xy);
        float caustic = pow(edge, 1.8) * 1.6;

        // Pure Platinum / Chrome Color Palette
        vec3 platHighlight = vec3(0.98, 1.0, 1.0);
        vec3 platMid       = vec3(0.70, 0.74, 0.80);
        
        vec3 col = platMid * caustic + platHighlight * (spec * 0.9 + specSharp * 1.5);

        // Alpha strictly matches water deformation intensity
        float alpha = clamp(abs(height) * 1.8 + caustic * 0.6 + spec * 0.8, 0.0, 1.0);

        gl_FragColor = vec4(col, alpha);
      }
    `;

    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: displayVertex,
      fragmentShader: displayFragment,
      uniforms: {
        uWave: { value: null },
        uResolution: { value: new THREE.Vector2(width, height) },
        uTime: { value: 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const displayQuad = new THREE.Mesh(planeGeo, displayMaterial);
    displayScene.add(displayQuad);

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight; // WebGL inverted Y
      mouse.set(x, y);
      mouseMoved = true;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      if (elapsed > 1.0 && !onFormedCalled.current) {
        onFormedCalled.current = true;
        if (onFormed) onFormed();
      }

      // Calculate mouse velocity for displacement strength
      let strength = 0.0;
      if (mouseMoved) {
        const dist = mouse.distanceTo(prevMouse);
        strength = Math.min(1.2, dist * 25.0);
        mouseMoved = false;
      }

      // 1. Simulation Step (Ping-Pong FBO)
      simMaterial.uniforms.uCurrent.value = targetA.texture;
      simMaterial.uniforms.uPrev.value = targetPrev.texture;
      simMaterial.uniforms.uMouse.value.copy(mouse);
      simMaterial.uniforms.uPrevMouse.value.copy(prevMouse);
      simMaterial.uniforms.uMouseStrength.value = strength;

      // Render into Target B
      renderer.setRenderTarget(targetB);
      renderer.render(simScene, camera);

      // Cycle Ping-Pong Targets:
      // prev becomes A, A becomes B, B becomes target for next frame
      let temp = targetPrev;
      targetPrev = targetA;
      targetA = targetB;
      targetB = temp;

      prevMouse.copy(mouse);

      // 2. Render Final Display to Screen (Target null)
      renderer.setRenderTarget(null);
      displayMaterial.uniforms.uWave.value = targetA.texture;
      displayMaterial.uniforms.uTime.value = elapsed;
      renderer.render(displayScene, camera);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      displayMaterial.uniforms.uResolution.value.set(width, height);

      const newSimW = Math.floor(width / 2);
      const newSimH = Math.floor(height / 2);
      simMaterial.uniforms.uResolution.value.set(newSimW, newSimH);

      targetA.setSize(newSimW, newSimH);
      targetB.setSize(newSimW, newSimH);
      targetPrev.setSize(newSimW, newSimH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      planeGeo.dispose();
      simMaterial.dispose();
      displayMaterial.dispose();
      targetA.dispose();
      targetB.dispose();
      targetPrev.dispose();
      renderer.dispose();
    };
  }, [onFormed]);

  return (
    <div
      ref={mountRef}
      className={className || "fixed inset-0 pointer-events-auto z-0"}
    />
  );
}

export default FullscreenLiquidSurface;
