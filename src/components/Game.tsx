import { useHotkey } from "@react-hook/hotkey";
import produce from "immer";
import { random, times } from "lodash";
import randomColor from "randomcolor";
import React, { ReactElement, useMemo, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import { useLocalStorage } from "../hooks/useLocalStorage";
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
    const newEmptyRows = times(board.height - result.length, () =>
      emptyRow(board.width)
    );
    result = newEmptyRows.concat(result);
  }
  return { ...board, grid: result };
}

function boardPositionWithinBounds(
  x: number,
  y: number,
  board: BoardData
): boolean {
  return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

function boardPositionValid(x: number, y: number, board: BoardData): boolean {
  try {
    return (
      boardPositionWithinBounds(x, y, board) && !cellOccupied(board.grid[y][x])
    );
  } catch (e) {
    debugger;
    throw e;
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
function renderPiece(piece: Piece, board: BoardData): BoardData {
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
        } else {
          console.log("skipping invalid cell position", cell, x, y);
        }
      });
    });
  });
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
  const defaultInitialGameState = {
    piece: initialPiece,
    nextPiece: initialNextPiece,
    gameOver: false,
    paused: false,
    baseBoard: initialBoard,
  };

  const [initialGameState, setSavedGameState] = useLocalStorage(
    "gameState",
    defaultInitialGameState
  );

  const [gameState, setState] = useState<GameState>(initialGameState);
  const { gameOver, paused, piece, nextPiece, baseBoard } = gameState;

  const saveGameState = () => setSavedGameState(gameState);
  const resetSavedGameState = () => setSavedGameState(null);

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
  useHotkey(window, "space", () => {
    setState((state) => {
      if (!canMovePiece(state)) {
        return state;
      }
      const newPiece = movePieceToBottom(state.piece, state.baseBoard);
      if (!piecePositionValid(newPiece, state.baseBoard)) {
        return state;
      }
      return tick({ ...state, piece: newPiece });
    });
  });
  useHotkey(window, "p", () =>
    setState((state) => ({ ...state, paused: !state.paused }))
  );
  useHotkey(window, "s", saveGameState);
  useHotkey(window, "r", resetSavedGameState);

  const tick = (state: GameState) => {
    if (!canMovePiece(state)) {
      return state;
    }

    let { baseBoard } = state;

    // Attempt to move the current piece down
    let piece = movePieceDown(state.piece);
    if (piecePositionValid(piece, baseBoard)) {
      return { ...state, piece };
    }

    // Couldn't move existing piece down so freeze it, clear any completed rows
    // and attempt to add a new piece
    piece = state.nextPiece;
    baseBoard = removeCompletedRows(renderPiece(state.piece, baseBoard));

    // If the next piece can't be placed, the game is over
    if (!piecePositionValid(piece, baseBoard)) {
      return { ...state, piece, baseBoard, gameOver: true };
    }

    return {
      ...state,
      piece,
      nextPiece: makePiece(),
      baseBoard: baseBoard,
    };
  };

  // Auto-piece drop interval
  useInterval(() => setState(tick), DROP_INTERVAL);

  const pieceDropPreview = makePieceDropPreview(piece, baseBoard);
  const board = renderPiece(pieceDropPreview, renderPiece(piece, baseBoard));
  const nextPiecePreviewBoard = renderPiece(nextPiece, {
    width: 10,
    height: 10,
    grid: emptyGrid(10, 10),
  });

  return (
    <ThemeContext.Provider value={LIGHT_THEME}>
      <>
        <div style={{ height: "5%" }}>
          <button onClick={saveGameState}>Save Initial Game State</button>
          <button onClick={resetSavedGameState}>
            Reset Initial Game State
          </button>
          <div>{paused ? "Paused" : "Press P to pause"}</div>
          <div>{gameOver ? "GAME OVER, MAN! GAME OVER!" : ""}</div>
        </div>
        <div style={{ height: "95%" }}>
          <Board board={board} />
          {/* <Board board={nextPiecePreviewBoard} /> */}
        </div>
      </>
    </ThemeContext.Provider>
  );
}

export default Game;
