// SVG path data for every icon used in the app (ported from the original shared.js).
const PATHS = {
  "dashboard": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/>",
  "complaints": "<path d=\"M9 4h11v14l-4-3H9z\"/><path d=\"M4 9v9l3-2h6\"/>",
  "plus": "<path d=\"M12 5v14M5 12h14\"/>",
  "announcement": "<path d=\"M3 11v2a1 1 0 0 0 1 1h2l4 4V6l-4 4H4a1 1 0 0 0-1 1z\"/><path d=\"M16 8a4 4 0 0 1 0 8\"/>",
  "gate": "<path d=\"M4 21V7l8-4 8 4v14\"/><path d=\"M9 21v-6h6v6\"/><path d=\"M4 11h16\"/>",
  "feedback": "<path d=\"M12 17.3 6.2 21l1.4-6.4L2.5 9.7l6.5-.6L12 3l3 6.1 6.5.6-4.9 4.9 1.4 6.4z\"/>",
  "history": "<path d=\"M3 12a9 9 0 1 0 3-6.7\"/><path d=\"M3 4v5h5\"/><path d=\"M12 7v5l3 3\"/>",
  "profile": "<circle cx=\"12\" cy=\"8\" r=\"3.3\"/><path d=\"M5 20c1-4 4.5-6 7-6s6 2 7 6\"/>",
  "settings": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z\"/>",
  "logout": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><path d=\"M16 17l5-5-5-5\"/><path d=\"M21 12H9\"/>",
  "calendar": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M16 3v4M8 3v4M3 10h18\"/>",
  "location": "<path d=\"M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z\"/><circle cx=\"12\" cy=\"9.5\" r=\"2.3\"/>",
  "user": "<circle cx=\"12\" cy=\"8\" r=\"3.3\"/><path d=\"M5 20c1-4 4.5-6 7-6s6 2 7 6\"/>",
  "image": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><circle cx=\"8.5\" cy=\"9.5\" r=\"1.5\"/><path d=\"M21 16l-5.5-5.5L4 21\"/>",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M21 21l-4.3-4.3\"/>",
  "chevron": "<path d=\"M9 6l6 6-6 6\"/>",
  "chevronDown": "<path d=\"M6 9l6 6 6-6\"/>",
  "check": "<path d=\"M5 12l5 5L19 8\"/>",
  "x": "<path d=\"M18 6L6 18M6 6l12 12\"/>",
  "star": "<path d=\"M12 17.3 6.2 21l1.4-6.4L2.5 9.7l6.5-.6L12 3l3 6.1 6.5.6-4.9 4.9 1.4 6.4z\"/>",
  "menu": "<path d=\"M3 6h18M3 12h18M3 18h18\"/>",
  "eye": "<path d=\"M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "eyeOff": "<path d=\"M17.9 17.9A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 5-5.9M9.9 4.2A9.6 9.6 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2\"/><path d=\"M2 2l20 20\"/>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4.2\"/><path d=\"M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8\"/>",
  "moon": "<path d=\"M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z\"/>"
};

export default function Icon({ name, size = 18, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, pointerEvents: "none", ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] || "" }}
    />
  );
}
