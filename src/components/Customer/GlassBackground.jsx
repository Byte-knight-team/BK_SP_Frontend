import { useEffect, useRef } from 'react';
import { ChefHat, Pizza, Utensils, Flame, Coffee } from 'lucide-react';

/* ── Interactive Subtle Background ── */
export default function GlassBackground() {
  const containerRef = useRef(null);
  const blobsRef = useRef([]);
  const foodIconsRef = useRef([]);
  const rafRef = useRef(null);

  // Subtle background blobs (reduced parallax)
  const blobs = Object.freeze([
    { size: 300, baseX: 5, baseY: 10, speed: 0.5, parallax: 15, color: 'rgba(249,115,22,0.08)', blur: 60 },
    { size: 250, baseX: 70, baseY: 15, speed: 0.7, parallax: 12, color: 'rgba(251,146,60,0.06)', blur: 50 },
    { size: 200, baseX: 80, baseY: 65, speed: 0.4, parallax: 18, color: 'rgba(253,186,116,0.08)', blur: 45 },
    { size: 280, baseX: 5, baseY: 70, speed: 0.6, parallax: 10, color: 'rgba(249,115,22,0.05)', blur: 55 },
    { size: 180, baseX: 45, baseY: 50, speed: 0.8, parallax: 8, color: 'rgba(234,88,12,0.04)', blur: 40 },
  ]);

  // Subtle, bare food icons floating in the background (no squares/borders)
  const foodIcons = Object.freeze([
    { Icon: ChefHat, size: 48, baseX: 12, baseY: 18, speed: 0.5, parallax: -10, rotation: -12, opacity: 0.25 },
    { Icon: Pizza, size: 40, baseX: 82, baseY: 22, speed: 0.6, parallax: -8, rotation: 15, opacity: 0.2 },
    { Icon: Utensils, size: 52, baseX: 80, baseY: 68, speed: 0.55, parallax: -12, rotation: -20, opacity: 0.25 },
    { Icon: Flame, size: 36, baseX: 15, baseY: 72, speed: 0.7, parallax: -9, rotation: 10, opacity: 0.2 },
    { Icon: Coffee, size: 44, baseX: 45, baseY: 80, speed: 0.65, parallax: -6, rotation: -5, opacity: 0.25 },
  ]);

  useEffect(() => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      blobsRef.current.forEach((el, i) => {
        if (!el) return;
        const b = blobs[i];
        const floatX = Math.sin(elapsed * b.speed * 0.5 + i * 1.2) * 4 + Math.cos(elapsed * b.speed * 0.3 + i * 0.8) * 3;
        const floatY = Math.cos(elapsed * b.speed * 0.4 + i * 1.5) * 4 + Math.sin(elapsed * b.speed * 0.6 + i * 0.5) * 3;

        const tx = b.baseX + floatX;
        const ty = b.baseY + floatY;

        const scale = 1 + Math.sin(elapsed * b.speed * 0.7 + i) * 0.03;

        el.style.transform = `translate(${tx}vw, ${ty}vh) scale(${scale})`;
      });

      foodIconsRef.current.forEach((el, i) => {
        if (!el) return;
        const b = foodIcons[i];
        const floatX = Math.sin(elapsed * b.speed * 0.6 + i * 1.5) * 3;
        const floatY = Math.cos(elapsed * b.speed * 0.5 + i * 1.0) * 3;

        const tx = b.baseX + floatX;
        const ty = b.baseY + floatY;

        const rot = b.rotation + Math.sin(elapsed * b.speed) * 6;

        el.style.transform = `translate(${tx}vw, ${ty}vh) rotate(${rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {blobs.map((b, i) => (
        <div
          key={`blob-${i}`}
          ref={(el) => (blobsRef.current[i] = el)}
          className="absolute rounded-full will-change-transform"
          style={{
            width: b.size,
            height: b.size,
            background: b.color,
            filter: `blur(${b.blur}px)`,
            left: 0,
            top: 0,
          }}
        />
      ))}

      {foodIcons.map((b, i) => {
        const Icon = b.Icon;
        return (
          <div
            key={`icon-${i}`}
            ref={(el) => (foodIconsRef.current[i] = el)}
            className="absolute will-change-transform flex items-center justify-center text-orange-500"
            style={{
              left: 0,
              top: 0,
              opacity: b.opacity,
            }}
          >
            <Icon size={b.size} strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
}
