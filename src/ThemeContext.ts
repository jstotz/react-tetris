import randomColor from "randomcolor";
import { createContext } from "react";
import { PieceShape } from "./lib/core";

export type Theme = {
  emptyCellColor: string;
  previewColor: string;
  pieceColors: {
    [key in PieceShape]: string;
  };
};

export const LIGHT_THEME: Theme = {
  emptyCellColor: "#cccccc",
  previewColor: "#dddddd",
  pieceColors: {
    J: randomColor({ luminosity: "bright" }),
    T: randomColor({ luminosity: "bright" }),
    I: randomColor({ luminosity: "bright" }),
    L: randomColor({ luminosity: "bright" }),
    S: randomColor({ luminosity: "bright" }),
    Z: randomColor({ luminosity: "bright" }),
    O: randomColor({ luminosity: "bright" }),
  },
};

export const DARK_THEME: Theme = {
  emptyCellColor: "#1c1c1c",
  previewColor: "#363636",
  pieceColors: {
    J: randomColor({ luminosity: "dark" }),
    T: randomColor({ luminosity: "dark" }),
    I: randomColor({ luminosity: "dark" }),
    L: randomColor({ luminosity: "dark" }),
    S: randomColor({ luminosity: "dark" }),
    Z: randomColor({ luminosity: "dark" }),
    O: randomColor({ luminosity: "dark" }),
  },
};

export const ThemeContext = createContext(LIGHT_THEME);