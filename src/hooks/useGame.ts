import { useHotkey } from "@react-hook/hotkey";
import { useReducer } from "react";
import {
  BoardData,
  calculateScore,
  makeEmptyBoard,
  makeRandomPiece,
  movePieceDown,
  movePieceLeft,
  movePieceRight,
  movePieceToBottom,
  Piece,
  piecePositionValid,
  removeCompletedRows,
  renderPiece,
  rotatePiece,
} from "../lib/core";
import { useInterval } from "./useInterval";
import { useLocalStorage } from "./useLocalStorage";

const BOARD_WIDTH = 10; // blocks
const BOARD_HEIGHT = 20; // blocks
const DROP_INTERVAL = 800; // ms

interface GameState {
  piece: Piece;
  nextPiece: Piece;
  paused: boolean;
  gameOver: boolean;
  baseBoard: BoardData;
  score: number;
}

interface UseGameReturnValues {
  gameState: GameState;
  resetSavedGameState: () => void;
  saveGameState: () => void;
}

// TODO: Refactor to avoid hard coded value
const makeRandomPieceCentered = () => makeRandomPiece({ x: 4 });

function tick(state: GameState): GameState {
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
  let { board, completedRowCount } = removeCompletedRows(
    renderPiece(state.piece, baseBoard)
  );
  baseBoard = board;
  state.score += calculateScore(completedRowCount);

  // If the next piece can't be placed, the game is over
  if (!piecePositionValid(piece, baseBoard)) {
    return { ...state, piece, baseBoard, gameOver: true };
  }

  return {
    ...state,
    piece,
    nextPiece: makeRandomPieceCentered(),
    baseBoard: baseBoard,
  };
}

const canMovePiece = (state: GameState): boolean =>
  !state.paused && !state.gameOver;

const movePieceIfValid = (
  state: GameState,
  moveFn: (piece: Piece, board: BoardData) => Piece
): GameState => {
  if (!canMovePiece(state)) {
    return state;
  }
  const newPiece = moveFn(state.piece, state.baseBoard);
  if (!piecePositionValid(newPiece, state.baseBoard)) {
    return state;
  }
  return { ...state, piece: newPiece };
};

type Action =
  | { type: "tick" }
  | { type: "reset" }
  | { type: "rotate" }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "moveDown" }
  | { type: "hardDrop" }
  | { type: "togglePaused" };

function newGameState(boardWidth: number, boardHeight: number): GameState {
  return {
    piece: makeRandomPieceCentered(),
    nextPiece: makeRandomPieceCentered(),
    gameOver: false,
    paused: false,
    baseBoard: makeEmptyBoard(boardWidth, boardHeight),
    score: 0,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "tick":
      return tick(state);
    case "reset":
      return newGameState(state.baseBoard.width, state.baseBoard.height);
    case "rotate":
      return movePieceIfValid(state, rotatePiece);
    case "moveLeft":
      return movePieceIfValid(state, movePieceLeft);
    case "moveRight":
      return movePieceIfValid(state, movePieceRight);
    case "moveDown":
      return movePieceIfValid(state, movePieceDown);
    case "hardDrop":
      return tick(movePieceIfValid(state, movePieceToBottom));
    case "togglePaused":
      return { ...state, paused: !state.paused };
  }
}

export default function useGame(): UseGameReturnValues {
  const [initialGameState, setSavedGameState] = useLocalStorage(
    "gameState",
    newGameState(BOARD_WIDTH, BOARD_HEIGHT)
  );

  const [gameState, dispatch] = useReducer(reducer, initialGameState);

  const saveGameState = () => setSavedGameState(gameState);
  const resetSavedGameState = () => {
    setSavedGameState(null);
    dispatch({ type: "reset" });
  };

  useHotkey(window, "up", () => dispatch({ type: "rotate" }));
  useHotkey(window, "down", () => dispatch({ type: "moveDown" }));
  useHotkey(window, "left", () => dispatch({ type: "moveLeft" }));
  useHotkey(window, "right", () => dispatch({ type: "moveRight" }));
  useHotkey(window, "space", () => dispatch({ type: "hardDrop" }));
  useHotkey(window, "p", () => dispatch({ type: "togglePaused" }));
  useHotkey(window, "s", saveGameState);
  useHotkey(window, "r", resetSavedGameState);
  useInterval(() => dispatch({ type: "tick" }), DROP_INTERVAL);

  return { gameState, saveGameState, resetSavedGameState };
}
