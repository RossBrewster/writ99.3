import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { ButtonData } from '../../types/types';

interface LogoProps {
  onButtonClick: (buttonText: string) => void;
  buttons: ButtonData[];
}

export const Logo: React.FC<LogoProps> = ({ onButtonClick, buttons }) => {
  const logoRef = useRef<SVGSVGElement>(null);
  const [logoState, setLogoState] = useState<'w' | 'hamburger'>('hamburger');
  const [isTextVisible, setIsTextVisible] = useState(false);

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

  const easeInOutBack = useCallback((t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  }, []);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoState((prevState) => (prevState === 'w' ? 'hamburger' : 'w'));
  }, []);

  const handleButtonClick = useCallback(
    (buttonText: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onButtonClick(buttonText);
    },
    [onButtonClick]
  );

  const animatePath = useCallback(
    (
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
    },
    [easeInOutBack]
  );

  const animateLogo = useCallback(() => {
    if (!logoRef.current) return;
    const paths = logoRef.current.querySelectorAll('path');
    const startPaths = logoState === 'w' ? wPaths : hamburgerPaths;
    const endPaths = logoState === 'w' ? hamburgerPaths : wPaths;

    const animations = Array.from(paths).map((path, index) =>
      animatePath(path, startPaths[index], endPaths[index], 800, index * 50)
    );

    Promise.all(animations);
  }, [logoState, wPaths, hamburgerPaths, animatePath]);

  useEffect(() => {
    animateLogo();
    setIsTextVisible(false);
    const timer = setTimeout(() => {
      setIsTextVisible(logoState === 'w');
    }, 1000);

    return () => clearTimeout(timer);
  }, [logoState, animateLogo]);

  return (
    <div className="w-full max-w-md mx-auto cursor-pointer flex items-center justify-center mt-8 sm:mt-16 md:mt-24 lg:mt-32">
      <svg
        ref={logoRef}
        className="w-full h-auto"
        viewBox="-10 -10 120 120"
        preserveAspectRatio="xMidYMid meet">
        {buttons.map((button, index) => (
          <g
            key={index}
            className="leg cursor-pointer"
            onClick={(e) =>
              logoState === 'hamburger'
                ? handleLogoClick(e)
                : handleButtonClick(button.text, e)
            }>
            <path
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
              stroke={button.color}
            />
            <text
              x="50"
              y={22.5 + index * 19}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={button.text === 'Sign Up' ? '#000000' : '#ffffff'}
              fontSize="10"
              fontFamily="Arial, sans-serif"
              className={`button-text ${
                isTextVisible ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-300 pointer-events-none`}>
              {button.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};