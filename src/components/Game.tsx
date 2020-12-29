import React, { ReactElement, useMemo } from "react";
import Modal from "react-modal";
import { stylesheet } from "typestyle";
import { GameContext } from "../GameContext";
import useGame from "../hooks/useGame";
import Board from "./Board";
import Settings from "./Settings";

function Game(): ReactElement {
  const [data, dispatch] = useGame();
  const { gameOver, paused, board, score, settingsOpen } = data;

  const sheet = useMemo(
    () =>
      stylesheet({
        topBar: {
          height: "5%",
          padding: "1em",
        },
        boardContainer: {
          height: "95%",
          padding: "1em",
        },
      }),
    []
  );

  return (
    <GameContext.Provider value={[data, dispatch]}>
      <>
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
      </>
    </GameContext.Provider>
  );
}

export default Game;
