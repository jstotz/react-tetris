import React, { ReactElement } from "react";

export type CellType = "empty" | "piece" | "preview";

export interface Cell {
  type: CellType;
  color: string;
}

export type BoardCells = Cell[][];

interface BoardProps {
  board: BoardCells;
  width: number;
  height: number;
  blockSize: number;
  cellSpacing: number;
}

const Board = ({
  board,
  width,
  height,
  blockSize,
  cellSpacing,
}: BoardProps) => {
  const svgWidth = width * blockSize + (width - 1) * cellSpacing;
  const svgHeight = height * blockSize + (height - 1) * cellSpacing;

  const blocks = [] as ReactElement[];
  let y = 0;
  board.forEach((row) => {
    let x = 0;
    row.forEach((cell) => {
      blocks.push(
        <rect
          key={`${x},${y}`}
          x={x}
          y={y}
          width={blockSize}
          height={blockSize}
          fill={cell.color}
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
