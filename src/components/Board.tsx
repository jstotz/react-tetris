import { mapValues } from "lodash";
import React, { useContext, useMemo } from "react";
import { stylesheet } from "typestyle";
import { GameContext } from "../GameContext";
import { BoardData } from "../lib/core";

const Board = ({ board }: { board: BoardData }) => {
  const [{ theme }] = useContext(GameContext);
  const { grid } = board;

  const sheet = useMemo(
    () =>
      stylesheet({
        board: {
          display: "grid",
          gap: "2px 2px",
          gridAutoRows: "1fr",
          height: "100%",
          width: "100%",
          gridTemplateColumns: `repeat(${board.width}, 1fr)`,
          gridTemplateRows: `repeat(${board.height}, 1fr)`,
        },
        empty: { backgroundColor: theme.emptyColor },
        preview: { backgroundColor: theme.previewColor },
        ...mapValues(theme.pieceColors, (color) => ({
          backgroundColor: color,
        })),
      }),
    [
      board.width,
      board.height,
      theme.emptyColor,
      theme.previewColor,
      theme.pieceColors,
    ]
  );

  return (
    <div className={sheet.board}>
      {grid.flatMap((row, y) =>
        row.flatMap((cell, x) => (
          <div
            key={`${x},${y}`}
            className={
              cell.type === "piece" ? sheet[cell.shape] : sheet[cell.type]
            }
          ></div>
        ))
      )}
    </div>
  );
};

export default Board;
