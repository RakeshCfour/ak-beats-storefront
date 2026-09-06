import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function OrbitingForms() {
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => { scroll.current = window.scrollY * 0.00035; };
    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onPointer); };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y * 0.14 + scroll.current, 2.4, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.18, 2.4, delta);
    group.current.rotation.z += delta * 0.045;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, pointer.current.x * 0.18, 2, delta);
  });

  const chrome = { color: "#b9c4ce", metalness: 0.96, roughness: 0.08 };
  const liquid = { color: "#64717f", metalness: 0.86, roughness: 0.16 };

  return (
    <group ref={group} position={[0.2, 0.2, -0.5]}>
      <Float speed={1.1} rotationIntensity={0.34} floatIntensity={0.8} floatingRange={[-0.25, 0.25]}>
        <mesh position={[-3.35, 1.9, -1.2]} rotation={[0.3, 0.6, 0.2]}>
          <torusGeometry args={[1.45, 0.055, 24, 96]} /><meshStandardMaterial {...chrome} />
        </mesh>
      </Float>
      <Float speed={0.8} rotationIntensity={0.55} floatIntensity={1.2} floatingRange={[-0.3, 0.3]}>
        <mesh position={[3.7, 1.35, -1.8]} rotation={[0.5, 0.1, 0.6]}>
          <torusGeometry args={[1.05, 0.075, 24, 96]} /><meshStandardMaterial {...liquid} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.1} floatingRange={[-0.22, 0.22]}>
        <mesh position={[3.2, -2.5, -1.7]} rotation={[0.2, 0.4, 0.1]}>
          <sphereGeometry args={[0.72, 32, 24]} /><meshStandardMaterial {...chrome} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1} floatingRange={[-0.18, 0.18]}>
        <mesh position={[-3.6, -2.1, -1]} rotation={[0.5, 0.2, 0.4]}>
          <icosahedronGeometry args={[0.65, 1]} /><meshStandardMaterial {...liquid} />
        </mesh>
      </Float>
      <Float speed={0.55} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0.4, 2.9, -2.5]} rotation={[0.4, 0.3, 0.5]}>
          <cylinderGeometry args={[0.72, 0.72, 0.12, 64]} /><meshStandardMaterial {...chrome} />
        </mesh>
      </Float>
    </group>
  );
}

export default function AmbientScene() {
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />
      {!isTouch && <Canvas camera={{ position: [0, 0, 8], fov: 48 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} frameloop="always">
          <ambientLight intensity={0.18} />
          <pointLight position={[4, 4, 6]} intensity={18} color="#d7e5ff" distance={10} />
          <pointLight position={[-5, -2, 4]} intensity={12} color="#7368ff" distance={9} />
          <pointLight position={[0, -4, 2]} intensity={8} color="#ff6dcd" distance={8} />
          <OrbitingForms />
        </Canvas>}
    </div>
  );
}
