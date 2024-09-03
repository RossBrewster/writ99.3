import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoTransitionProps {
  onTransitionComplete: () => void;
  targetPage: 'login' | 'signup';
  initialPosition: DOMRect | undefined;
}

export const LogoTransition: React.FC<LogoTransitionProps> = ({ onTransitionComplete, targetPage, initialPosition }) => {
  const [opacity, setOpacity] = useState(1);
  const logoRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (logoRef.current && containerRef.current && initialPosition) {
      const startSize = initialPosition.width;
      const endSize = 128; // Final size of the logo on login/signup pages
      const startPosition = initialPosition;
      const endPosition = {
        top: window.innerHeight / 2 - endSize / 2,
        left: window.innerWidth / 2 - endSize / 2,
      };

      const animateSizeAndPosition = (progress: number) => {
        const size = startSize + (endSize - startSize) * progress;
        const top = startPosition.top + (endPosition.top - startPosition.top) * progress;
        const left = startPosition.left + (endPosition.left - startPosition.left) * progress;

        containerRef.current!.style.width = `${size}px`;
        containerRef.current!.style.height = `${size}px`;
        containerRef.current!.style.top = `${top}px`;
        containerRef.current!.style.left = `${left}px`;
      };

      const paths = logoRef.current.querySelectorAll('path');
      const pathAnimations = Array.from(paths).map((path, index) => {
        return animatePath(path, wPaths[index], blankLogoPaths[index], 800, index * 50);
      });

      const startTime = performance.now();
      const duration = 800;

      function animate(time: number) {
        const progress = Math.min((time - startTime) / duration, 1);
        const easedProgress = easeInOutBack(progress);
        
        animateSizeAndPosition(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          Promise.all(pathAnimations).then(() => {
            setOpacity(0);
            setTimeout(() => {
              onTransitionComplete();
              navigate(`/${targetPage}`);
            }, 500);
          });
        }
      }

      requestAnimationFrame(animate);
    }
  }, [onTransitionComplete, navigate, targetPage, initialPosition]);

  const wPaths = [
    [10, 10, 30, 90],
    [30, 90, 50, 10],
    [50, 10, 70, 90],
    [70, 90, 90, 10],
  ];

  const blankLogoPaths = [
    [50, 10, 50, 90],
    [50, 10, 50, 90],
    [50, 10, 50, 90],
    [50, 10, 50, 90],
  ];

  const animatePath = (
    element: SVGPathElement,
    startPath: number[],
    endPath: number[],
    duration: number,
    delay: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      setTimeout(() => {
        function animate(time: number) {
          const progress = Math.min((time - startTime) / duration, 1);
          if (progress < 1) {
            const easedProgress = easeInOutBack(progress);
            const currentPath = startPath.map(
              (start, i) => start + (endPath[i] - start) * easedProgress
            );
            element.setAttribute('d', `M${currentPath.join(' ')}`);
            requestAnimationFrame(animate);
          } else {
            element.setAttribute('d', `M${endPath.join(' ')}`);
            resolve();
          }
        }
        requestAnimationFrame(animate);
      }, delay);
    });
  };

  const easeInOutBack = (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 transition-opacity duration-500" style={{ opacity }}>
      <div ref={containerRef} className="absolute" style={{ width: initialPosition?.width, height: initialPosition?.height }}>
        <svg
          ref={logoRef}
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {wPaths.map((_, index) => (
            <path
              key={index}
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              stroke="#000000"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

