import { useDarkMode } from "../../hooks/useDarkMode";

export const ThemeToggle = () => {
    const [darkMode, setDarkMode] = useDarkMode();

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-gray-200 dark:bg-gray-800 rounded"
        >
            {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
    );
};
