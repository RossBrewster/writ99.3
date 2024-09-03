import React, { useRef, useEffect, useState } from 'react';
import { useMenu } from '../../contexts/MenuContext';


const colors: string[] = ['#EA4335', '#34A853', '#FBBC05', '#4285F4'];

export const SideBarLogo: React.FC = () => {
  const logoRef = useRef<SVGSVGElement | null>(null);
  const [isW, setIsW] = useState<boolean>(false);
  const { toggleMenu } = useMenu();

  const scaleFactor = 1;
  const originalStrokeWidth = 18;
  const strokeWidth = originalStrokeWidth / scaleFactor;
//   const safetyMargin = 0 / scaleFactor;
  const totalMargin = strokeWidth;

  const scaleCoordinates = (paths: number[][]): number[][] => 
    paths.map(path => path.map(coord => coord / scaleFactor));

  const hamburgerPaths = scaleCoordinates([
    [10, 22, 90, 22],
    [10, 41, 90, 41],
    [10, 60, 90, 60],
    [10, 79, 90, 79],
  ]);

  const wPaths = scaleCoordinates([
    [10, 10, 30, 90],
    [30, 90, 50, 10],
    [50, 10, 70, 90],
    [70, 90, 90, 10],
  ]);

  useEffect(() => {
    if (!logoRef.current) return;
    const paths = logoRef.current.querySelectorAll('path');

    paths.forEach((path, index) => {
      animatePath(path, isW ? hamburgerPaths[index] : wPaths[index], isW ? wPaths[index] : hamburgerPaths[index], 600);
    });
  }, [isW]);

  const animatePath = (element: SVGPathElement, startPath: number[], endPath: number[], duration: number): void => {
    const startTime = performance.now();

    const animate = (time: number): void => {
      const progress = Math.min((time - startTime) / duration, 1);
      if (progress < 1) {
        const easedProgress = easeInOutBack(progress);
        const currentPath = startPath.map(
          (start, i) => start + (endPath[i] - start) * easedProgress
        );
        element.setAttribute('d', `M ${currentPath[0]} ${currentPath[1]} L ${currentPath.slice(2).join(' ')}`);
        requestAnimationFrame(animate);
      } else {
        element.setAttribute('d', `M ${endPath.join(' ')}`);
      }
    };

    requestAnimationFrame(animate);
  };

  const easeInOutBack = (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  // Calculate viewBox dimensions with extra padding
  const minX = 0 - totalMargin;
  const minY = 30 - totalMargin;
  const maxX = (100 / scaleFactor) + totalMargin;
  const maxY = (75 / scaleFactor) + totalMargin;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const handleClick = () => {
    setIsW(!isW);
    toggleMenu(); // Toggle the menu when the logo is clicked
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className="relative w-24 h-24 cursor-pointer"
        onClick={handleClick}
      >
        <svg
          ref={logoRef}
          className="w-full h-full"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          alt-text="Menu open/close icon"
        >
          {colors.map((color, index) => (
            <path
              key={index}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              stroke={color}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

