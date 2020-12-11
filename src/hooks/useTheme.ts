import { Theme, THEMES } from "../ThemeContext";
import { useLocalStorage } from "./useLocalStorage";

export default function useTheme(): [Theme, (themeId: string) => void] {
  const [themeId, setTheme] = useLocalStorage("themeId", "light");
  const theme = THEMES[themeId] || THEMES.light;
  return [theme, setTheme];
}
