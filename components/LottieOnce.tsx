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
      try {
        const lottie = await import('lottie-web');
        if (!mounted || !containerRef.current) return;
        
        console.log('Loading Lottie animation from:', src);
        
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: src,
        });
        
        anim.addEventListener('data_ready', () => {
          console.log('Lottie animation data ready');
        });
        
        anim.addEventListener('complete', () => {
          console.log('Lottie animation completed');
        });
        
        anim.addEventListener('error', (error: any) => {
          console.error('Lottie animation error:', error);
        });
        
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    }
    load();
    return () => {
      mounted = false;
      if (anim) anim.destroy?.();
    };
  }, [src]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ 
        ...style, 
        minWidth: '120px', 
        minHeight: '120px',
        backgroundColor: 'transparent'
      }} 
    />
  );
}


