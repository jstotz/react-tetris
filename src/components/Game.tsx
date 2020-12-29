import React, { ReactElement } from "react";
import Modal from "react-modal";
import { GameContext } from "../GameContext";
import useGame from "../hooks/useGame";
import Board from "./Board";
import Settings from "./Settings";

function Game(): ReactElement {
  const [data, dispatch] = useGame();
  const { gameOver, paused, board, score, settingsOpen } = data;

  return (
    <GameContext.Provider value={[data, dispatch]}>
      <>
        <div style={{ height: "5%" }}>
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
        <div style={{ height: "95%" }}>
          <Board board={board} />
        </div>
      </>
    </GameContext.Provider>
  );
}

export default Game;
