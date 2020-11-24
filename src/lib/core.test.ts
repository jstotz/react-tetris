import { gridToString } from "../components/Game";
import { Piece, rotateGrid } from "./core";
import { definePiece, I, J } from "./pieces";

export type Block = 1 | 0;

function expectRotationSequence(piece: Piece, rotations: Block[][][]) {
  const pieces = rotations.map((definition) =>
    definePiece(definition, piece.shape)
  );
  for (let i = 0; i < pieces.length - 1; i++) {
    const original = pieces[i].grid;
    const rotated = rotateGrid(original);
    const expected = pieces[i + 1].grid;
    expect(gridToString(rotated)).toEqual(gridToString(expected));
  }
}

describe("rotatePiece", () => {
  test("rotation sequence", () => {
    expectRotationSequence(J, [
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ]);

    expectRotationSequence(I, [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ]);
  });
});
