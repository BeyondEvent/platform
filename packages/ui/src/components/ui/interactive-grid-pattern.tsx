import type React from 'react';
import { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';

interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number];
  className?: string;
  squaresClassName?: string;
}

export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares,
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const horizontal = squares ? squares[0] : Math.ceil(dimensions.width / width) + 1;
  const vertical = squares ? squares[1] : Math.ceil(dimensions.height / height) + 1;
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);

  return (
    <svg
      width="100%"
      height="100%"
      className={cn('absolute inset-0 h-full w-full', className)}
      {...props}
    >
      <title>Interactive Grid Pattern</title>
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        const id = `${x}-${y}`;
        return (
          <rect
            key={id}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              'stroke-gray-400/30 transition-all duration-100 ease-in-out not-[&:hover]:duration-1000',
              hoveredSquare === index ? 'fill-gray-300/30' : 'fill-transparent',
              squaresClassName,
            )}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}
