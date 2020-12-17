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

export interface State {
  game: GameState;
  config: Config;
  themeId: ThemeId;
  settingsOpen: boolean;
}

export interface UseGameReturnedData extends State, GameState {
  theme: Theme;
}

export type UseGameReturnedValue = [
  UseGameReturnedData,
  React.Dispatch<Action>
];

// TODO: Refactor to avoid hard coded value
const makeRandomPieceCentered = () => makeRandomPiece({ x: 4 });

function tick(
  game: GameState,
  exec: EffectReducerExec<State, Action, Effect>
): GameState {
  if (!canMovePiece(game)) {
    return game;
  }

  let { baseBoard } = game;

  // Attempt to move the current piece down
  let piece = movePieceDown(game.piece);
  if (piecePositionValid(piece, baseBoard)) {
    return { ...game, piece };
  }

  // Couldn't move existing piece down so freeze it, clear any completed rows
  // and attempt to add a new piece
  piece = game.nextPiece;
  let { board, completedRowCount } = removeCompletedRows(
    renderPiece(game.piece, baseBoard)
  );
  baseBoard = board;

  if (completedRowCount === 4) {
    exec({ type: "playSound", soundId: "tetris" });
  } else if (completedRowCount > 0) {
    exec({ type: "playSound", soundId: "linesCleared" });
  }

  game.score += calculateScore(completedRowCount);

  // If the next piece can't be placed, the game is over
  if (!piecePositionValid(piece, baseBoard)) {
    return { ...game, piece, baseBoard, gameOver: true };
  }

  return {
    ...game,
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
    game: newGameState(config),
    config: config,
    themeId: "light",
    settingsOpen: false,
  };
}

export function newGameData(config: Config = newConfig()): UseGameReturnedData {
  const state = newState(config);
  return { ...state, ...state.game, theme: THEMES[state.themeId] };
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
  | { type: "saveGame" }
  | { type: "loadGame"; game: GameState }
  | { type: "restoreSavedGame" }
  | { type: "clearSavedGame" }
  | { type: "setTheme"; themeId: ThemeId }
  | { type: "openSettings" }
  | { type: "closeSettings" };

export type Effect =
  | { type: "saveGame"; game: GameState | null }
  | { type: "saveTheme"; themeId: ThemeId | null }
  | { type: "restoreSavedGame" }
  | { type: "playSound"; soundId: SoundId };

const reducer: EffectReducer<State, Action, Effect> = (
  state,
  action,
  exec
): State => {
  switch (action.type) {
    case "tick":
      return { ...state, game: tick(state.game, exec) };
    case "loadGame":
      return { ...state, game: action.game };
    case "restoreSavedGame":
      exec({ type: "restoreSavedGame" });
      return state;
    case "reset":
      return {
        ...state,
        game: newGameState(state.config),
      };
    case "rotate":
      return { ...state, game: movePieceIfValid(state.game, rotatePiece) };
    case "moveLeft":
      return { ...state, game: movePieceIfValid(state.game, movePieceLeft) };
    case "moveRight":
      return { ...state, game: movePieceIfValid(state.game, movePieceRight) };
    case "moveDown":
      return { ...state, game: movePieceIfValid(state.game, movePieceDown) };
    case "hardDrop":
      return {
        ...state,
        game: tick(movePieceIfValid(state.game, movePieceToBottom), exec),
      };
    case "togglePaused":
      return { ...state, game: { ...state.game, paused: !state.game.paused } };
    case "openSettings":
      return { ...state, settingsOpen: true };
    case "closeSettings":
      return { ...state, settingsOpen: false };
    case "saveGame":
      exec({ type: "saveGame", game: state.game });
      return state;
    case "setTheme":
      exec({ type: "saveTheme", themeId: action.themeId });
      return { ...state, themeId: action.themeId };
    case "clearSavedGame":
      exec({ type: "saveGame", game: null });
      return {
        ...state,
        game: newGameState(state.config),
      };
  }
};

export default function useGame(): UseGameReturnedValue {
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

  const effectsMap: EffectsMap<State, Action, Effect> = {
    playSound: (_, { soundId: sound }) => sounds[sound].play(),
    saveGame: (_, { game }) => saveGameState(game),
    saveTheme: (_, { themeId }) => saveTheme(themeId),
    restoreSavedGame: (_, __, _dispatch) =>
      _dispatch({ type: "loadGame", game: initialGameState }),
  };

  const [state, dispatch] = useEffectReducer<State, Action, Effect>(
    reducer,
    { ...newState(config), game: initialGameState, themeId: initialThemeId },
    effectsMap
  );

  useHotkey(window, "up", () => dispatch({ type: "rotate" }));
  useHotkey(window, "down", () => dispatch({ type: "moveDown" }));
  useHotkey(window, "left", () => dispatch({ type: "moveLeft" }));
  useHotkey(window, "right", () => dispatch({ type: "moveRight" }));
  useHotkey(window, "space", () => dispatch({ type: "hardDrop" }));
  useHotkey(window, "p", () => dispatch({ type: "togglePaused" }));
  useHotkey(window, "s", () => dispatch({ type: "saveGame" }));
  useHotkey(window, "r", () => dispatch({ type: "clearSavedGame" }));
  useInterval(() => dispatch({ type: "tick" }), DROP_INTERVAL);

  return [{ ...state, ...state.game, theme: THEMES[state.themeId] }, dispatch];
}
