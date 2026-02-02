import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { COLORS } from "../config/colors";

/**
 * Theme toggle button component
 * Can be placed in header/navbar to allow users to switch between dark/light themes
 */
export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${mode === 'dark' 
          ? `${COLORS.button.secondary} ${COLORS.button.secondaryHover} ${COLORS.text.secondary}`
          : `${COLORS.button.primary} ${COLORS.button.primaryHover} ${COLORS.text.primary}`
        }
      `}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
    >
      {mode === 'dark' ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
