"use client";
import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LottieOnce({ src, className, style }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let anim: any;
    async function load() {
      const lottie = await import('lottie-web');
      if (!mounted || !containerRef.current) return;
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: src,
      });
    }
    load();
    return () => {
      mounted = false;
      if (anim) anim.destroy?.();
    };
  }, [src]);

  return <div ref={containerRef} className={className} style={style} />;
}


