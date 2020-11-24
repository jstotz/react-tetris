export type PieceShape = "J" | "T" | "L" | "I" | "S" | "Z" | "O";

export type CellEmpty = {
  type: "empty";
};

export type CellPreview = {
  type: "preview";
};

export type CellPiece = {
  type: "piece";
  shape: PieceShape;
};

export type Cell = CellEmpty | CellPreview | CellPiece;

export type Grid = Cell[][];

export interface BoardData {
  width: number;
  height: number;
  grid: Grid;
}

export interface Piece {
  x: number;
  y: number;
  shape: PieceShape;
  grid: Grid;
  preview: boolean;
}

export const rotateGrid = (grid: Grid): Grid => {
  return grid.map((row, i) =>
    row.map((val, j) => grid[grid.length - 1 - j][i])
  );
};
