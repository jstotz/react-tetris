import produce from "immer";
import keydrown from "keydrown";
import { defaults, random, times } from "lodash";
import randomColor from "randomcolor";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
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

interface Piece {
  x: number;
  y: number;
  type: number;
  rotationIndex: number;
  blocks: PieceBlocks;
  color: string;
}

export function logBoard(board: BoardCells) {
  if (!board) {
    console.error("Invalid board:", board);
    return;
  }
  const rowText = board.map((row) =>
    row.map((cell) => (cell ? "■" : "□")).join(" ")
  );
  console.log(rowText.join("\n"));
}

const emptyRow = (): Cell[] => times(BOARD_WIDTH, () => null);
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
  };
}
interface PieceDeltas {
  x?: number;
  y?: number;
  rotationIndex?: number;
}

function updatePiece(prevPiece: Piece, specifiedDeltas: PieceDeltas): Piece {
  const deltas = defaults(specifiedDeltas, {
    x: 0,
    y: 0,
    rotationIndex: 0,
  });
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

// Returns copy of the given board with completed rows removed
function removeCompletedRows(board: BoardCells) {
  let result = board.filter((row) => !row.every((cell) => cell !== null));
  if (result.length < BOARD_HEIGHT) {
    const newEmptyRows = times(BOARD_HEIGHT - result.length, emptyRow);
    result = newEmptyRows.concat(result);
  }
  return result;
}

function piecePositionValid(piece: Piece, board: BoardCells): boolean {
  for (let yOffset = 0; yOffset < piece.blocks.length; yOffset++) {
    for (let xOffset = 0; xOffset < piece.blocks[yOffset].length; xOffset++) {
      const [x, y] = [xOffset + piece.x, yOffset + piece.y];
      const blockIsVisible = piece.blocks[yOffset][xOffset] === 1;
      if (!blockIsVisible) {
        continue;
      }
      if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
        return false;
      }
      if (board[y][x] == null) {
        return false;
      }
    }
  }
  return true;
}

// Returns a copy of the given board with the piece rendered into it
function boardWithPiece(board: BoardCells, piece: Piece): BoardCells {
  if (!piecePositionValid(piece, board)) {
    throw new Error("Cannot render board. New piece position invalid.");
  }

  return produce(board, (newBoard) => {
    piece.blocks.forEach((row, yOffset) => {
      row.forEach((blockIsVisible, xOffset) => {
        if (!blockIsVisible) return;
        const cell: Cell = {
          color: piece.color,
        };
        newBoard[piece.y + yOffset][piece.x + xOffset] = cell;
      });
    });
  });
}

// Returns a new board with the piece rendered in the given position.
// Removes any completed rows. If new piece position is invalid, returns false.
function makeBoard({
  piece,
  board,
}: {
  piece: Piece | null;
  board: BoardCells;
}): BoardCells {
  let newBoard = board ? board : emptyBoard();
  newBoard = removeCompletedRows(newBoard);
  return piece ? boardWithPiece(newBoard, piece) : newBoard;
}

const movePieceLeft = (piece: Piece) => updatePiece(piece, { x: -1 });
const movePieceRight = (piece: Piece) => updatePiece(piece, { x: 1 });
const movePieceDown = (piece: Piece) => updatePiece(piece, { y: 1 });
const rotatePiece = (piece: Piece) => updatePiece(piece, { rotationIndex: 1 });

interface GameState {
  piece: Piece | null;
  paused: boolean;
  gameOver: boolean;
  baseBoard: BoardCells;
}

function Game(): ReactElement {
  const initialBoard = useMemo(emptyBoard, [emptyBoard]);

  const [{ gameOver, paused, piece, baseBoard }, setState] = useState<
    GameState
  >({
    piece: null,
    gameOver: false,
    paused: false,
    baseBoard: initialBoard,
  });

  //   console.log(
  //     "addPiece: calling setPiece because a piece was successfully added"
  //   );
  //   setPiece(piece);
  //   setB(piece);
  // } else {
  //   console.log(
  //     "addPiece: calling setState because a piece was added but there was no room and the game is over"
  //   );
  //   setGameOver(true);

  useEffect(() => {
    const addPiece = () => {
      setState((prevState) => {
        let newState = { ...prevState };
        if (prevState.piece) {
          newState.baseBoard = makeBoard({
            piece: prevState.piece,
            board: prevState.baseBoard,
          });
        }
        const newPiece = makePiece();
        if (!piecePositionValid(newPiece, newState.baseBoard)) {
          newState.gameOver = true;
        }
        return newState;
      });
    };
    const movePieceIfValid = (
      moveFn: (piece: Piece) => Piece,
      onInvalid?: () => void
    ): void => {
      setState((state) => {
        if (state.paused) return state;
        if (state.piece === null) return state;
        const newPiece = moveFn(state.piece);
        if (!piecePositionValid(newPiece, state.baseBoard)) {
          if (onInvalid) onInvalid();
          return state;
        }
        return { ...state, piece: newPiece };
      });
    };

    const hardDropPiece = () => {
      times(BOARD_HEIGHT, () => {
        movePieceIfValid(movePieceDown, addPiece);
      });
      addPiece();
    };

    const handleMovePiece = () => {
      if (keydrown.RIGHT.isDown()) movePieceIfValid(movePieceRight);
      if (keydrown.LEFT.isDown()) movePieceIfValid(movePieceLeft);
      if (keydrown.DOWN.isDown()) movePieceIfValid(movePieceDown);
    };

    const listenForUserInput = () => {
      keydrown.UP.press(() => movePieceIfValid(rotatePiece));
      keydrown.SPACE.press(hardDropPiece);
      keydrown.P.press(() => {
        console.log("setting state because pause key pressed");
        setState((state) => {
          return { ...state, paused: !state.paused };
        });
      });

      setInterval(handleMovePiece, 100);
    };

    const startAutoPieceDrop = () => {
      const drop = () => {
        movePieceIfValid(movePieceDown, addPiece);
      };
      setInterval(drop, 800);
    };

    console.log("initial setup effect fired");
    addPiece();
    keydrown.run(keydrown.tick);
    listenForUserInput();
    startAutoPieceDrop();
  }, []);

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
          cells={makeBoard({ piece: piece, board: baseBoard })}
        />
      </div>
    </div>
  );
}

export default Game;
