
export const POINTS_PER_CORRECT_ANSWER = 10;

export function calculateAnswerPoints(isCorrect, alreadySolved) {
  if (!isCorrect || alreadySolved) {
    return 0;
  }

  return POINTS_PER_CORRECT_ANSWER;
}

const LEADERBOARD_KEY = "ged-fy27-crossword-leaderboard";

export function getLeaderboard() {
  const storedLeaderboard = localStorage.getItem(LEADERBOARD_KEY) || "[]";

  try {
    return JSON.parse(storedLeaderboard);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Unable to parse the saved leaderboard.", error);
      return [];
    }

    throw error;
  }
}

export function saveTeamResult(result) {
  const leaderboard = getLeaderboard();

  const updatedLeaderboard = [...leaderboard, result].sort(
    (a, b) => b.score - a.score || a.seconds - b.seconds
  );

  localStorage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify(updatedLeaderboard)
  );

  return updatedLeaderboard;
}

export function clearLeaderboard() {
  localStorage.removeItem(LEADERBOARD_KEY);
}
