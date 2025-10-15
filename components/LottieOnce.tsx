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
    let anim: unknown;
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
        
        (anim as typeof lottie.AnimationItem).addEventListener('data_ready', () => {
          console.log('Lottie animation data ready');
        });
        
        (anim as typeof lottie.AnimationItem).addEventListener('complete', () => {
          console.log('Lottie animation completed');
        });
        
        (anim as typeof lottie.AnimationItem).addEventListener('error', (error: unknown) => {
          console.error('Lottie animation error:', error);
        });
        
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    }
    load();
    return () => {
      mounted = false;
      if (anim && typeof anim === 'object' && 'destroy' in anim && typeof anim.destroy === 'function') {
        anim.destroy();
      }
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


