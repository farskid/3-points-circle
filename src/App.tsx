import React, { ReactNode, useRef, useState } from 'react';
import './App.css';

interface Point {
  x: number;
  y: number;
}

interface Circle {
  center: Point;
  radius: number;
}

function calculateCircleFrom3Points(
  p1: Point,
  p2: Point,
  p3: Point
): Circle | null {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { x: x3, y: y3 } = p3;

  const det = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
  if (Math.abs(det) < 1e-10) {
    return null; // Avoid floating-point inaccuracies for collinear points
  }

  const midAB = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  const midBC = { x: (x2 + x3) / 2, y: (y2 + y3) / 2 };

  const slopeAB = x2 - x1 === 0 ? Infinity : (y2 - y1) / (x2 - x1);
  const slopeBC = x3 - x2 === 0 ? Infinity : (y3 - y2) / (x3 - x2);

  const perpSlopeAB =
    slopeAB === 0 ? Infinity : slopeAB === Infinity ? 0 : -1 / slopeAB;
  const perpSlopeBC =
    slopeBC === 0 ? Infinity : slopeBC === Infinity ? 0 : -1 / slopeBC;

  let centerX: number, centerY: number;
  if (perpSlopeAB === Infinity) {
    centerX = midAB.x;
    centerY = perpSlopeBC * (centerX - midBC.x) + midBC.y;
  } else if (perpSlopeBC === Infinity) {
    centerX = midBC.x;
    centerY = perpSlopeAB * (centerX - midAB.x) + midAB.y;
  } else {
    const a1 = perpSlopeAB;
    const b1 = midAB.y - a1 * midAB.x;

    const a2 = perpSlopeBC;
    const b2 = midBC.y - a2 * midBC.x;

    centerX = (b2 - b1) / (a1 - a2);
    centerY = a1 * centerX + b1;
  }

  const radius = Math.sqrt((centerX - x1) ** 2 + (centerY - y1) ** 2);

  return { center: { x: centerX, y: centerY }, radius };
}

export const InfiniteCanvas: React.FC = () => {
  const [state, setState] = useState<{
    points: Point[];
    circle: Circle | null;
  }>({
    points: [],
    circle: null,
  });
  const svgRef = useRef<SVGSVGElement>(null!);

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current.getBoundingClientRect();
    const newPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    if (state.points.find((p) => p.x === newPoint.x && p.y === newPoint.y)) {
      alert("Two points can't be exactly the same");
      return;
    }

    if (state.circle) {
      // The first point of a new circle sequence is being added
      setState({
        points: [newPoint],
        circle: null,
      });
    } else {
      const updatedPoints = [...state.points, newPoint];
      setState({
        points: updatedPoints,
        circle:
          updatedPoints.length === 3
            ? calculateCircleFrom3Points(
                updatedPoints[0],
                updatedPoints[1],
                updatedPoints[2]
              )
            : null,
      });
    }
  };

  const renderGrid = () => {
    const gridSize = 50;
    const lines = [];

    for (let i = 0; i < window.innerWidth; i += gridSize) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i}
          y1={0}
          x2={i}
          y2={window.innerHeight}
          stroke="#ddd"
        />
      );
    }

    for (let i = 0; i < window.innerHeight; i += gridSize) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i}
          x2={window.innerWidth}
          y2={i}
          stroke="#ddd"
        />
      );
    }

    return lines;
  };

  return (
    <>
      <svg
        style={{ backgroundColor: '#f9f9f9', cursor: 'pointer' }}
        onClick={handleCanvasClick}
        ref={svgRef}
      >
        {renderGrid()}

        {state.points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={5} fill="red" />
        ))}

        {state.circle && (
          <circle
            cx={state.circle.center.x}
            cy={state.circle.center.y}
            r={state.circle.radius}
            stroke="blue"
            fill="none"
          />
        )}
      </svg>
      <Toast>
        {!state.circle
          ? `Pick ${
              3 - state.points.length
            } points on the canvas for the circle to be drawn`
          : 'Pick a new point to draw another circle'}
      </Toast>
    </>
  );
};

function Toast({ children }: { children: ReactNode }) {
  return <div className="toast">{children}</div>;
}
