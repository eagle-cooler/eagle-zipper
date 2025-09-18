import { useState, useEffect } from "react";
import { ArchiveViewer } from "./viewer";

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  // Sync with Eagle's theme if available
  useEffect(() => {
    if (typeof eagle !== 'undefined' && eagle.app) {
      const isDark = eagle.app.isDarkColors();
      setMode(isDark ? "dark" : "light");
      
      // Listen for theme changes
      if (eagle.event && eagle.event.onThemeChanged) {
        eagle.event.onThemeChanged((theme) => {
          setMode(theme === 'DARK' ? "dark" : "light");
        });
      }
    }
  }, []);

  return (
    <div data-theme={mode} className="w-full h-screen">
      <ArchiveViewer />
    </div>
  );
}

export default App;
