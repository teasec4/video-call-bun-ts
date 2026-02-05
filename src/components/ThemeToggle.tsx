import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { colorStyles, createButtonHoverHandler } from "../config/styles";

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();
  
  const btnStyle = mode === 'dark' 
    ? { ...colorStyles.buttonSecondary }
    : { ...colorStyles.buttonPrimary };
  
  const hoverHandler = mode === 'dark'
    ? createButtonHoverHandler('var(--btn-secondary)', 'var(--btn-secondary-hover)')
    : createButtonHoverHandler('var(--btn-primary)', 'var(--btn-primary-hover)');

  return (
    <button
      onClick={toggleTheme}
      style={btnStyle}
      {...hoverHandler}
      className="p-2 rounded-lg transition-all duration-200"
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
