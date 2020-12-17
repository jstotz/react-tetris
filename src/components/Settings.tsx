import React, { useContext } from "react";
import { GameContext } from "../GameContext";
import THEMES from "../themes";

export default function Settings() {
  const [{ theme }, dispatch] = useContext(GameContext);

  const nextThemeId = theme === THEMES.dark ? "light" : "dark";

  return (
    <>
      <button
        onClick={() => {
          dispatch({ type: "setTheme", themeId: nextThemeId });
          dispatch({ type: "closeSettings" });
        }}
      >
        {nextThemeId === "dark" ? "Dark Mode" : "Light Mode"}
      </button>
      <button
        onClick={() => {
          dispatch({ type: "save" });
          dispatch({ type: "closeSettings" });
        }}
      >
        Save Game State
      </button>
      <button
        onClick={() => {
          dispatch({ type: "restoreSaved" });
          dispatch({ type: "closeSettings" });
        }}
      >
        Restore Saved Game State
      </button>
      <button
        onClick={() => {
          dispatch({ type: "clearSaved" });
          dispatch({ type: "closeSettings" });
        }}
      >
        Clear Saved Game State
      </button>
    </>
  );
}
