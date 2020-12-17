import { createContext } from "react";
import { newGameData, UseGameReturnedValue } from "./hooks/useGame";

export const GameContext = createContext<UseGameReturnedValue>([
  newGameData(),
  () => {},
]);
