import React, { ReactElement } from "react";

export type BoardCells = Cell[][];

export type Cell = CellData | null;

export interface CellData {
  color: string;
}

interface BoardProps {
  cells: BoardCells;
  width: number;
  height: number;
  blockSize: number;
  cellSpacing: number;
}

const Board = ({
  cells,
  width,
  height,
  blockSize,
  cellSpacing,
}: BoardProps) => {
  const svgWidth = width * blockSize + (width - 1) * cellSpacing;
  const svgHeight = height * blockSize + (height - 1) * cellSpacing;

  const blocks = [] as ReactElement[];
  let y = 0;
  cells.forEach((row) => {
    let x = 0;
    row.forEach((cell) => {
      const color = cell ? cell.color : "#eee";
      blocks.push(
        <rect
          key={`${x},${y}`}
          x={x}
          y={y}
          width={blockSize}
          height={blockSize}
          fill={color}
        />
      );
      x += blockSize + cellSpacing;
    });
    y += blockSize + cellSpacing;
  });

  return (
    <svg
      preserveAspectRatio="xMinYMin meet"
      height="800px"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      {blocks}
    </svg>
  );
};

export default Board;
