import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type PointerState = { x: number; y: number };

type ScrollObjectProps = {
  scroll: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<PointerState>;
  variant: "hero" | "left" | "right";
};

const paths = {
  hero: { start: [2.2, 0.9, -1.5] as const, phase: 0, size: 1.58, color: "#f0ece6" },
  left: { start: [-2.7, -0.4, -2.8] as const, phase: 1.8, size: 0.92, color: "#d8e7f5" },
  right: { start: [3.1, -1.25, -2.2] as const, phase: 3.2, size: 1.08, color: "#c7d0db" },
};

function ScrollObject({ scroll, pointer, variant }: ScrollObjectProps) {
  const group = useRef<THREE.Group>(null);
  const config = paths[variant];

  useFrame((_, delta) => {
    if (!group.current) return;
    const progress = scroll.current;
    const phase = config.phase;
    const direction = variant === "left" ? -1 : 1;
    const x = Math.sin(progress * Math.PI * 2.2 + phase) * (variant === "hero" ? 3.3 : 2.65) + pointer.current.x * 0.16;
    const y = Math.cos(progress * Math.PI * 1.55 + phase) * (variant === "hero" ? 1.35 : 1.05) + (variant === "left" ? 0.35 : -0.15) + pointer.current.y * 0.1;
    const z = config.start[2] + Math.sin(progress * Math.PI + phase) * 2.35;
    const scale = config.size + Math.sin(progress * Math.PI + phase) * (variant === "hero" ? 0.78 : 0.32);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, x, 1.4, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, y, 1.4, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, z, 1.4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y * 0.2 + progress * (1.6 + phase * 0.12), 1.5, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.25 + progress * (2.4 + phase * 0.14), 1.5, delta);
    group.current.rotation.z += delta * direction * (0.045 + progress * 0.075);
    group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, Math.max(0.55, scale), 1.4, delta));
  });

  return <group ref={group} position={config.start} scale={config.size}>
    <Float speed={0.36 + config.phase * 0.04} rotationIntensity={0.12} floatIntensity={0.2} floatingRange={[-0.16, 0.16]}>
      <mesh position={[0, 0, 0.1]}>
        <icosahedronGeometry args={[0.82, 2]} />
        <meshStandardMaterial color={config.color} metalness={0.98} roughness={0.1} transparent opacity={variant === "hero" ? 0.11 : 0.09} depthWrite={false} />
      </mesh>
      <mesh rotation={[0.45, 0.18, 0.2]}>
        <torusGeometry args={[1.5, 0.026, 12, 48]} />
        <meshStandardMaterial color={config.color} metalness={0.94} roughness={0.14} transparent opacity={variant === "hero" ? 0.13 : 0.1} depthWrite={false} />
      </mesh>
      <mesh rotation={[1.1, 0.2, 0.4]}>
        <torusGeometry args={[0.96, 0.014, 8, 48]} />
        <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.08} transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </Float>
  </group>;
}

function Scene() {
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll.current = window.scrollY / max;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <>
    <ScrollObject scroll={scroll} pointer={pointer} variant="hero" />
    <ScrollObject scroll={scroll} pointer={pointer} variant="left" />
    <ScrollObject scroll={scroll} pointer={pointer} variant="right" />
  </>;
}

export default function AmbientScene() {
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 4 : 4;
  const dpr: [number, number] = cores >= 8 ? [1, 1.25] : [0.7, 1];
  return <div className="ambient-canvas-layer pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true"><div className="ambient-glow ambient-glow-one" /><div className={`orbital-fallback ${!isTouch ? "fallback-desktop-hidden" : ""}`}><span className="fallback-orb fallback-orb-main"><i /><b /></span><span className="fallback-orb fallback-orb-left"><i /><b /></span><span className="fallback-orb fallback-orb-right"><i /><b /></span></div>{!isTouch && <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={dpr} performance={{ min: 0.55, max: 1, debounce: 240 }} gl={{ alpha: true, antialias: cores >= 8, powerPreference: "high-performance" }} frameloop="always"><ambientLight intensity={0.24} /><pointLight position={[4, 4, 6]} intensity={9} color="#f0ece6" distance={12} /><Scene /></Canvas>}</div>;
}
