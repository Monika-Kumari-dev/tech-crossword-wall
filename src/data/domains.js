import allPuzzles from "./puzzles.js";

export const domains = ["All domains", "AI", "Coding", "Engineering", "Intuit / GED"];

export function getDomainPuzzles(domain) {
  const words = domain === "All domains"
    ? allPuzzles
    : allPuzzles.filter((word) => word.theme === domain);
  const firstRow = Math.min(...words.map((word) => word.row));
  const firstCol = Math.min(...words.map((word) => word.col));
  return words.map((word) => ({
    ...word,
    row: word.row - firstRow,
    col: word.col - firstCol,
  }));
}
