import { useHotkey } from "@react-hook/hotkey";
import produce from "immer";
import { defaults, random, times } from "lodash";
import randomColor from "randomcolor";
import React, { ReactElement, useMemo, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import PIECES, { PieceBlocks } from "../pieces";
import Board, { BoardCells, Cell } from "./Board";

const PIECE_COLORS = randomColor({
  count: PIECES.length,
  luminosity: "bright",
});
const BOARD_WIDTH = 10; // blocks
const BOARD_HEIGHT = 20; // blocks
const BLOCK_SIZE = 10;
const CELL_SPACING = 1;
const DROP_INTERVAL = 800; // ms

interface Piece {
  x: number;
  y: number;
  type: number;
  rotationIndex: number;
  blocks: PieceBlocks;
  color: string;
  preview: boolean;
}

export function logBoard(board: BoardCells) {
  const rowText = board.map((row) =>
    row.map((cell) => (cell ? "■" : "□")).join(" ")
  );
  console.log(rowText.join("\n"));
}

export function logPiece(piece: Piece) {
  const rowText = piece.blocks.map((row) =>
    row.map((cell) => (cell ? "■" : "□")).join(" ")
  );
  console.log(rowText.join("\n"));
}

const emptyRow = (): Cell[] =>
  times(BOARD_WIDTH, () => ({ type: "empty", color: "#eee" }));
const emptyBoard = (): BoardCells => times(BOARD_HEIGHT, emptyRow);

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

function makePieceDropPreview(piece: Piece, board: BoardCells): Piece {
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

function cellOccupied(cell: Cell) {
  return cell.type === "piece";
}

// Returns copy of the given board with completed rows removed
function removeCompletedRows(board: BoardCells) {
  let result = board.filter((row) => !row.every(cellOccupied));
  if (result.length < BOARD_HEIGHT) {
    const newEmptyRows = times(BOARD_HEIGHT - result.length, emptyRow);
    result = newEmptyRows.concat(result);
  }
  return result;
}

function blockPositionValid(x: number, y: number, board: BoardCells) {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
    return false;
  }
  if (cellOccupied(board[y][x])) {
    return false;
  }
  return true;
}

function piecePositionValid(piece: Piece, board: BoardCells): boolean {
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
function boardWithPiece(board: BoardCells, piece: Piece): BoardCells {
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
          newBoard[y][x] = cell;
        }
      });
    });
  });
}

// Returns a new board with the piece rendered in the given position.
// Removes any completed rows. If new piece position is invalid, returns false.
function makeBoard(piece: Piece, board: BoardCells): BoardCells {
  let newBoard = board ? board : emptyBoard();
  newBoard = removeCompletedRows(newBoard);
  return piece ? boardWithPiece(newBoard, piece) : newBoard;
}

const movePieceToBottom = (piece: Piece, board: BoardCells) => {
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
  paused: boolean;
  gameOver: boolean;
  baseBoard: BoardCells;
}

function Game(): ReactElement {
  const initialBoard = useMemo(emptyBoard, [emptyBoard]);
  const initialPiece = useMemo(makePiece, [makePiece]);

  const [{ gameOver, paused, piece, baseBoard }, setState] = useState<
    GameState
  >({
    piece: initialPiece,
    gameOver: false,
    paused: false,
    baseBoard: initialBoard,
  });

  const canMovePiece = (state: GameState): boolean =>
    state.piece !== null && !state.paused && !state.gameOver;

  const movePieceIfValid = (
    moveFn: (piece: Piece, board: BoardCells) => Piece
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
      piece = makePiece();
      if (!piecePositionValid(piece, baseBoard)) {
        return { ...state, piece, gameOver: true };
      }

      return { ...state, piece, baseBoard: makeBoard(state.piece, baseBoard) };
    });
  }, DROP_INTERVAL);

  const board = makeBoard(piece, baseBoard);
  const pieceDropPreview = makePieceDropPreview(piece, baseBoard);
  const boardWithPreview = makeBoard(pieceDropPreview, board);

  return (
    <div>
      <div>{paused ? "Paused" : "Press P to pause"}</div>
      <div>{gameOver ? "GAME OVER, MAN! GAME OVER!" : ""}</div>
      <div>
        <Board
          width={BOARD_WIDTH}
          height={BOARD_HEIGHT}
          blockSize={BLOCK_SIZE}
          cellSpacing={CELL_SPACING}
          board={boardWithPreview}
        />
      </div>
    </div>
  );
}

export default Game;
