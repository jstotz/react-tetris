import React, { ReactElement } from "react";
import useGame from "../hooks/useGame";
import useTheme from "../hooks/useTheme";
import { makePieceDropPreview, renderPiece } from "../lib/core";
import { ThemeContext, THEMES } from "../ThemeContext";
import Board from "./Board";

function Game(): ReactElement {
  const [theme, setTheme] = useTheme();

  const {
    gameState: { gameOver, paused, piece, baseBoard, score },
    resetSavedGameState,
    saveGameState,
    reset,
  } = useGame();

  const pieceDropPreview = makePieceDropPreview(piece, baseBoard);
  const board = renderPiece(pieceDropPreview, renderPiece(piece, baseBoard));

  const nextThemeId = theme === THEMES.dark ? "light" : "dark";

  return (
    <ThemeContext.Provider value={theme}>
      <>
        <div style={{ height: "5%" }}>
          <button onClick={() => setTheme(nextThemeId)}>
            {nextThemeId === "dark" ? "Dark Mode" : "Light Mode"}
          </button>
          <button onClick={saveGameState}>Save Game State</button>
          <button onClick={resetSavedGameState}>Reset Game State</button>
          <div>{paused ? "Paused" : "Press P to pause"}</div>
          <div>
            <strong>Score:</strong> {score}
          </div>
          <div>
            {gameOver ? (
              <>
                Game Over <button onClick={reset}>New Game</button>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        <div style={{ height: "95%" }}>
          <Board board={board} />
        </div>
      </>
    </ThemeContext.Provider>
  );
}

export default Game;
