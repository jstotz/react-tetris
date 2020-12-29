import { useHotkey } from "@react-hook/hotkey";
import produce, { Draft } from "immer";
import {
  EffectReducer,
  EffectReducerExec,
  EffectsMap,
  useEffectReducer,
} from "use-effect-reducer";
import useSound from "use-sound";
import {
  BoardData,
  calculateScore,
  movePieceDown,
  movePieceLeft,
  movePieceRight,
  movePieceToBottom,
  newEmptyBoard,
  newRandomPieceCentered,
  Piece,
  piecePositionValid,
  removeCompletedRows,
  renderPiece,
  renderPieceWithDropPreview,
  rotatePiece,
} from "../lib/core";
import { SoundId, soundSpriteMap, soundSpriteUrl } from "../sounds/sprite";
import THEMES, { Theme, ThemeId } from "../themes";
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

interface Config {
  boardWidth: number;
  boardHeight: number;
}

interface State {
  game: GameState;
  config: Config;
  themeId: ThemeId;
  settingsOpen: boolean;
}

interface UseGameReturnedData extends State, GameState {
  theme: Theme;
  board: BoardData;
}

export type UseGameReturnedValue = [
  UseGameReturnedData,
  React.Dispatch<Action>
];

// TODO: Refactor to avoid hard coded value
function tick(
  state: State,
  draft: Draft<State>,
  exec: EffectReducerExec<State, Action, Effect>
) {
  const { game } = state;

  // If game is over or paused, do nothing
  if (!gameIsActive(state)) {
    return;
  }

  // Attempt to move the current piece down
  let newPiece = movePieceDown(game.piece);
  if (piecePositionValid(newPiece, game.baseBoard)) {
    draft.game.piece = newPiece;
    return;
  }

  // Couldn't move existing piece down so lock it into position
  // and clear completed rows
  let { board, completedRowCount } = removeCompletedRows(
    renderPiece(game.piece, game.baseBoard)
  );
  draft.game.baseBoard = board;

  if (completedRowCount === 4) {
    exec({ type: "playSound", soundId: "tetris" });
  } else if (completedRowCount > 0) {
    exec({ type: "playSound", soundId: "linesCleared" });
  }
  draft.game.score += calculateScore(completedRowCount);

  draft.game.piece = game.nextPiece;
  draft.game.nextPiece = newRandomPieceCentered(board.width);
  draft.game.baseBoard = board;

  if (!piecePositionValid(game.nextPiece, board)) {
    draft.game.gameOver = true;
  }
}

const gameIsActive = ({ game, settingsOpen }: State): boolean =>
  !game.paused && !game.gameOver && !settingsOpen;

const movePieceIfValid = (
  state: State,
  draft: Draft<State>,
  moveFn: (piece: Piece, board: BoardData) => Piece
) => {
  const { game } = state;
  if (!gameIsActive(state)) {
    return;
  }
  const newPiece = moveFn(game.piece, game.baseBoard);
  if (piecePositionValid(newPiece, game.baseBoard)) {
    draft.game.piece = newPiece;
  }
};

function newGameState(config: Config): GameState {
  return {
    piece: newRandomPieceCentered(config.boardWidth),
    nextPiece: newRandomPieceCentered(config.boardWidth),
    gameOver: false,
    paused: false,
    baseBoard: newEmptyBoard(config.boardWidth, config.boardHeight),
    score: 0,
  };
}

function newState(config: Config): State {
  return {
    game: newGameState(config),
    config: config,
    themeId: "light",
    settingsOpen: false,
  };
}

export function newGameData(
  config: Config = newConfig(),
  state: State = newState(config)
): UseGameReturnedData {
  return {
    ...state,
    ...state.game,
    theme: THEMES[state.themeId],
    board: renderPieceWithDropPreview(state.game.piece, state.game.baseBoard),
  };
}

function newConfig(
  boardWidth: number = BOARD_WIDTH,
  boardHeight: number = BOARD_HEIGHT
): Config {
  return { boardWidth, boardHeight };
}

const pieceMoves = {
  left: movePieceLeft,
  right: movePieceRight,
  down: movePieceDown,
  rotate: rotatePiece,
  hardDrop: movePieceToBottom,
};

type PieceMove = keyof typeof pieceMoves;

type Action =
  | { type: "tick" }
  | { type: "reset" }
  | { type: "movePiece"; move: PieceMove }
  | { type: "togglePaused" }
  | { type: "saveGame" }
  | { type: "loadGame"; game: GameState }
  | { type: "restoreSavedGame" }
  | { type: "clearSavedGame" }
  | { type: "setTheme"; themeId: ThemeId }
  | { type: "openSettings" }
  | { type: "closeSettings" };

type Effect =
  | { type: "saveGame"; game: GameState | null }
  | { type: "saveTheme"; themeId: ThemeId | null }
  | { type: "restoreSavedGame" }
  | { type: "playSound"; soundId: SoundId };

const reducer: EffectReducer<State, Action, Effect> = (
  state,
  action,
  exec
): State => {
  return produce(state, (draft) => {
    switch (action.type) {
      case "tick":
        tick(state, draft, exec);
        break;
      case "loadGame":
        draft.game = action.game;
        break;
      case "restoreSavedGame":
        exec({ type: "restoreSavedGame" });
        break;
      case "reset":
        draft.game = newGameState(state.config);
        break;
      case "movePiece":
        movePieceIfValid(state, draft, pieceMoves[action.move]);
        if (action.move === "hardDrop") {
          tick(draft, draft, exec);
        }
        break;
      case "togglePaused":
        draft.game.paused = !state.game.paused;
        break;
      case "openSettings":
        draft.settingsOpen = true;
        break;
      case "closeSettings":
        draft.settingsOpen = false;
        break;
      case "saveGame":
        exec({ type: "saveGame", game: state.game });
        break;
      case "setTheme":
        draft.themeId = action.themeId;
        exec({ type: "saveTheme", themeId: action.themeId });
        break;
      case "clearSavedGame":
        exec({ type: "saveGame", game: null });
        draft.game = newGameState(state.config);
        break;
    }
  });
};

export default function useGame(): UseGameReturnedValue {
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
    playSound: (_, { soundId }) => playSound({ id: soundId }),
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

  const [playSound] = useSound(soundSpriteUrl, {
    soundEnabled: gameIsActive(state),
    sprite: soundSpriteMap,
  });

  const movePiece = (move: PieceMove) => dispatch({ type: "movePiece", move });

  useHotkey(window, "up", () => movePiece("rotate"));
  useHotkey(window, "down", () => movePiece("down"));
  useHotkey(window, "left", () => movePiece("left"));
  useHotkey(window, "right", () => movePiece("right"));
  useHotkey(window, "space", () => movePiece("hardDrop"));
  useHotkey(window, "p", () => dispatch({ type: "togglePaused" }));
  useHotkey(window, "s", () => dispatch({ type: "saveGame" }));
  useHotkey(window, "r", () => dispatch({ type: "clearSavedGame" }));
  useInterval(() => dispatch({ type: "tick" }), DROP_INTERVAL);

  return [newGameData(config, state), dispatch];
}
