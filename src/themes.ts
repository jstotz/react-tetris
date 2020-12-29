import { PieceShape } from "./lib/core";

export type Theme = {
  emptyColor: string;
  previewColor: string;
  pieceColors: {
    [key in PieceShape]: string;
  };
};

const THEMES = {
  light: {
    emptyColor: "rgb(234, 234, 234)",
    previewColor: "rgb(174, 174, 174)",
    pieceColors: {
      J: "rgb(238, 123, 48)",
      T: "rgb(48, 102, 190)",
      L: "rgb(107, 170, 117)",
      I: "rgb(181, 68, 110)",
      S: "rgb(255, 236, 81)",
      Z: "rgb(191, 188, 203)",
      O: "rgb(120, 192, 224)",
    },
  } as Theme,
  dark: {
    emptyColor: "rgb(51, 51, 51)",
    previewColor: "rgb(85, 85, 85)",
    pieceColors: {
      J: "rgb(239, 197, 170)",
      T: "rgb(158, 186, 232)",
      L: "rgb(182, 211, 187)",
      I: "rgb(216, 159, 180)",
      S: "rgb(244, 236, 179)",
      Z: "rgb(213, 208, 231)",
      O: "rgb(183, 231, 252)",
    },
  } as Theme,
};

export type ThemeId = keyof typeof THEMES;

export default THEMES;
