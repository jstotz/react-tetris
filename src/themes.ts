import randomColor from "randomcolor";
import { PieceShape } from "./lib/core";

export type Theme = {
  emptyCellColor: string;
  previewColor: string;
  pieceColors: {
    [key in PieceShape]: string;
  };
};

const THEMES = {
  light: {
    emptyCellColor: "#eeeeee",
    previewColor: "#cccccc",
    pieceColors: {
      J: randomColor({ luminosity: "bright" }),
      T: randomColor({ luminosity: "bright" }),
      I: randomColor({ luminosity: "bright" }),
      L: randomColor({ luminosity: "bright" }),
      S: randomColor({ luminosity: "bright" }),
      Z: randomColor({ luminosity: "bright" }),
      O: randomColor({ luminosity: "bright" }),
    },
  } as Theme,
  dark: {
    emptyCellColor: "#333333",
    previewColor: "#555555",
    pieceColors: {
      J: randomColor({ luminosity: "dark" }),
      T: randomColor({ luminosity: "dark" }),
      I: randomColor({ luminosity: "dark" }),
      L: randomColor({ luminosity: "dark" }),
      S: randomColor({ luminosity: "dark" }),
      Z: randomColor({ luminosity: "dark" }),
      O: randomColor({ luminosity: "dark" }),
    },
  } as Theme,
};

export type ThemeId = keyof typeof THEMES;

export default THEMES;
