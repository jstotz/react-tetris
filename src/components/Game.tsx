import { useHotkey } from "@react-hook/hotkey";
import produce from "immer";
import { random, times } from "lodash";
import randomColor from "randomcolor";
import React, { ReactElement, useMemo, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import {
  BoardData,
  Cell,
  Grid,
  Piece,
  PieceShape,
  rotateGrid,
} from "../lib/core";
import PIECES from "../lib/pieces";
import { LIGHT_THEME, ThemeContext } from "../ThemeContext";
import Board from "./Board";

const PIECE_COLORS = new Map<PieceShape, string>();
PIECES.forEach((piece) =>
  PIECE_COLORS.set(piece.shape, randomColor({ luminosity: "bright" }))
);

const BOARD_WIDTH = 10; // blocks
const BOARD_HEIGHT = 20; // blocks
const DROP_INTERVAL = 800; // ms

export function gridToString(grid: Grid): string {
  return grid
    .map((row) =>
      row
        .map((cell) => {
          switch (cell.type) {
            case "piece":
              return cell.shape;
            case "empty":
              return "#";
            case "preview":
              return "P";
            default:
              throw new Error("unexpected cell type");
          }
        })
        .join("")
    )
    .join("\n");
}

export function logGrid(grid: Grid): void {
  console.log(gridToString(grid));
}

function emptyRow(width: number): Cell[] {
  return times(width, () => ({ type: "empty", color: "#eee" }));
}

function emptyGrid(width: number, height: number): Grid {
  return times(height, () => emptyRow(width));
}

function emptyBoard(width: number, height: number): BoardData {
  return {
    width: width,
    height: height,
    grid: emptyGrid(width, height),
  };
}

function makePiece(values: Partial<Piece> = {}): Piece {
  const basePiece = PIECES[random(0, PIECES.length - 1)];
  return {
    ...basePiece,
    ...values,
  };
}

function makePieceDropPreview(piece: Piece, board: BoardData): Piece {
  const previewPiece = { ...piece, color: "#ddd", preview: true };
  return movePieceToBottom(previewPiece, board);
}

function cellOccupied(cell: Cell): boolean {
  return cell.type === "piece";
}

// Returns copy of the given board with completed rows removed
function removeCompletedRows(board: BoardData): BoardData {
  let result = board.grid.filter((row) => !row.every(cellOccupied));
  if (result.length < board.height) {
    const newEmptyRows = times(board.height - result.length, emptyRow);
    result = newEmptyRows.concat(result);
  }
  return { ...board, grid: result };
}

function boardPositionWithinBounds(
  x: number,
  y: number,
  board: BoardData
): boolean {
  return x > 0 && x < board.width && y > 0 && y < board.height;
}

function boardPositionValid(x: number, y: number, board: BoardData): boolean {
  try {
    return (
      boardPositionWithinBounds(x, y, board) && !cellOccupied(board.grid[y][x])
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function piecePositionValid(piece: Piece, board: BoardData): boolean {
  for (let yOffset = 0; yOffset < piece.grid.length; yOffset++) {
    for (let xOffset = 0; xOffset < piece.grid[yOffset].length; xOffset++) {
      const [x, y] = [xOffset + piece.x, yOffset + piece.y];
      const cell = piece.grid[yOffset][xOffset];
      const blockIsVisible = cell.type !== "empty";
      if (!blockIsVisible) {
        continue;
      }
      if (!boardPositionValid(x, y, board)) {
        return false;
      }
    }
  }
  return true;
}

// Returns a copy of the given board with the piece rendered into it
function boardWithPiece(board: BoardData, piece: Piece): BoardData {
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
        if (boardPositionValid(x, y, board)) {
          newBoard.grid[y][x] = cell;
        }
      });
    });
  });
}

// Returns a new board with the piece rendered in the given position.
// Removes any completed rows. If new piece position is invalid, returns false.
function makeBoard(piece: Piece, board: BoardData): BoardData {
  return boardWithPiece(removeCompletedRows(board), piece);
}

