import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Interactive Three.js Particle Canvas with Custom GLSL Shader Materials.
 * Features:
 * - 5,000 flight route & atmospheric particles
 * - Custom vertex shader computing dynamic sinusoidal wave harmonics and mouse repulsion
 * - Custom fragment shader with circular radial falloff and gradient chromatic glow
 * - Smooth dampening mouse interaction
 */
export const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Particle Geometry
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const randomness = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spread across a wide flight route airway corridor
      positions[i3] = (Math.random() - 0.5) * 160;
      positions[i3 + 1] = (Math.random() - 0.5) * 90;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;

      scales[i] = Math.random() * 0.8 + 0.4;

      randomness[i3] = (Math.random() - 0.5) * 4.0;
      randomness[i3 + 1] = (Math.random() - 0.5) * 4.0;
      randomness[i3 + 2] = (Math.random() - 0.5) * 4.0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randomness, 3));

    // 3. Custom GLSL Shaders
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      attribute float aScale;
      attribute vec3 aRandom;
      varying vec3 vPosition;
      varying float vDistToCenter;

      void main() {
        vec3 pos = position;

        // Dynamic atmospheric wave simulation
        float waveX = sin(pos.y * 0.04 + uTime * 0.7 + aRandom.x) * 3.5;
        float waveY = cos(pos.x * 0.04 + uTime * 0.6 + aRandom.y) * 2.5;
        float waveZ = sin(pos.x * 0.02 + pos.y * 0.03 + uTime * 0.5) * 4.0;

        pos.x += waveX;
        pos.y += waveY;
        pos.z += waveZ;

        // Interactive mouse repulsion field
        vec2 screenPos = pos.xy;
        float distToMouse = length(screenPos - uMouse * 60.0);
        float mouseRadius = 24.0;
        if (distToMouse < mouseRadius) {
          float force = (1.0 - distToMouse / mouseRadius) * 12.0;
          vec2 pushDir = normalize(screenPos - uMouse * 60.0);
          pos.xy += pushDir * force;
          pos.z += force * 2.0;
        }

        vPosition = pos;
        vDistToCenter = length(pos.xy) / 100.0;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Distance attenuation for particle sizes
        gl_PointSize = (aScale * 38.0) * (1.0 / -mvPosition.z);
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uTime;
      varying vec3 vPosition;
      varying float vDistToCenter;

      void main() {
        // Soft circular point shape with radial falloff
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) {
          discard;
        }

        // Smooth radial edge attenuation
        float alpha = smoothstep(0.5, 0.05, dist) * 0.65;

        // Chromatic interpolation based on elevation and time
        float mixFactor = clamp((vPosition.y + 40.0) / 80.0 + sin(uTime * 0.3) * 0.15, 0.0, 1.0);
        vec3 finalColor = mix(uColor1, uColor2, mixFactor);

        // Core highlight
        if (dist < 0.15) {
          finalColor += vec3(0.2, 0.25, 0.35);
        }

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor1: { value: new THREE.Color("#0284c7") }, // Sky Cyan
      uColor2: { value: new THREE.Color("#3b82f6") }, // Cobalt Indigo
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 4. Mouse interaction with dampening
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 5. Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      uniforms.uTime.value = elapsedTime;
      uniforms.uMouse.value.set(mouse.x, mouse.y);

      // Subtle slow rotation
      particles.rotation.y = elapsedTime * 0.02;
      particles.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-particle-background"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-950"
    />
  );
};
