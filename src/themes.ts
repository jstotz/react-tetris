import colors from "open-color";
import { PieceShape } from "./lib/core";

export type Theme = {
  textColor: string;
  emptyColor: string;
  previewColor: string;
  backgroundColor: string;
  pieceColors: {
    [key in PieceShape]: string;
  };
};

export type ThemeId = "light" | "dark";

// Open Color variant index for piece colors
const lightIndex = 7;
const darkIndex = 1;

const THEMES: Record<ThemeId, Theme> = {
  light: {
    textColor: colors.gray[9],
    emptyColor: colors.gray[1],
    previewColor: colors.gray[3],
    backgroundColor: colors.white,
    pieceColors: {
      J: colors.pink[lightIndex],
      T: colors.grape[lightIndex],
      L: colors.violet[lightIndex],
      I: colors.blue[lightIndex],
      S: colors.orange[lightIndex],
      Z: colors.lime[lightIndex],
      O: colors.red[lightIndex],
    },
  },
  dark: {
    textColor: colors.gray[0],
    emptyColor: colors.gray[8],
    previewColor: colors.gray[7],
    backgroundColor: colors.gray[9],
    pieceColors: {
      J: colors.pink[darkIndex],
      T: colors.grape[darkIndex],
      L: colors.violet[darkIndex],
      I: colors.blue[darkIndex],
      S: colors.orange[darkIndex],
      Z: colors.lime[darkIndex],
      O: colors.yellow[darkIndex],
    },
  },
};

export default THEMES;
