import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorTrail() {
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const moveDot = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3.out" });
    const moveRing = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      moveDot(event.clientX - 3); moveDotY(event.clientY - 3);
      moveRing(event.clientX - 16); moveRingY(event.clientY - 16);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="cursor-trail" aria-hidden="true">
      <span ref={ring} className="cursor-ring" />
      <span ref={dot} className="cursor-dot" />
    </div>
  );
}
