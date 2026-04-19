import { useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const TRAIL_COUNT = 8;

export default function Cursor() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {[...Array(TRAIL_COUNT)].map((_, i) => (
        <CursorSegment key={i} index={i} />
      ))}
    </div>
  );
}

function CursorSegment({ index }: { index: number }) {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = {
    damping: 20 + index * 5,
    stiffness: 250 - index * 20,
    mass: 0.1 + index * 0.05,
  };

  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const updateMouse = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, [updateMouse]);

  const size = Math.max(2, 12 - index * 1.5);
  const opacity = Math.max(0.1, 0.8 - index * 0.1);

  return (
    <motion.div
      className="fixed left-0 top-0 rounded-full mix-blend-difference pointer-events-none"
      style={{
        x,
        y,
        width: size,
        height: size,
        backgroundColor: "var(--brand-ochre)",
        opacity,
        translateX: "-50%",
        translateY: "-50%",
      }}
    />
  );
}
