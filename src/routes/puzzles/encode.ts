import type { PuzzleSpec } from "./types";

/** Encode a puzzle spec into the `code` param the play app expects. */
export function encodePuzzleSpec(spec: PuzzleSpec): string {
  const json = JSON.stringify({ version: 1, ...spec });
  let binary = "";
  for (const byte of new TextEncoder().encode(json)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=+$/, "");
}

const PLAY_URL = import.meta.env.DEV
  ? "http://localhost:4000/play"
  : "https://brainforge-puzzles.fly.dev/play";

/** Link to play a puzzle in the play app. */
export function getPlayUrl(spec: PuzzleSpec): string {
  return `${PLAY_URL}?code=${encodeURIComponent(encodePuzzleSpec(spec))}`;
}
