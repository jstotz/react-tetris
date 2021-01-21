import produce from "immer";
import random from "lodash/random";
import times from "lodash/times";
import PIECES from "./pieces";

export type PieceShape = "J" | "T" | "L" | "I" | "S" | "Z" | "O";

type CellEmpty = {
  type: "empty";
};

type CellPreview = {
  type: "preview";
};

type CellPiece = {
  type: "piece";
  shape: PieceShape;
};

type Cell = CellEmpty | CellPreview | CellPiece;

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

function newEmptyRow(width: number): Cell[] {
  return times(width, () => ({ type: "empty" }));
}

function newEmptyGrid(width: number, height: number): Grid {
  return times(height, () => newEmptyRow(width));
}

export function newEmptyBoard(width: number, height: number): BoardData {
  return {
    width: width,
    height: height,
    grid: newEmptyGrid(width, height),
  };
}

export function newRandomPiece(): Piece {
  return {
    ...PIECES[random(0, PIECES.length - 1)],
  };
}

export function centerPiece(
  piece: Piece,
  board: BoardData,
  {
    horizontally = false,
    vertically = false,
  }: { horizontally?: boolean; vertically?: boolean }
): Piece {
  const x = horizontally
    ? Math.floor((board.width - piece.grid[0].length) / 2)
    : piece.x;
  const y = vertically
    ? Math.floor((board.height - piece.grid.length) / 2)
    : piece.x;
  return { ...piece, x: x, y: y };
}

function newPieceDropPreview(piece: Piece, board: BoardData): Piece {
  const previewPiece = { ...piece, color: "#ddd", preview: true };
  return movePieceToBottom(previewPiece, board);
}

function cellIsOccupied(cell: Cell): boolean {
  return cell.type === "piece";
}

// Returns copy of the given board with completed rows removed
export function removeCompletedRows(
  board: BoardData
): { board: BoardData; completedRowCount: number } {
  let newGrid = board.grid.filter((row) => !row.every(cellIsOccupied));
  let completedRowCount = board.height - newGrid.length;
  if (completedRowCount > 0) {
    const newEmptyRows = times(board.height - newGrid.length, () =>
      newEmptyRow(board.width)
    );
    newGrid = newEmptyRows.concat(newGrid);
  }
  return { board: { ...board, grid: newGrid }, completedRowCount };
}

function boardPositionIsWithinBounds(
  x: number,
  y: number,
  board: BoardData
): boolean {
  return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

function boardPositionIsValid(x: number, y: number, board: BoardData): boolean {
  return (
    boardPositionIsWithinBounds(x, y, board) &&
    !cellIsOccupied(board.grid[y][x])
  );
}

export function piecePositionIsValid(piece: Piece, board: BoardData): boolean {
  for (let yOffset = 0; yOffset < piece.grid.length; yOffset++) {
    for (let xOffset = 0; xOffset < piece.grid[yOffset].length; xOffset++) {
      const [x, y] = [xOffset + piece.x, yOffset + piece.y];
      const cell = piece.grid[yOffset][xOffset];
      const blockIsVisible = cell.type !== "empty";
      if (!blockIsVisible) {
        continue;
      }
      if (!boardPositionIsValid(x, y, board)) {
        return false;
      }
    }
  }
  return true;
}

// Returns a copy of the board with the piece rendered into it
export function renderPiece(piece: Piece, board: BoardData): BoardData {
  return produce(board, (newBoard) => {
    piece.grid.forEach((row, yOffset) => {
      row.forEach((pieceCell, xOffset) => {
        if (pieceCell.type === "empty") return;
        const cell: Cell = {
          type: piece.preview ? "preview" : "piece",
          shape: piece.shape,
        };
        const x = piece.x + xOffset;
        const y = piece.y + yOffset;
        if (boardPositionIsValid(x, y, board)) {
          newBoard.grid[y][x] = cell;
        }
      });
    });
  });
}

// Returns a copy of the board with the piece and a piece drop preview
// rendered into it
export function renderPieceWithDropPreview(
  piece: Piece,
  board: BoardData
): BoardData {
  return renderPiece(
    newPieceDropPreview(piece, board),
    renderPiece(piece, board)
  );
}

export const movePieceToBottom = (piece: Piece, board: BoardData) => {
  while (true) {
    let newPiece = { ...piece, y: piece.y + 1 };
    if (piecePositionIsValid(newPiece, board)) {
      piece = newPiece;
    } else {
      return piece;
    }
  }
};

export const movePieceLeft = (piece: Piece) => ({ ...piece, x: piece.x - 1 });

export const movePieceRight = (piece: Piece) => ({ ...piece, x: piece.x + 1 });

export const movePieceDown = (piece: Piece) => ({ ...piece, y: piece.y + 1 });

export const rotatePiece = (piece: Piece) => ({
  ...piece,
  grid: rotateGrid(piece.grid),
});

export function calculateScore(completedRowCount: number): number {
  switch (completedRowCount) {
    case 0:
      return 0;
    case 1:
      return 40;
    case 2:
      return 100;
    case 3:
      return 300;
    case 4:
      return 1200;
    default:
      throw new Error(`unexpected completed row count ${completedRowCount}`);
  }
}
