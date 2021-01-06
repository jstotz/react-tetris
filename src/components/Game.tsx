import { color } from "csx";
import React, { ReactElement, useMemo } from "react";
import Modal from "react-modal";
import { stylesheet } from "typestyle";
import { GameContext } from "../GameContext";
import useGame from "../hooks/useGame";
import Board from "./Board";
import Settings from "./Settings";

function Game(): ReactElement {
  const [data, dispatch] = useGame();
  const { gameOver, paused, board, score, settingsOpen, theme } = data;

  const sheet = useMemo(
    () =>
      stylesheet({
        container: {
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          width: "100%",
          height: "100%",
          touchAction: "none",
          $nest: {
            "@media screen and (hover: none)": {
              "-webkit-touch-callout": "none",
              "-webkit-user-select": "none",
            },
          },
        },
        topBar: {
          height: "10%",
          padding: "1em",
        },
        boardContainer: {
          height: "90%",
          padding: "1em",
        },
      }),
    [theme]
  );

  return (
    <GameContext.Provider value={[data, dispatch]}>
      <div className={sheet.container}>
        <div className={sheet.topBar}>
          <div>
            {paused ? "Paused" : "Press P to pause"}
            <button onClick={() => dispatch({ type: "openSettings" })}>
              Settings
            </button>
          </div>
          <div>
            <strong>Score:</strong> {score}
          </div>
          <Modal
            isOpen={settingsOpen}
            contentLabel="Settings"
            onRequestClose={() => dispatch({ type: "closeSettings" })}
            style={{
              content: { backgroundColor: theme.backgroundColor },
              overlay: {
                backgroundColor: color(theme.backgroundColor)
                  .fadeOut("10%")
                  .toString(),
              },
            }}
          >
            <Settings />
          </Modal>
          <div>
            {gameOver ? (
              <>
                Game Over{" "}
                <button onClick={() => dispatch({ type: "reset" })}>
                  New Game
                </button>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className={sheet.boardContainer}>
          <Board board={board} />
        </div>
      </div>
    </GameContext.Provider>
  );
}

export default Game;
