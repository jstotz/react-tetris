import { createContext } from "react";
import { Action, GameData, newGameData } from "./hooks/useGame";

export type Context = [GameData, React.Dispatch<Action>];

export const GameContext = createContext<Context>([newGameData(), () => {}]);
