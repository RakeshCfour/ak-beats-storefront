import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function QuietForm() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y * 0.08, 1.6, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.1, 1.6, delta);
    group.current.rotation.z += delta * 0.018;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, pointer.current.x * 0.08, 1.5, delta);
  });

  return <group ref={group} position={[2.2, 0.9, -1.5]}><Float speed={0.45} rotationIntensity={0.14} floatIntensity={0.24} floatingRange={[-0.12, 0.12]}><mesh rotation={[0.45, 0.18, 0.2]}><torusGeometry args={[1.65, 0.025, 20, 96]} /><meshStandardMaterial color="#d8d3cb" metalness={0.92} roughness={0.18} transparent opacity={0.18} /></mesh></Float></group>;
}

export default function AmbientScene() {
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true"><div className="ambient-glow ambient-glow-one" />{!isTouch && <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: true }} frameloop="always"><ambientLight intensity={0.16} /><pointLight position={[4, 4, 6]} intensity={8} color="#f0ece6" distance={10} /><QuietForm /></Canvas>}</div>;
}
