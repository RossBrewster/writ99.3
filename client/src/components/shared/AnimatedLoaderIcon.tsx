import React, { useRef, useEffect, useState } from 'react';

type Frame = [number, number, number, number];
type Frames = Frame[];

const frames: Frames[] = [
  [[10,10,30,90],[30,90,50,10],[50,10,70,90],[70,90,90,10]],
  [[50,50,10,10],[50,50,10,90],[90,90,50,50],[90,10,50,50]],
  [[90,10,50,50],[50,50,10,10],[50,50,10,90],[90,90,50,50]],
  [[90,90,50,50],[90,10,50,50],[50,50,10,10],[50,50,10,90]],
  [[50,50,10,90],[90,90,50,50],[90,10,50,50],[50,50,10,10]]
];

const colors: string[] = ['#EA4335', '#34A853', '#FBBC05', '#4285F4'];

const SmoothAnimatedLoader: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const duration: number = 350; // Duration for each frame transition in ms
  const easingStrength: number = 0.1; // Easing strength, same as in the original file

  // New variables for viewBox calculation
  const strokeWidth: number = 18;
  const scaleFactor: number = 1; // Adjust this if you want to scale the entire SVG
  const totalMargin = strokeWidth / scaleFactor;
  const minX = 0 - totalMargin;
  const minY = 0 - totalMargin;
  const maxX = (100 / scaleFactor) + totalMargin;
  const maxY = (100 / scaleFactor) + totalMargin;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const easeInOutBack = (t: number): number => {
    const c1 = easingStrength;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  const animateFrame = (time: number): void => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutBack(progress);

    const nextFrame = (currentFrame + 1) % frames.length;
    const currentPaths = frames[currentFrame];
    const nextPaths = frames[nextFrame];

    const paths = svgRef.current?.querySelectorAll('path');
    paths?.forEach((path, index) => {
      const currentPath = currentPaths[index];
      const nextPath = nextPaths[index];
      const interpolatedPath = currentPath.map((start, i) => 
        start + (nextPath[i] - start) * easedProgress
      );
      path.setAttribute('d', `M ${interpolatedPath[0]} ${interpolatedPath[1]} L ${interpolatedPath[2]} ${interpolatedPath[3]}`);
    });

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateFrame);
    } else {
      setCurrentFrame(nextFrame);
      startTimeRef.current = null;
    }
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentFrame]);

  return (
    <div className="flex justify-center items-center">
      <svg ref={svgRef} width="100" height="100" viewBox={viewBox}>
        {frames[currentFrame].map((_, index) => (
          <path
            key={index}
            stroke={colors[index]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
};

export default SmoothAnimatedLoader;