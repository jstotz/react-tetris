import { mapValues } from "lodash";
import React, { useContext, useMemo } from "react";
import { stylesheet } from "typestyle";
import { GameContext } from "../GameContext";
import useFitWithAspectRatio from "../hooks/useFitWithAspectRatio";
import { BoardData } from "../lib/core";

const Board = ({ board }: { board: BoardData }) => {
  const { ref, width, height } = useFitWithAspectRatio<HTMLDivElement>(
    board.width,
    board.height
  );
  const [{ theme }] = useContext(GameContext);
  const { grid } = board;

  const sheet = useMemo(
    () =>
      stylesheet({
        container: {
          width: "100%",
          height: "100%",
        },
        grid: {
          display: "grid",
          gap: "2px 2px",
          gridAutoRows: "1fr",
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
    <div ref={ref} className={sheet.container}>
      <div className={sheet.grid} style={{ width, height }}>
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
    </div>
  );
};

export default Board;
