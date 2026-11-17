import { useEffect, useState } from "react";

export default function DisplayControls({ zoom, onZoomChange }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = async () => {
    setMessage("");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        setMessage("Use your browser’s full-screen option to hide the address bar.");
      }
    } catch {
      setMessage("Full screen is unavailable. Use your browser’s full-screen option.");
    }
  };

  return (
    <aside className="display-controls" aria-label="TV display controls">
      <div className="display-controls-buttons">
        <button type="button" aria-label="Zoom out" disabled={zoom <= 50} onClick={() => onZoomChange(Math.max(50, zoom - 10))}>−</button>
        <button type="button" aria-label="Reset zoom to 100 percent" title="Reset zoom" onClick={() => onZoomChange(100)}>{zoom}%</button>
        <button type="button" aria-label="Zoom in" disabled={zoom >= 150} onClick={() => onZoomChange(Math.min(150, zoom + 10))}>+</button>
        <button type="button" onClick={toggleFullscreen}>{fullscreen ? "Exit full screen" : "TV full screen"}</button>
      </div>
      {message && <p role="status">{message}</p>}
    </aside>
  );
}
