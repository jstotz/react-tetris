import mapValues from "lodash/mapValues";
import React, { useContext, useMemo, useRef } from "react";
import { SwipeCallback, useSwipeable } from "react-swipeable";
import { stylesheet } from "typestyle";
import { GameContext } from "../GameContext";
import useFitWithAspectRatio from "../hooks/useFitWithAspectRatio";
import { BoardData } from "../lib/core";

const Board = ({ board }: { board: BoardData }) => {
  const { ref, width, height } = useFitWithAspectRatio<HTMLDivElement>(
    board.width,
    board.height
  );
  const [{ theme }, dispatch] = useContext(GameContext);
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

  const lastMovedXRef = useRef<number>();

  const handleLeftRightSwipe: SwipeCallback = ({ dir, event }) => {
    // Ignore accidental left/right move during hard drop or rotate
    if (dir !== "Right" && dir !== "Left") {
      return;
    }

    const { clientX } = "touches" in event ? event.touches[0] : event;

    if (lastMovedXRef.current === undefined) {
      lastMovedXRef.current = clientX;
    }

    const deltaXSinceLastMove = lastMovedXRef.current - clientX;
    const threshold = width / board.width / 4;

    let moveDir: "left" | "right" | null = null;

    console.log(deltaXSinceLastMove, threshold);

    if (deltaXSinceLastMove >= threshold) {
      moveDir = "left";
    } else if (deltaXSinceLastMove <= -threshold) {
      moveDir = "right";
    }

    if (moveDir !== null) {
      lastMovedXRef.current = clientX;
      dispatch({ type: "movePiece", move: moveDir });
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => dispatch({ type: "movePiece", move: "rotate" }),
    onTap: () => dispatch({ type: "movePiece", move: "rotate" }),
    onSwipedDown: () => dispatch({ type: "movePiece", move: "hardDrop" }),
    onSwiping: handleLeftRightSwipe,
  });

  return (
    <div ref={ref} className={sheet.container}>
      <div className={sheet.container} {...swipeHandlers}>
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
    </div>
  );
};

export default Board;
