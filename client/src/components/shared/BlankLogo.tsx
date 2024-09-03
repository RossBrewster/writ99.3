import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useSpring, animated } from 'react-spring';

interface LogoProps {
  buttons: { color: string }[];
}

export const Logo: React.FC<LogoProps> = ({ buttons }) => {
  const logoRef = useRef<SVGSVGElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const wPaths = useMemo(
    () => [
      [10, 10, 30, 90],
      [30, 90, 50, 10],
      [50, 10, 70, 90],
      [70, 90, 90, 10],
    ],
    []
  );
  const hamburgerPaths = useMemo(
    () => [
      [10, 22, 90, 22],
      [10, 41, 90, 41],
      [10, 60, 90, 60],
      [10, 79, 90, 79],
    ],
    []
  );

  const { scale } = useSpring({
    from: { scale: 2.5 },
    to: async (next) => {
      if (!hasAnimated) {
        await next({ scale: 1.5 });
        await new Promise(resolve => setTimeout(resolve, 0)); // Adjust timing as needed
        await next({ scale: 0.75 });
        setHasAnimated(true);
      }
    },
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    if (!logoRef.current || hasAnimated) return;
    const paths = logoRef.current.querySelectorAll('path');

    paths.forEach((path, index) => {
      animatePath(path, hamburgerPaths[index], wPaths[index], 800, index * 50);
    });
  }, [hasAnimated]);

  const animatePath = (
    element: SVGPathElement,
    startPath: number[],
    endPath: number[],
    duration: number,
    delay: number
  ): void => {
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
        }
      }
      requestAnimationFrame(animate);
    }, delay);
  };

  const easeInOutBack = (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  return (
    <div className="flex items-center justify-center m-20">
      <animated.div style={{ scale }}>
        <svg
          ref={logoRef}
          className="w-full h-full"
          viewBox="-10 -10 120 120"
          preserveAspectRatio="xMidYMid meet">
          {buttons.map((button, index) => (
            <g key={index} className="leg">
              <path
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
                stroke={button.color}
              />
            </g>
          ))}
        </svg>
      </animated.div>
    </div>
  );
};