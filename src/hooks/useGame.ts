import { useHotkey } from "@react-hook/hotkey";
import {
  EffectReducer,
  EffectReducerExec,
  EffectsMap,
  useEffectReducer,
} from "use-effect-reducer";
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
import useSounds, { SoundKey } from "./useSounds";

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

// TODO: Refactor to avoid hard coded value
const makeRandomPieceCentered = () => makeRandomPiece({ x: 4 });

function tick(
  state: GameState,
  exec: EffectReducerExec<GameState, Action, Effect>
): GameState {
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

  if (completedRowCount === 4) {
    exec({ type: "playSound", sound: "tetris" });
  } else if (completedRowCount > 0) {
    exec({ type: "playSound", sound: "linesCleared" });
  }

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

type Action =
  | { type: "tick" }
  | { type: "reset" }
  | { type: "rotate" }
  | { type: "moveLeft" }
  | { type: "moveRight" }
  | { type: "moveDown" }
  | { type: "hardDrop" }
  | { type: "togglePaused" }
  | { type: "save" }
  | { type: "restoreSaved" }
  | { type: "load"; state: GameState }
  | { type: "clearSaved" };

type Effect =
  | { type: "save"; state: GameState | null }
  | { type: "restoreSaved" }
  | { type: "playSound"; sound: SoundKey };

const reducer: EffectReducer<GameState, Action, Effect> = function reducer(
  state,
  action,
  exec
): GameState {
  switch (action.type) {
    case "tick":
      return tick(state, exec);
    case "load":
      return action.state;
    case "restoreSaved":
      exec({ type: "restoreSaved" });
      return state;
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
      return tick(movePieceIfValid(state, movePieceToBottom), exec);
    case "togglePaused":
      return { ...state, paused: !state.paused };
    case "save":
      exec({ type: "save", state: state });
      return state;
    case "clearSaved":
      exec({ type: "save", state: null });
      return newGameState(state.baseBoard.width, state.baseBoard.height);
  }
};

export default function useGame(): [GameState, (action: Action) => void] {
  const sounds = useSounds();

  const [initialGameState, setSavedGameState] = useLocalStorage(
    "gameState",
    newGameState(BOARD_WIDTH, BOARD_HEIGHT)
  );

  const effectsMap: EffectsMap<GameState, Action, Effect> = {
    playSound: (_, { sound }) => sounds[sound].play(),
    save: (_, { state }) => setSavedGameState(state),
    restoreSaved: (_, __, _dispatch) =>
      _dispatch({ type: "load", state: initialGameState }),
  };

  const [gameState, dispatch] = useEffectReducer(
    reducer,
    initialGameState,
    effectsMap
  );

  useHotkey(window, "up", () => dispatch({ type: "rotate" }));
  useHotkey(window, "down", () => dispatch({ type: "moveDown" }));
  useHotkey(window, "left", () => dispatch({ type: "moveLeft" }));
  useHotkey(window, "right", () => dispatch({ type: "moveRight" }));
  useHotkey(window, "space", () => dispatch({ type: "hardDrop" }));
  useHotkey(window, "p", () => dispatch({ type: "togglePaused" }));
  useHotkey(window, "s", () => dispatch({ type: "save" }));
  useHotkey(window, "r", () => dispatch({ type: "clearSaved" }));
  useInterval(() => dispatch({ type: "tick" }), DROP_INTERVAL);

  return [gameState, dispatch];
}
