import { Grid, Piece, PieceShape } from "./core";

export function definePiece(
  definition: Array<Array<1 | 0>>,
  shape: PieceShape
): Piece {
  const grid: Grid = definition.map((row) =>
    row.map((block) =>
      block === 0 ? { type: "empty" } : { type: "piece", shape: shape }
    )
  );
  return {
    x: 0,
    y: 0,
    shape,
    grid,
    preview: false,
  };
}

export const J = definePiece(
  [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  "J"
);

export const L = definePiece(
  [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  "L"
);

export const T = definePiece(
  [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  "T"
);

export const I = definePiece(
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  "I"
);

export const O = definePiece(
  [
    [1, 1],
    [1, 1],
  ],
  "O"
);

export const S = definePiece(
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  "S"
);

export const Z = definePiece(
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  "Z"
);

const pieces: Array<Piece> = [J, T, L, I, S, Z, O];

export default pieces;
