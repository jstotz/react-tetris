import { useHotkey } from "@react-hook/hotkey";
import React, { ReactElement, useMemo, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  BoardData,
  calculateScore,
  makeEmptyBoard,
  makePieceDropPreview,
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
import { ThemeContext, THEMES } from "../ThemeContext";
import Board from "./Board";

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

const makeRandomPieceCentered = () => makeRandomPiece({ x: 4 });

function Game(): ReactElement {
  const [themeId, setTheme] = useLocalStorage("themeId", "light");
  const theme = THEMES[themeId] || THEMES.light;
  const initialBoard = useMemo(
    () => makeEmptyBoard(BOARD_WIDTH, BOARD_HEIGHT),
    []
  );
  const initialPiece = useMemo(makeRandomPieceCentered, []);
  const initialNextPiece = useMemo(makeRandomPieceCentered, []);
  const defaultInitialGameState = {
    piece: initialPiece,
    nextPiece: initialNextPiece,
    gameOver: false,
    paused: false,
    baseBoard: initialBoard,
    score: 0,
  };

  const [initialGameState, setSavedGameState] = useLocalStorage(
    "gameState",
    defaultInitialGameState
  );

  const [gameState, setState] = useState<GameState>(initialGameState);
  const { gameOver, paused, piece, baseBoard, score } = gameState;

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
  };

  // Auto-piece drop interval
  useInterval(() => setState(tick), DROP_INTERVAL);

  const pieceDropPreview = makePieceDropPreview(piece, baseBoard);
  const board = renderPiece(pieceDropPreview, renderPiece(piece, baseBoard));

  const nextThemeId = themeId === "dark" ? "light" : "dark";

  return (
    <ThemeContext.Provider value={theme}>
      <>
        <div style={{ height: "5%" }}>
          <button onClick={() => setTheme(nextThemeId)}>
            {nextThemeId === "dark" ? "Dark Mode" : "Light Mode"}
          </button>
          <button onClick={saveGameState}>Save Game State</button>
          <button
            onClick={() => {
              resetSavedGameState();
              window.location.reload();
            }}
          >
            Reset Game State
          </button>
          <div>{paused ? "Paused" : "Press P to pause"}</div>
          <div>
            <strong>Score:</strong> {score}
          </div>
          <div>{gameOver ? "GAME OVER, MAN! GAME OVER!" : ""}</div>
        </div>
        <div style={{ height: "95%" }}>
          <Board board={board} />
        </div>
      </>
    </ThemeContext.Provider>
  );
}

export default Game;
