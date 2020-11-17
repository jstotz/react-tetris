import { useHotkey } from "@react-hook/hotkey";
import produce from "immer";
import { defaults, random, times } from "lodash";
import randomColor from "randomcolor";
import React, { ReactElement, useMemo, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import PIECES, { PieceBlocks } from "../pieces";
import Board, { Cell } from "./Board";

const PIECE_COLORS = randomColor({
  count: PIECES.length,
  luminosity: "bright",
});
const BOARD_WIDTH = 10; // blocks
const BOARD_HEIGHT = 20; // blocks
const BLOCK_SIZE = 10;
const CELL_SPACING = 1;
const DROP_INTERVAL = 800; // ms

export interface BoardData {
  width: number;
  height: number;
  grid: Cell[][];
}

interface Piece {
  x: number;
  y: number;
  type: number;
  rotationIndex: number;
  blocks: PieceBlocks;
  color: string;
  preview: boolean;
}

export function logBoard(board: BoardData): void {
  const rowText = board.grid.map((row) =>
    row.map((cell) => (cell ? "■" : "□")).join(" ")
  );
  console.log(rowText.join("\n"));
}

export function logPiece(piece: Piece): void {
  const rowText = piece.blocks.map((row) =>
    row.map((cell) => (cell ? "■" : "□")).join(" ")
  );
  console.log(rowText.join("\n"));
}

function emptyRow(width: number): Cell[] {
  return times(BOARD_WIDTH, () => ({ type: "empty", color: "#eee" }));
}

function emptyGrid(width: number, height: number): Cell[][] {
  return times(height, () => emptyRow(width));
}

function emptyBoard(width: number, height: number): BoardData {
  return {
    width: width,
    height: height,
    grid: emptyGrid(width, height),
  };
}

function makePiece(): Piece {
  const type = random(0, PIECES.length - 1);
  return {
    x: 4,
    y: 0,
    type,
    rotationIndex: 0,
    blocks: PIECES[type][0],
    color: PIECE_COLORS[type],
    preview: false,
  };
}

function makePieceDropPreview(piece: Piece, board: BoardData): Piece {
  const previewPiece = { ...piece, color: "#ddd", preview: true };
  return movePieceToBottom(previewPiece, board);
}

interface PieceDeltas {
  x?: number;
  y?: number;
  rotationIndex?: number;
}

function updatePiece(prevPiece: Piece, specifiedDeltas: PieceDeltas): Piece {
  const deltas = defaults(specifiedDeltas, { x: 0, y: 0, rotationIndex: 0 });
  let newRotationIndex = prevPiece.rotationIndex + deltas.rotationIndex;
  if (newRotationIndex > 3) {
    newRotationIndex = 0;
  }
  if (newRotationIndex < 0) {
    newRotationIndex = 3;
  }
  const newPiece = {
    ...prevPiece,
    rotationIndex: newRotationIndex,
    blocks: PIECES[prevPiece.type][newRotationIndex],
    x: prevPiece.x + deltas.x,
    y: prevPiece.y + deltas.y,
  };
  return newPiece;
}

function cellOccupied(cell: Cell): boolean {
  return cell.type === "piece";
}

// Returns copy of the given board with completed rows removed
function removeCompletedRows(board: BoardData): BoardData {
  let result = board.grid.filter((row) => !row.every(cellOccupied));
  if (result.length < BOARD_HEIGHT) {
    const newEmptyRows = times(BOARD_HEIGHT - result.length, emptyRow);
    result = newEmptyRows.concat(result);
  }
  return { ...board, grid: result };
}

function blockPositionValid(x: number, y: number, board: BoardData): boolean {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
    return false;
  }
  if (cellOccupied(board.grid[y][x])) {
    return false;
  }
  return true;
}

function piecePositionValid(piece: Piece, board: BoardData): boolean {
  for (let yOffset = 0; yOffset < piece.blocks.length; yOffset++) {
    for (let xOffset = 0; xOffset < piece.blocks[yOffset].length; xOffset++) {
      const [x, y] = [xOffset + piece.x, yOffset + piece.y];
      const blockIsVisible = piece.blocks[yOffset][xOffset] === 1;
      if (!blockIsVisible) {
        continue;
      }
      if (!blockPositionValid(x, y, board)) {
        return false;
      }
    }
  }
  return true;
}

// Returns a copy of the given board with the piece rendered into it
function boardWithPiece(board: BoardData, piece: Piece): BoardData {
  return produce(board, (newBoard) => {
    piece.blocks.forEach((row, yOffset) => {
      row.forEach((blockIsVisible, xOffset) => {
        if (!blockIsVisible) return;
        const cell: Cell = {
          color: piece.color,
          type: piece.preview ? "preview" : "piece",
        };
        const x = piece.x + xOffset;
        const y = piece.y + yOffset;
        if (blockPositionValid(x, y, board)) {
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
    let newPiece = updatePiece(piece, { y: 1 });
    if (piecePositionValid(newPiece, board)) {
      piece = newPiece;
    } else {
      return piece;
    }
  }
};
const movePieceLeft = (piece: Piece) => updatePiece(piece, { x: -1 });
const movePieceRight = (piece: Piece) => updatePiece(piece, { x: 1 });
const movePieceDown = (piece: Piece) => updatePiece(piece, { y: 1 });
const rotatePiece = (piece: Piece) => updatePiece(piece, { rotationIndex: 1 });

interface GameState {
  piece: Piece;
  nextPiece: Piece;
  paused: boolean;
  gameOver: boolean;
  baseBoard: BoardData;
}

function Game(): ReactElement {
  const initialBoard = useMemo(() => emptyBoard(BOARD_WIDTH, BOARD_HEIGHT), []);
  const initialPiece = useMemo(makePiece, [makePiece]);
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
    <div>
      <div>{paused ? "Paused" : "Press P to pause"}</div>
      <div>{gameOver ? "GAME OVER, MAN! GAME OVER!" : ""}</div>
      <div>
        <Board
          blockSize={BLOCK_SIZE}
          cellSpacing={CELL_SPACING}
          board={board}
        />
        <Board
          blockSize={BLOCK_SIZE}
          cellSpacing={CELL_SPACING}
          board={nextPiecePreviewBoard}
        />
      </div>
    </div>
  );
}

export default Game;
