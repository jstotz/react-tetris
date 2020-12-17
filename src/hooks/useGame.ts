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
import THEMES, { Theme, ThemeId } from "../themes";
import { useInterval } from "./useInterval";
import { useLocalStorage } from "./useLocalStorage";
import useSounds, { SoundId } from "./useSounds";

const BOARD_WIDTH = 10; // blocks
const BOARD_HEIGHT = 20; // blocks
const DROP_INTERVAL = 800; // ms

export interface GameState {
  piece: Piece;
  nextPiece: Piece;
  paused: boolean;
  gameOver: boolean;
  baseBoard: BoardData;
  score: number;
}

export interface Config {
  boardWidth: number;
  boardHeight: number;
}

export interface State extends GameState {
  config: Config;
  themeId: ThemeId;
  settingsOpen: boolean;
}

// TODO: Refactor to avoid hard coded value
const makeRandomPieceCentered = () => makeRandomPiece({ x: 4 });

function tick(
  state: State,
  exec: EffectReducerExec<State, Action, Effect>
): State {
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
    exec({ type: "playSound", soundId: "tetris" });
  } else if (completedRowCount > 0) {
    exec({ type: "playSound", soundId: "linesCleared" });
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
  state: State,
  moveFn: (piece: Piece, board: BoardData) => Piece
): State => {
  if (!canMovePiece(state)) {
    return state;
  }
  const newPiece = moveFn(state.piece, state.baseBoard);
  if (!piecePositionValid(newPiece, state.baseBoard)) {
    return state;
  }
  return { ...state, piece: newPiece };
};

export function newGameState(config: Config): GameState {
  return {
    piece: makeRandomPieceCentered(),
    nextPiece: makeRandomPieceCentered(),
    gameOver: false,
    paused: false,
    baseBoard: makeEmptyBoard(config.boardWidth, config.boardHeight),
    score: 0,
  };
}

export function newState(config: Config): State {
  return {
    ...newGameState(config),
    config: config,
    themeId: "light",
    settingsOpen: false,
  };
}

export function newGameData(config: Config = newConfig()): GameData {
  const state = newState(config);
  return { ...state, theme: THEMES[state.themeId] };
}

export function newConfig(
  boardWidth: number = BOARD_WIDTH,
  boardHeight: number = BOARD_HEIGHT
): Config {
  return { boardWidth, boardHeight };
}

export type Action =
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
  | { type: "clearSaved" }
  | { type: "setTheme"; themeId: ThemeId }
  | { type: "openSettings" }
  | { type: "closeSettings" };

export type Effect =
  | { type: "saveGameState"; state: GameState | null }
  | { type: "saveTheme"; themeId: ThemeId | null }
  | { type: "restoreSaved" }
  | { type: "playSound"; soundId: SoundId };

const reducer: EffectReducer<State, Action, Effect> = (
  state,
  action,
  exec
): State => {
  switch (action.type) {
    case "tick":
      return tick(state, exec);
    case "load":
      return { ...state, ...action.state };
    case "restoreSaved":
      exec({ type: "restoreSaved" });
      return state;
    case "reset":
      return {
        ...state,
        ...newGameState(state.config),
      };
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
    case "openSettings":
      return { ...state, settingsOpen: true };
    case "closeSettings":
      return { ...state, settingsOpen: false };
    case "save":
      exec({ type: "saveGameState", state: state });
      return state;
    case "setTheme":
      exec({ type: "saveTheme", themeId: action.themeId });
      return { ...state, themeId: action.themeId };
    case "clearSaved":
      exec({ type: "saveGameState", state: null });
      return {
        ...state,
        ...newGameState(state.config),
      };
  }
};

export interface GameData extends State {
  theme: Theme;
}

export default function useGame(): [GameData, React.Dispatch<Action>] {
  const sounds = useSounds();

  const config = newConfig();

  const [initialGameState, saveGameState] = useLocalStorage<GameState>(
    "gameState",
    newGameState(config)
  );

  const [initialThemeId, saveTheme] = useLocalStorage<ThemeId>(
    "theme",
    "light"
  );

  const effectsMap: EffectsMap<GameState, Action, Effect> = {
    playSound: (_, { soundId: sound }) => sounds[sound].play(),
    saveGameState: (_, { state }) => saveGameState(state),
    saveTheme: (_, { themeId }) => saveTheme(themeId),
    restoreSaved: (_, __, _dispatch) =>
      _dispatch({ type: "load", state: initialGameState }),
  };

  const [state, dispatch] = useEffectReducer<State, Action, Effect>(
    reducer,
    { ...newState(config), ...initialGameState, themeId: initialThemeId },
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

  return [{ ...state, theme: THEMES[state.themeId] }, dispatch];
}
