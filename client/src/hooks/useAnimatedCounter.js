import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const startVal = 0;
    const endVal = Number(target);

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setValue(Number(current.toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals]);

  return value;
}
