import React, { useContext } from "react";
import { GameContext } from "../GameContext";
import { BoardData, Cell } from "../lib/core";
import { Theme } from "../themes";
import styles from "./Board.module.css";

function cellColor(cell: Cell, theme: Theme): string {
  switch (cell.type) {
    case "empty":
      return theme.emptyCellColor;
    case "preview":
      return theme.previewColor;
    case "piece":
      return theme.pieceColors[cell.shape];
  }
}

const Board = ({ board }: { board: BoardData }) => {
  const [{ theme }] = useContext(GameContext);
  const { grid } = board;

  return (
    <div
      className={styles.board}
      style={{
        height: "100%",
        width: "100%",
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
        gridTemplateRows: `repeat(${board.height}, 1fr)`,
      }}
    >
      {grid.flatMap((row, y) =>
        row.flatMap((cell, x) => (
          <div
            key={`${x},${y}`}
            style={{
              backgroundColor: cellColor(cell, theme),
            }}
          ></div>
        ))
      )}
    </div>
  );
};

export default Board;
