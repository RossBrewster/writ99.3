import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const colors: string[] = ['#EA4335', '#34A853', '#FBBC05', '#4285F4'];

type Path = [number, number, number, number];

interface Frame {
  name: string;
  paths: Path[];
  enabled: boolean;
}

const generateSymmetricalFrames = (numFrames: number = 10): Frame[] => {
  const newFrames: Frame[] = [];
  for (let i = 0; i < numFrames; i++) {
    const paths: Path[] = [];
    for (let j = 0; j < 2; j++) {
      const x1 = Math.floor(Math.random() * 81) + 10;
      const y1 = Math.floor(Math.random() * 81) + 10;
      const x2 = Math.floor(Math.random() * 81) + 10;
      const y2 = Math.floor(Math.random() * 81) + 10;
      paths.push([x1, y1, x2, y2]);
      paths.push([100 - x1, y1, 100 - x2, y2]);
    }
    newFrames.push({
      name: `Symmetrical Frame ${i + 1}`,
      paths,
      enabled: true,
    });
  }
  return newFrames;
};

export const Animator: React.FC = () => {
  const logoRef = useRef<SVGSVGElement>(null);
  const [animationFrames, setAnimationFrames] = useState<Frame[]>([
    { 
      name: 'W', 
      paths: [[10, 10, 30, 90], [30, 90, 50, 10], [50, 10, 70, 90], [70, 90, 90, 10]], 
      enabled: true 
    }
  ]);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [newFrameName, setNewFrameName] = useState<string>('');
  const [newFramePaths, setNewFramePaths] = useState<string>('');
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [strokeWidth, setStrokeWidth] = useState<number>(18);
  const [duration, setDuration] = useState<number>(600);
  const [easingStrength, setEasingStrength] = useState<number>(1.70158);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [numSymmetricalFrames, setNumSymmetricalFrames] = useState<number>(10);
  const animationRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scaleCoordinates = (paths: Path[]): Path[] => 
    paths.map(path => path.map(coord => coord / scaleFactor) as Path);

  const animatePath = (
    element: SVGPathElement, 
    startPath: Path, 
    endPath: Path, 
    onComplete: () => void
  ): void => {
    const startTime = performance.now();

    const animate = (time: number): void => {
      const progress = Math.min((time - startTime) / duration, 1);
      if (progress < 1) {
        const easedProgress = easeInOutBack(progress);
        const currentPath = startPath.map(
          (start, i) => start + (endPath[i] - start) * easedProgress
        ) as Path;
        element.setAttribute('d', `M ${currentPath[0]} ${currentPath[1]} L ${currentPath[2]} ${currentPath[3]}`);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        element.setAttribute('d', `M ${endPath[0]} ${endPath[1]} L ${endPath[2]} ${endPath[3]}`);
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const easeInOutBack = (t: number): number => {
    const c1 = easingStrength;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  };

  const handleAnimate = (): void => {
    setIsAnimating(!isAnimating);
  };

  useEffect(() => {
    if (isAnimating) {
      animateNextFrame();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    }
  }, [isAnimating, currentFrame]);

  const animateNextFrame = (): void => {
    if (!logoRef.current || !isAnimating) return;
    const paths = logoRef.current.querySelectorAll('path');
    let nextFrame = (currentFrame + 1) % animationFrames.length;
    
    while (!animationFrames[nextFrame].enabled) {
      nextFrame = (nextFrame + 1) % animationFrames.length;
      if (nextFrame === currentFrame) {
        setIsAnimating(false);
        return;
      }
    }
    
    let completedPaths = 0;
    paths.forEach((path, index) => {
      animatePath(
        path as SVGPathElement, 
        scaleCoordinates(animationFrames[currentFrame].paths)[index],
        scaleCoordinates(animationFrames[nextFrame].paths)[index],
        () => {
          completedPaths++;
          if (completedPaths === paths.length) {
            if (animationFrames[nextFrame].name === 'W') {
              pauseTimeoutRef.current = setTimeout(() => {
                setCurrentFrame(nextFrame);
              }, 250);
            } else {
              setCurrentFrame(nextFrame);
            }
          }
        }
      );
    });
  };

  const addNewFrame = (): void => {
    if (newFrameName.trim() === '') return;
    try {
      const paths = JSON.parse(newFramePaths) as Path[];
      if (!Array.isArray(paths) || paths.length !== 4 || !paths.every(path => Array.isArray(path) && path.length === 4)) {
        throw new Error('Invalid path format');
      }
      setAnimationFrames([...animationFrames, { name: newFrameName, paths, enabled: true }]);
      setNewFrameName('');
      setNewFramePaths('');
    } catch (error) {
      alert('Invalid path format. Please enter a valid JSON array of 4 paths, each with 4 coordinates.');
    }
  };

  const updateFrame = (index: number, newPaths: string): void => {
    try {
      const paths = JSON.parse(newPaths) as Path[];
      if (!Array.isArray(paths) || paths.length !== 4 || !paths.every(path => Array.isArray(path) && path.length === 4)) {
        throw new Error('Invalid path format');
      }
      const updatedFrames = [...animationFrames];
      updatedFrames[index].paths = paths;
      setAnimationFrames(updatedFrames);
    } catch (error) {
      alert('Invalid path format. Please enter a valid JSON array of 4 paths, each with 4 coordinates.');
    }
  };

  const toggleFrameEnabled = (index: number): void => {
    const updatedFrames = [...animationFrames];
    updatedFrames[index].enabled = !updatedFrames[index].enabled;
    setAnimationFrames(updatedFrames);
  };

  const moveFrame = (index: number, direction: number): void => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === animationFrames.length - 1)) return;
    const updatedFrames = [...animationFrames];
    const frame = updatedFrames[index];
    updatedFrames.splice(index, 1);
    updatedFrames.splice(index + direction, 0, frame);
    setAnimationFrames(updatedFrames);
  };

  const deleteFrame = (index: number): void => {
    const updatedFrames = animationFrames.filter((_, i) => i !== index);
    setAnimationFrames(updatedFrames);
    if (currentFrame >= index && currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  };

  const handleGenerateSymmetricalFrames = () => {
    const newFrames = generateSymmetricalFrames(numSymmetricalFrames);
    setAnimationFrames(prevFrames => [...prevFrames, ...newFrames]);
  };

  const totalMargin = strokeWidth / scaleFactor;
  const minX = 0 - totalMargin;
  const minY = 0 - totalMargin;
  const maxX = (100 / scaleFactor) + totalMargin;
  const maxY = (100 / scaleFactor) + totalMargin;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <svg
          ref={logoRef}
          className="w-64 h-64 mx-auto"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {colors.map((color, index) => (
            <path
              key={index}
              strokeWidth={strokeWidth / scaleFactor}
              strokeLinecap="round"
              fill="none"
              stroke={color}
            />
          ))}
        </svg>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="scaleFactor">Scale Factor</Label>
          <Input
            id="scaleFactor"
            type="number"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="strokeWidth">Stroke Width</Label>
          <Input
            id="strokeWidth"
            type="number"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (ms)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="easingStrength">Easing Strength</Label>
          <Input
            id="easingStrength"
            type="number"
            step="0.1"
            value={easingStrength}
            onChange={(e) => setEasingStrength(Number(e.target.value))}
          />
        </div>
      </div>
      
      <Button onClick={handleAnimate} className="w-full mb-4">
        {isAnimating ? 'Stop Animation' : 'Start Animation'}
      </Button>
      
      <div className="mb-4">
        <Label htmlFor="newFrame">New Frame Name</Label>
        <Input
          id="newFrame"
          value={newFrameName}
          onChange={(e) => setNewFrameName(e.target.value)}
          className="mb-2"
        />
        <Label htmlFor="newFramePaths">New Frame Paths (JSON format)</Label>
        <Textarea
          id="newFramePaths"
          value={newFramePaths}
          onChange={(e) => setNewFramePaths(e.target.value)}
          className="mb-2"
          placeholder="[[x1,y1,x2,y2],[x1,y1,x2,y2],[x1,y1,x2,y2],[x1,y1,x2,y2]]"
        />
        <Button onClick={addNewFrame}>Add Frame</Button>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="numSymmetricalFrames">Number of Symmetrical Frames</Label>
        <Input
          id="numSymmetricalFrames"
          type="number"
          value={numSymmetricalFrames}
          onChange={(e) => setNumSymmetricalFrames(Number(e.target.value))}
          className="mb-2"
        />
        <Button onClick={handleGenerateSymmetricalFrames}>Generate Symmetrical Frames</Button>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Animation Frames:</h3>
        {animationFrames.map((frame, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{frame.name} {index === currentFrame && '(Current)'}</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`frame-${index}-enabled`}
                  checked={frame.enabled}
                  onCheckedChange={() => toggleFrameEnabled(index)}
                />
                <Label htmlFor={`frame-${index}-enabled`}>Enabled</Label>
                <Button onClick={() => moveFrame(index, -1)} disabled={index === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button onClick={() => moveFrame(index, 1)} disabled={index === animationFrames.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => deleteFrame(index)}
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  disabled={animationFrames.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={JSON.stringify(frame.paths)}
              onChange={(e) => updateFrame(index, e.target.value)}
              className="mb-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};