import React, { ReactElement, useContext } from "react";
import { BoardData, Cell } from "../lib/core";
import { Theme, ThemeContext } from "../ThemeContext";
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
  const theme = useContext(ThemeContext);
  const { grid } = board;

  const blocks = [] as ReactElement[];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      blocks.push(
        <div
          key={`${x},${y}`}
          style={{
            backgroundColor: cellColor(cell, theme),
          }}
        />
      );
    });
  });

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${board.width}, 1fr)`,
      }}
    >
      {blocks}
    </div>
  );
};

export default Board;
