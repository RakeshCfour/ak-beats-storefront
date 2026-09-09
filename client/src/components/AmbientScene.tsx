import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function QuietForm() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
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

  useFrame((_, delta) => {
    if (!group.current) return;
    const progress = scroll.current;
    const journeyX = Math.sin(progress * Math.PI * 2.2) * 3.1;
    const journeyY = Math.cos(progress * Math.PI * 1.7) * 1.25 + 0.35;
    const journeyZ = -1.5 + Math.sin(progress * Math.PI) * 2.9;
    const journeyScale = 1.42 + Math.sin(progress * Math.PI) * 0.72;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y * 0.16 + progress * 1.9, 1.6, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.2 + progress * 3.4, 1.6, delta);
    group.current.rotation.z += delta * (0.035 + progress * 0.08);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, pointer.current.x * 0.12 + journeyX, 1.5, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, journeyY, 1.5, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, journeyZ, 1.5, delta);
    const currentScale = group.current.scale.x;
    const nextScale = THREE.MathUtils.damp(currentScale, journeyScale, 1.5, delta);
    group.current.scale.setScalar(nextScale);
  });

  return <group ref={group} position={[2.2, 0.9, -1.5]} scale={1.42}><Float speed={0.45} rotationIntensity={0.14} floatIntensity={0.24} floatingRange={[-0.12, 0.12]}><mesh position={[0, 0, 0.12]}><icosahedronGeometry args={[0.9, 3]} /><meshStandardMaterial color="#c7d0db" metalness={0.96} roughness={0.12} transparent opacity={0.16} depthWrite={false} /></mesh><mesh rotation={[0.45, 0.18, 0.2]}><torusGeometry args={[1.65, 0.025, 20, 96]} /><meshStandardMaterial color="#f0ece6" metalness={0.92} roughness={0.18} transparent opacity={0.14} depthWrite={false} /></mesh><mesh rotation={[1.1, 0.2, 0.4]}><torusGeometry args={[1.05, 0.012, 12, 80]} /><meshStandardMaterial color="#d8e7f5" metalness={0.96} roughness={0.12} transparent opacity={0.18} depthWrite={false} /></mesh></Float></group>;
}

export default function AmbientScene() {
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return <div className="ambient-canvas-layer pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true"><div className="ambient-glow ambient-glow-one" />{!isTouch && <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: true }} frameloop="always"><ambientLight intensity={0.24} /><pointLight position={[4, 4, 6]} intensity={10} color="#f0ece6" distance={10} /><QuietForm /></Canvas>}</div>;
}
