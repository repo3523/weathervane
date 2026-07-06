import { createContext, useContext } from "react";
import { WOLF_THEME } from "./themes.js";

export const ThemeContext = createContext(WOLF_THEME);
export const useTheme = () => useContext(ThemeContext);
