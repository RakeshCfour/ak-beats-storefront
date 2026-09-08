import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.085, smoothWheel: true, syncTouch: false });
    let current = 0;
    let target = 0;

    const onProgress = (progress: number) => {
      target = progress;
      document.documentElement.style.setProperty("--scroll-depth", `${Math.round(progress * 100)}%`);
    };
    const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: self => onProgress(self.progress) });
    const onLenisScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
      current += (target - current) * 0.075;
      document.documentElement.style.setProperty("--scroll-progress", current.toFixed(4));
    };

    lenis.on("scroll", onLenisScroll);
    gsap.ticker.add(onTick);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onLenisScroll);
      gsap.ticker.remove(onTick);
      trigger.kill();
      lenis.destroy();
    };
  }, []);

  return null;
}
