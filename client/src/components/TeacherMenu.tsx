import { useState, useCallback, useRef, useEffect } from 'react';

interface ButtonData {
  text: string;
  color: string;
}

const buttons: ButtonData[] = [
  { text: 'Dashboard', color: '#EA4335' },
  { text: 'Assignments', color: '#34A853' },
  { text: 'Rubrics', color: '#FBBC05' },
  { text: 'Sign Out', color: '#4285F4' }
];

type LogoState = 'hamburger' | 'w';

type Path = [number, number, number, number];

const wPaths: Path[] = [
  [12, 12, 36, 108],
  [36, 108, 60, 12],
  [60, 12, 84, 108],
  [84, 108, 108, 12],
];

const hamburgerPaths: Path[] = [
  [12, 26.4, 108, 26.4],
  [12, 49.2, 108, 49.2],
  [12, 72, 108, 72],
  [12, 94.8, 108, 94.8],
];

const easeInOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

export function TeacherMenu(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [logoState, setLogoState] = useState<LogoState>('hamburger');
  const [isTextVisible, setIsTextVisible] = useState<boolean>(false);
  const logoRef = useRef<SVGSVGElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const animatePath = useCallback(
    (
      element: SVGPathElement,
      startPath: Path,
      endPath: Path,
      duration: number,
      delay: number
    ): Promise<void> => {
      return new Promise<void>((resolve) => {
        const startTime = performance.now();
        setTimeout(() => {
          function animate(time: number): void {
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
    []
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
  }, [logoState, animatePath]);

  const handleLogoClick = useCallback((): void => {
    setIsOpen(true);
    setLogoState('w');
  }, []);

  const handleCloseModal = useCallback((): void => {
    setIsOpen(false);
    setLogoState('hamburger');
  }, []);

  

  const handleButtonClick = useCallback((buttonText: string): void => {
    console.log(`Button clicked: ${buttonText}`);
    handleCloseModal();
  }, [handleCloseModal]);

  useEffect(() => {
    animateLogo();
    setIsTextVisible(false);
    const timer = setTimeout(() => {
      setIsTextVisible(logoState === 'w');
    }, 1000);

    return () => clearTimeout(timer);
  }, [logoState, animateLogo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleCloseModal]);

  return (
    <div className="relative">
      <button onClick={handleLogoClick} className="p-2 focus:outline-none">
        <svg
          ref={logoRef}
          className="w-12 h-12"
          viewBox="-12 -12 144 144"
          preserveAspectRatio="xMidYMid meet">
          {buttons.map((button, index) => (
            <path
              key={index}
              strokeWidth="21.6"
              strokeLinecap="round"
              fill="none"
              stroke={button.color}
            />
          ))}
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 w-full h-full">
          <div 
            ref={menuRef}
            className="absolute -top-10 left-0 right-0 w-full sm:w-80 md:w-80 lg:w-96"
          >
            <div className=" relative">
              <svg
                ref={logoRef}
                className="w-full h-full"
                viewBox="-12 -12 144 144"
                preserveAspectRatio="xMidYMid meet">
                {buttons.map((button, index) => (
                  <g
                    key={index}
                    className="cursor-pointer"
                    onClick={() => handleButtonClick(button.text)}>
                    <path
                      strokeWidth="21.6"
                      strokeLinecap="round"
                      fill="none"
                      stroke={button.color}
                    />
                    <text
                      x="60"
                      y={27 + index * 22.8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={(button.color === "#FBBC05") ? "000000" : "#FFFFFF"}
                      fontSize="12"
                      fontFamily="Arial, sans-serif"
                      className={`${
                        isTextVisible ? 'opacity-100' : 'opacity-0'
                      } transition-opacity duration-300 pointer-events-none`}>
                      {button.text}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}