const movePieceToBottom = (piece: Piece, board: BoardData) => {
  while (true) {
    let newPiece = { ...piece, y: piece.y + 1 };
    if (piecePositionValid(newPiece, board)) {
      piece = newPiece;
    } else {
      return piece;
    }
  }
};
const movePieceLeft = (piece: Piece) => ({ ...piece, x: piece.x - 1 });
const movePieceRight = (piece: Piece) => ({ ...piece, x: piece.x + 1 });
const movePieceDown = (piece: Piece) => ({ ...piece, y: piece.y + 1 });
const rotatePiece = (piece: Piece) => ({
  ...piece,
  grid: rotateGrid(piece.grid),
});

interface GameState {
  piece: Piece;
  nextPiece: Piece;
  paused: boolean;
  gameOver: boolean;
  baseBoard: BoardData;
}

function Game(): ReactElement {
  const initialBoard = useMemo(() => emptyBoard(BOARD_WIDTH, BOARD_HEIGHT), []);
  const initialPiece = useMemo(() => makePiece({ x: 4 }), []);
  const initialNextPiece = useMemo(makePiece, [makePiece]);

  const [
    { gameOver, paused, piece, nextPiece, baseBoard },
    setState,
  ] = useState<GameState>({
    piece: initialPiece,
    nextPiece: initialNextPiece,
    gameOver: false,
    paused: false,
    baseBoard: initialBoard,
  });

  const canMovePiece = (state: GameState): boolean =>
    state.piece !== null && !state.paused && !state.gameOver;

  const movePieceIfValid = (
    moveFn: (piece: Piece, board: BoardData) => Piece
  ) => {
    setState((state) => {
      if (!canMovePiece(state)) {
        return state;
      }
      const newPiece = moveFn(state.piece, state.baseBoard);
      if (!piecePositionValid(newPiece, state.baseBoard)) {
        return state;
      }
      return { ...state, piece: newPiece };
    });
  };

  useHotkey(window, "up", () => movePieceIfValid(rotatePiece));
  useHotkey(window, "down", () => movePieceIfValid(movePieceDown));
  useHotkey(window, "left", () => movePieceIfValid(movePieceLeft));
  useHotkey(window, "right", () => movePieceIfValid(movePieceRight));
  useHotkey(window, "space", () => movePieceIfValid(movePieceToBottom));
  useHotkey(window, "p", () =>
    setState((state) => ({ ...state, paused: !state.paused }))
  );

  useInterval(() => {
    setState((state) => {
      if (!canMovePiece(state)) {
        return state;
      }

      const { baseBoard } = state;

      // Attempt to move the current piece down
      let piece = movePieceDown(state.piece);
      if (piecePositionValid(piece, baseBoard)) {
        return { ...state, piece };
      }

      // Couldn't move existing piece down so attempt to add a new piece
      piece = state.nextPiece;
      if (!piecePositionValid(piece, baseBoard)) {
        return { ...state, piece, gameOver: true };
      }

      return {
        ...state,
        piece,
        nextPiece: makePiece(),
        baseBoard: makeBoard(state.piece, baseBoard),
      };
    });
  }, DROP_INTERVAL);

  const pieceDropPreview = makePieceDropPreview(piece, baseBoard);
  const board = makeBoard(pieceDropPreview, makeBoard(piece, baseBoard));
  const nextPiecePreviewBoard = makeBoard(nextPiece, {
    width: 10,
    height: 10,
    grid: emptyGrid(10, 10),
  });

  return (
    <ThemeContext.Provider value={LIGHT_THEME}>
      <div>
        <div>{paused ? "Paused" : "Press P to pause"}</div>
        <div>{gameOver ? "GAME OVER, MAN! GAME OVER!" : ""}</div>
        <div>
          <Board board={board} />
          <Board board={nextPiecePreviewBoard} />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default Game;
